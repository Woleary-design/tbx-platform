import { createClient } from "@supabase/supabase-js";
import { gunzipSync } from "node:zlib";

const DOWNLOAD_BASE = "https://cdn.rebrickable.com/media/downloads/";
const DEFAULT_SETS_URL = `${DOWNLOAD_BASE}sets.csv.gz`;
const DEFAULT_THEMES_URL = `${DOWNLOAD_BASE}themes.csv.gz`;
const DEFAULT_MINIFIGS_URL = `${DOWNLOAD_BASE}minifigs.csv.gz`;
const DEFAULT_INVENTORIES_URL = `${DOWNLOAD_BASE}inventories.csv.gz`;
const DEFAULT_INVENTORY_MINIFIGS_URL = `${DOWNLOAD_BASE}inventory_minifigs.csv.gz`;
const BATCH_SIZE = 500;
const EXCLUDED_TOP_LEVEL_THEMES = new Set(["Books", "Gear"]);

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
      } else if (character === '"') quoted = false;
      else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function downloadCsv(url, label) {
  console.log(`Downloading ${label} from ${url}`);
  const response = await fetch(url, { headers: { "User-Agent": "The Block Exchange Atlas Importer/2.0" } });
  if (!response.ok) throw new Error(`Could not download ${label}: ${response.status} ${response.statusText}`);
  const compressed = Buffer.from(await response.arrayBuffer());
  const records = parseCsv(gunzipSync(compressed).toString("utf8"));
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
  return { theme: path[0] || "Uncategorised", subtheme: path.length > 1 ? path.slice(1).join(" / ") : null };
}

function isBuildableCatalogueRecord(theme) { return !EXCLUDED_TOP_LEVEL_THEMES.has(theme); }
function canonicalSetNumber(sourceSetNumber) { const trimmed = sourceSetNumber.trim(); return trimmed.endsWith("-1") ? trimmed.slice(0, -2) : trimmed; }
function toInteger(value) { if (!value) return null; const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) ? parsed : null; }

function findCanonicalCollisions(rows) {
  const seen = new Set();
  const collisions = new Set();
  for (const row of rows) { if (seen.has(row.set_number)) collisions.add(row.set_number); seen.add(row.set_number); }
  return [...collisions];
}

async function upsertBatches(supabase, table, rows, onConflict, label) {
  let processed = 0;
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict, ignoreDuplicates: false });
    if (error) throw new Error(`${label} import failed near row ${start + 1}: ${error.message}`);
    processed += batch.length;
    console.log(`Imported ${processed.toLocaleString()} / ${rows.length.toLocaleString()} ${label}`);
  }
  return processed;
}

