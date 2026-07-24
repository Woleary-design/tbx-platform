#!/usr/bin/env node

/**
 * Atlas Gold: Rebrickable bulk catalogue importer.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/atlas/import-rebrickable.mjs ./rebrickable
 *
 * Expected files in the directory:
 *   sets.csv
 *   themes.csv
 *
 * Download the official bulk CSV files from Rebrickable before running.
 * The importer enriches lego_sets in place and never touches collector-owned tables.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourceDirectory = resolve(process.argv[2] ?? ".");
const dryRun = process.argv.includes("--dry-run");
const batchSize = 500;

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...values] = rows;
  return values.map((columns) => Object.fromEntries(headers.map((header, index) => [header.trim(), columns[index] ?? ""])));
}

function integerOrNull(value) {
  if (value === "" || value == null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildThemePath(themeId, themes) {
  const current = themes.get(themeId);
  if (!current) return { theme: null, subtheme: null };

  if (!current.parentId) {
    return { theme: current.name, subtheme: null };
  }

  const parent = themes.get(current.parentId);
  if (!parent) return { theme: current.name, subtheme: null };

  // Rebrickable can nest themes more than one level deep. Atlas keeps the
  // highest meaningful parent as theme and the selected leaf as subtheme.
  let root = parent;
  while (root.parentId && themes.has(root.parentId)) root = themes.get(root.parentId);

  return {
    theme: root.name,
    subtheme: current.name === root.name ? null : current.name,
  };
}

async function loadCsv(filename) {
  const path = resolve(sourceDirectory, filename);
  const contents = await readFile(path, "utf8");
  return parseCsv(contents.replace(/^\uFEFF/, ""));
}

async function main() {
  console.log(`Atlas Gold import source: ${sourceDirectory}`);
  console.log(dryRun ? "Dry run: database writes disabled." : "Live run: catalogue records will be upserted.");

  const [themeRows, setRows] = await Promise.all([loadCsv("themes.csv"), loadCsv("sets.csv")]);
  const themes = new Map(
    themeRows.map((row) => [
      String(row.id),
      {
        name: row.name?.trim() || "Uncategorised",
        parentId: row.parent_id?.trim() || null,
      },
    ]),
  );

  const now = new Date().toISOString();
  const records = setRows
    .filter((row) => row.set_num && row.name)
    .map((row) => {
      const { theme, subtheme } = buildThemePath(String(row.theme_id), themes);
      return {
        set_number: row.set_num.trim(),
        name: row.name.trim(),
        year_released: integerOrNull(row.year),
        piece_count: integerOrNull(row.num_parts),
        theme,
        subtheme,
        image_url: row.img_url?.trim() || null,
        image_source: row.img_url ? "rebrickable" : null,
        data_source: "rebrickable",
        source_record_id: row.set_num.trim(),
        source_data: {
          rebrickable_theme_id: integerOrNull(row.theme_id),
          imported_from: "sets.csv",
        },
        source_updated_at: now,
        enriched_at: now,
        is_active: true,
      };
    });

  const missingImages = records.filter((record) => !record.image_url).length;
  const missingThemes = records.filter((record) => !record.theme).length;
  console.log(`Parsed ${records.length.toLocaleString()} sets.`);
  console.log(`Missing images: ${missingImages.toLocaleString()}`);
  console.log(`Missing themes: ${missingThemes.toLocaleString()}`);

  if (dryRun) return;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (let start = 0; start < records.length; start += batchSize) {
    const batch = records.slice(start, start + batchSize);
    const { error } = await supabase.from("lego_sets").upsert(batch, {
      onConflict: "set_number",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`Import failed at records ${start + 1}-${start + batch.length}: ${error.message}`);
      process.exit(1);
    }

    console.log(`Imported ${Math.min(start + batch.length, records.length).toLocaleString()} / ${records.length.toLocaleString()}`);
  }

  console.log("Atlas Gold Rebrickable import complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
