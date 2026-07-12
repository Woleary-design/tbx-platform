import { createClient } from "@supabase/supabase-js";
import { gunzipSync } from "node:zlib";

const DEFAULT_SETS_URL = "https://cdn.rebrickable.com/media/downloads/sets.csv.gz";
const DEFAULT_THEMES_URL = "https://cdn.rebrickable.com/media/downloads/themes.csv.gz";
const BATCH_SIZE = 500;

function requiredEnv(name, fallbacks = []) {
  const keys = [name, ...fallbacks];
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  throw new Error(`Missing required environment variable: ${keys.join(" or ")}`);
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  if (!headers) return [];

  return dataRows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

async function downloadCsv(url, label) {
  console.log(`Downloading ${label} from ${url}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "The Block Exchange Atlas Importer/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Could not download ${label}: ${response.status} ${response.statusText}`);
  }

  const compressed = Buffer.from(await response.arrayBuffer());
  const csv = gunzipSync(compressed).toString("utf8");
  const records = parseCsv(csv);
  console.log(`Loaded ${records.length.toLocaleString()} ${label} records`);
  return records;
}

function resolveTheme(themeId, themesById) {
  const path = [];
  const visited = new Set();
  let current = themesById.get(String(themeId));

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.name);
    current = current.parent_id ? themesById.get(current.parent_id) : null;
  }

  return {
    theme: path[0] || "Uncategorised",
    subtheme: path.length > 1 ? path.slice(1).join(" / ") : null,
  };
}

function canonicalSetNumber(sourceSetNumber) {
  const trimmed = sourceSetNumber.trim();
  return trimmed.endsWith("-1") ? trimmed.slice(0, -2) : trimmed;
}

function toInteger(value) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function findCanonicalCollisions(rows) {
  const seen = new Set();
  const collisions = new Set();

  for (const row of rows) {
    if (seen.has(row.set_number)) collisions.add(row.set_number);
    seen.add(row.set_number);
  }

  return [...collisions];
}

async function main() {
  const setsUrl = process.env.REBRICKABLE_SETS_URL?.trim() || DEFAULT_SETS_URL;
  const themesUrl = process.env.REBRICKABLE_THEMES_URL?.trim() || DEFAULT_THEMES_URL;
  const dryRun = process.env.ATLAS_IMPORT_DRY_RUN === "true";
  const limit = toInteger(process.env.ATLAS_IMPORT_LIMIT || "");

  const [themes, sets] = await Promise.all([
    downloadCsv(themesUrl, "themes"),
    downloadCsv(setsUrl, "sets"),
  ]);

  const themesById = new Map(
    themes.map((theme) => [
      String(theme.id),
      {
        id: String(theme.id),
        name: theme.name?.trim() || "Uncategorised",
        parent_id: theme.parent_id?.trim() || null,
      },
    ]),
  );

  const sourceSets = limit ? sets.slice(0, limit) : sets;
  const importedAt = new Date().toISOString();
  const catalogueRows = sourceSets
    .filter((set) => set.set_num?.trim() && set.name?.trim())
    .map((set) => {
      const { theme, subtheme } = resolveTheme(set.theme_id, themesById);
      const sourceSetNumber = set.set_num.trim();

      return {
        set_number: canonicalSetNumber(sourceSetNumber),
        name: set.name.trim(),
        theme,
        subtheme,
        year_released: toInteger(set.year),
        piece_count: toInteger(set.num_parts),
        image_url: set.img_url?.trim() || null,
        external_source: "rebrickable",
        external_id: sourceSetNumber,
        is_active: true,
        updated_at: importedAt,
      };
    });

  const collisions = findCanonicalCollisions(catalogueRows);
  if (collisions.length > 0) {
    throw new Error(
      `Import aborted: canonical set-number collisions found (${collisions.slice(0, 10).join(", ")})`,
    );
  }

  console.log(`Prepared ${catalogueRows.length.toLocaleString()} Atlas records`);

  if (dryRun) {
    console.log("Dry run complete; no database writes were made.");
    return;
  }

  const supabaseUrl = requiredEnv("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let processed = 0;
  for (let start = 0; start < catalogueRows.length; start += BATCH_SIZE) {
    const batch = catalogueRows.slice(start, start + BATCH_SIZE);
    const { error } = await supabase
      .from("lego_sets")
      .upsert(batch, { onConflict: "set_number", ignoreDuplicates: false });

    if (error) {
      throw new Error(`Atlas import failed near row ${start + 1}: ${error.message}`);
    }

    processed += batch.length;
    console.log(`Imported ${processed.toLocaleString()} / ${catalogueRows.length.toLocaleString()}`);
  }

  console.log(`Atlas catalogue import complete: ${processed.toLocaleString()} records upserted.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
