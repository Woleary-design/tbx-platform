# Atlas full catalogue import

The Block Exchange imports the official LEGO set catalogue from Rebrickable's bulk CSV downloads. Rebrickable directs bulk catalogue consumers to the Downloads files rather than repeatedly paging through its API.

## What is imported

- Set number
- Set name
- Release year
- Theme and nested subtheme path
- Piece count
- Catalogue image URL
- Rebrickable source identifier

Minifigure counts, retirement dates, retail prices, barcodes and instruction links remain nullable until dedicated enrichment sources are added.

## Set-number handling

Rebrickable version identifiers such as `75192-1` are normalized to the collector-facing LEGO number `75192`. Non-primary variants such as `75192-2` keep their suffix so Atlas never silently merges distinct catalogue records.

## Required secrets

Configure these as GitHub Actions repository secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is server-only and must never be exposed through a `NEXT_PUBLIC_` variable or browser bundle.

## First import

1. Merge and deploy the Project Atlas schema migration.
2. Open **GitHub → Actions → Atlas catalogue import**.
3. Run the workflow with `dry_run` enabled and an optional limit such as `100`.
4. Review the workflow logs for download, parsing and collision checks.
5. Run it again with `dry_run` disabled and no limit.
6. Confirm the Atlas directory count and spot-check several old and recent sets.

## Local commands

```bash
npm run atlas:import:dry
npm run atlas:import
```

For a small test:

```bash
ATLAS_IMPORT_DRY_RUN=true ATLAS_IMPORT_LIMIT=100 npm run atlas:import
```

## Refresh schedule

The GitHub workflow runs every Sunday. Imports are idempotent: records are upserted by canonical `set_number`, existing Atlas IDs remain stable, and missing source rows are not automatically deleted or deactivated.

## Safety behaviour

The importer stops before database writes when it detects canonical set-number collisions. It also fails the workflow on download, decompression, parsing or Supabase write errors rather than leaving a silently partial refresh.