async function main() {
  const setsUrl = process.env.REBRICKABLE_SETS_URL?.trim() || DEFAULT_SETS_URL;
  const themesUrl = process.env.REBRICKABLE_THEMES_URL?.trim() || DEFAULT_THEMES_URL;
  const minifigsUrl = process.env.REBRICKABLE_MINIFIGS_URL?.trim() || DEFAULT_MINIFIGS_URL;
  const inventoriesUrl = process.env.REBRICKABLE_INVENTORIES_URL?.trim() || DEFAULT_INVENTORIES_URL;
  const inventoryMinifigsUrl = process.env.REBRICKABLE_INVENTORY_MINIFIGS_URL?.trim() || DEFAULT_INVENTORY_MINIFIGS_URL;
  const dryRun = process.env.ATLAS_IMPORT_DRY_RUN === "true";
  const limit = toInteger(process.env.ATLAS_IMPORT_LIMIT || "");

  const [themes, sets, minifigs, inventories, inventoryMinifigs] = await Promise.all([
    downloadCsv(themesUrl, "themes"),
    downloadCsv(setsUrl, "sets"),
    downloadCsv(minifigsUrl, "minifigures"),
    downloadCsv(inventoriesUrl, "inventories"),
    downloadCsv(inventoryMinifigsUrl, "inventory minifigures"),
  ]);

  const themesById = new Map(themes.map((theme) => [String(theme.id), { id: String(theme.id), name: theme.name?.trim() || "Uncategorised", parent_id: theme.parent_id?.trim() || null }]));
  const setSourceByNumber = new Map(sets.map((set) => [set.set_num?.trim(), set]));
  const inventorySetById = new Map(inventories.filter((row) => row.id && row.set_num).map((row) => [String(row.id), row.set_num.trim()]));
  const sourceSetsByFig = new Map();

  for (const link of inventoryMinifigs) {
    const figNum = link.fig_num?.trim();
    const sourceSet = inventorySetById.get(String(link.inventory_id));
    if (!figNum || !sourceSet || sourceSet.startsWith("fig-")) continue;
    const existing = sourceSetsByFig.get(figNum) ?? new Set();
    existing.add(canonicalSetNumber(sourceSet));
    sourceSetsByFig.set(figNum, existing);
  }

  const sourceSets = limit ? sets.slice(0, limit) : sets;
  const importedAt = new Date().toISOString();
  let excludedCount = 0;

  const catalogueRows = sourceSets.filter((set) => set.set_num?.trim() && set.name?.trim()).flatMap((set) => {
    const { theme, subtheme } = resolveTheme(set.theme_id, themesById);
    if (!isBuildableCatalogueRecord(theme)) { excludedCount += 1; return []; }
    const sourceSetNumber = set.set_num.trim();
    return [{
      set_number: canonicalSetNumber(sourceSetNumber), name: set.name.trim(), theme, subtheme,
      year_released: toInteger(set.year), piece_count: toInteger(set.num_parts), image_url: set.img_url?.trim() || null,
      external_source: "rebrickable", external_id: sourceSetNumber, is_active: true, updated_at: importedAt,
    }];
  });

  const collisions = findCanonicalCollisions(catalogueRows);
  if (collisions.length > 0) throw new Error(`Import aborted: canonical set-number collisions found (${collisions.slice(0, 10).join(", ")})`);

  const sourceMinifigs = limit ? minifigs.slice(0, limit) : minifigs;
  const minifigureRows = sourceMinifigs.filter((fig) => fig.fig_num?.trim() && fig.name?.trim()).map((fig) => {
    const catalogueId = fig.fig_num.trim();
    const sourceSetNumbers = [...(sourceSetsByFig.get(catalogueId) ?? new Set())].slice(0, 100);
    const firstSource = sourceSetNumbers.map((number) => setSourceByNumber.get(`${number}-1`) ?? setSourceByNumber.get(number)).find(Boolean);
    const themeInfo = firstSource ? resolveTheme(firstSource.theme_id, themesById) : { theme: null, subtheme: null };
    return {
      catalogue_id: catalogueId,
      name: fig.name.trim(),
      character_name: fig.name.trim(),
      theme: themeInfo.theme,
      subtheme: themeInfo.subtheme,
      year_released: firstSource ? toInteger(firstSource.year) : null,
      num_parts: toInteger(fig.num_parts),
      image_url: fig.img_url?.trim() || null,
      aliases: [],
      source_sets: sourceSetNumbers,
      external_ids: { rebrickable: catalogueId },
      source: "rebrickable",
      source_url: `https://rebrickable.com/minifigs/${encodeURIComponent(catalogueId)}/`,
      is_active: true,
      atlas_visibility: "public",
      updated_at: importedAt,
    };
  });

  console.log(`Excluded ${excludedCount.toLocaleString()} Books/Gear merchandise records`);
  console.log(`Prepared ${catalogueRows.length.toLocaleString()} buildable LEGO set records`);
  console.log(`Prepared ${minifigureRows.length.toLocaleString()} LEGO minifigure records`);

  if (dryRun) { console.log("Dry run complete; no database writes were made."); return; }

  const supabaseUrl = requiredEnv("SUPABASE_URL", ["NEXT_PUBLIC_SUPABASE_URL"]);
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (!limit) {
    const { error: refreshError } = await supabase.rpc("atlas_prepare_catalogue_refresh", { refresh_time: importedAt });
    if (refreshError) throw new Error(`Could not prepare the previous catalogue for refresh: ${refreshError.message}`);
    console.log("Marked previous Rebrickable set and minifigure catalogues inactive before rebuilding them.");
  }

  const setProcessed = await upsertBatches(supabase, "lego_sets", catalogueRows, "set_number", "sets");
  const figProcessed = await upsertBatches(supabase, "lego_minifigures", minifigureRows, "catalogue_id", "minifigures");
  console.log(`Atlas catalogue import complete: ${setProcessed.toLocaleString()} sets and ${figProcessed.toLocaleString()} minifigures active.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
