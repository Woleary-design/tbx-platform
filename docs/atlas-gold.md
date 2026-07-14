# Atlas Gold

Atlas Gold is TBX's catalogue quality and enrichment layer. It preserves source records, records provenance, classifies catalogue items and calculates a completeness score before records are treated as collector-ready.

## Field ownership

| Atlas field | Primary source | Notes |
| --- | --- | --- |
| Set number | Rebrickable | Stable import key. |
| Name | Rebrickable | Factual catalogue name. |
| Release year | Rebrickable | Imported from `sets.csv`. |
| Theme and subtheme | Rebrickable + TBX normalisation | Theme hierarchy is flattened into a root theme and leaf subtheme. |
| Piece count | Rebrickable | Imported from `sets.csv`. |
| Main image URL | Rebrickable | Stored as a remote source URL with `image_source`. |
| Minifigure count | Rebrickable inventory enrichment | A later importer will derive this from inventories. |
| Official instructions | LEGO link | Link to the official service; do not rehost instruction PDFs. |
| Retail price | Verified regional source | Store ZAR price only when verified. |
| Barcode/EAN | Verified source/manual review | Never infer a barcode. |
| Classification | TBX | Retail set, polybag, GWP, promotional, gear, book, etc. |
| Wishlist, ownership and availability | TBX | Private/aggregate platform data only. |

## Record lifecycle

1. **Import** factual source data.
2. **Classify** the product type.
3. **Score** completeness from 0 to 100.
4. **Review** suspicious, duplicate or incomplete records.
5. **Publish** collector-ready records.

### Statuses

- `gold`: completeness score of 90 or more.
- `collector_ready`: score of 65–89.
- `needs_review`: incomplete or unclassified.
- `hidden`: non-core catalogue records such as gear, books, storage and Make & Take builds.
- `duplicate`: record requires manual duplicate resolution.

## Running the Rebrickable importer

1. Download `sets.csv` and `themes.csv` from Rebrickable's official bulk downloads.
2. Apply `20260714123000_atlas_gold_foundation.sql` in Supabase.
3. Run a dry test:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/atlas/import-rebrickable.mjs ./rebrickable --dry-run
```

4. Run the import without `--dry-run` after checking the totals.

The importer upserts on `set_number`. It does not delete records and does not modify Collection, Wishlist, Marketplace or transaction tables.

## Next enrichment stages

- Derive minifigure counts from Rebrickable inventory CSVs.
- Add official LEGO instruction links.
- Build the Atlas Admin review queue UI.
- Add conflict detection when two sources disagree.
- Add scheduled refreshes and source freshness reporting.
