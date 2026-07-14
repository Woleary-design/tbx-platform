#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourceDirectory = resolve(process.argv[2] ?? ".");
const dryRun = process.argv.includes("--dry-run");
const batchSize = 300;
const enrichmentVersion = "atlas-gold-2.0";

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

async function loadCsv(filename) {
  const contents = await readFile(resolve(sourceDirectory, filename), "utf8");
  return parseCsv(contents.replace(/^\uFEFF/, ""));
}

function numberOrNull(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function baseSetNumber(setNumber) {
  return String(setNumber).replace(/-\d+$/, "");
}

async function main() {
  console.log(`Atlas Gold 2 source: ${sourceDirectory}`);
  console.log(dryRun ? "Dry run: database writes disabled." : "Live run: Atlas inventory enrichment will be applied.");

  const [inventoryRows, minifigureRows] = await Promise.all([
    loadCsv("inventories.csv"),
    loadCsv("inventory_minifigs.csv"),
  ]);

  const bestInventoryBySet = new Map();

  for (const row of inventoryRows) {
    const id = numberOrNull(row.id);
    const version = numberOrNull(row.version) ?? 1;
    const setNumber = row.set_num?.trim();
    if (!id || !setNumber) continue;

    const current = bestInventoryBySet.get(setNumber);
    if (!current || version > current.version) bestInventoryBySet.set(setNumber, { id, version });
  }

  const countsByInventory = new Map();
  for (const row of minifigureRows) {
    const inventoryId = numberOrNull(row.inventory_id);
    const quantity = numberOrNull(row.quantity) ?? 0;
    if (!inventoryId || quantity < 0) continue;
    countsByInventory.set(inventoryId, (countsByInventory.get(inventoryId) ?? 0) + quantity);
  }

  const now = new Date().toISOString();
  const records = [];

  for (const [setNumber, inventory] of bestInventoryBySet.entries()) {
    const minifigureCount = countsByInventory.get(inventory.id) ?? 0;
    records.push({
      set_number: setNumber,
      minifigure_count: minifigureCount,
      minifigure_source: "rebrickable",
      inventory_source: "rebrickable",
      inventory_source_version: inventory.version,
      instructions_url: `https://www.lego.com/service/buildinginstructions/${encodeURIComponent(baseSetNumber(setNumber))}`,
      instructions_source: "lego",
      enrichment_version: enrichmentVersion,
      last_inventory_sync_at: now,
      last_instructions_sync_at: now,
      enriched_at: now,
    });
  }

  const withMinifigures = records.filter((record) => record.minifigure_count > 0).length;
  console.log(`Parsed ${inventoryRows.length.toLocaleString()} inventories.`);
  console.log(`Parsed ${minifigureRows.length.toLocaleString()} inventory minifigure rows.`);
  console.log(`Prepared ${records.length.toLocaleString()} set enrichments.`);
  console.log(`Sets containing minifigures: ${withMinifigures.toLocaleString()}`);

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
      console.error(`Enrichment failed at records ${start + 1}-${start + batch.length}: ${error.message}`);
      process.exit(1);
    }

    console.log(`Enriched ${Math.min(start + batch.length, records.length).toLocaleString()} / ${records.length.toLocaleString()}`);
  }

  console.log("Atlas Gold 2 inventory enrichment complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
