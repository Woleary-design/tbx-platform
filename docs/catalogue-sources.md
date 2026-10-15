# Atlas collectible catalogue pilot

Enabled only on Vercel preview builds. Existing LEGO catalogue routes remain unchanged.

## Pokémon

TCGdex v2 English card search and detail API is queried on demand, cached for one day, and bounded to twelve results. This is a searchable connection, not a full local database import. Stable card IDs, card numbers, sets, language and available finishes are retained in listing `value_quote.catalogueReference`; condition, finish selection, grading and authenticity are seller declarations. Brief search results are resolved against the detail endpoint before selection. Sealed products and bundles remain manual.

Database source: https://github.com/tcgdex/cards-database
Documentation: https://tcgdex.dev/rest/cards and https://tcgdex.dev/rest/card

No card artwork is copied or displayed by this pilot. Seller photos remain required. Overseas pricing is excluded from the response and is not used for ZAR valuations. Source failure leaves manual listing available.

## Hot Wheels

Ten 2025 HW J-Imports variant records were resolved from collectdb's series references into their originating case records. The normalized pilot data retains per-file revision hashes and source URLs. This is partial coverage; no photographs or valuations are imported.

Contains information from collectdb, which is made available under the Open Database License (ODbL).

Source: https://github.com/topvault/collectdb
Licence: https://opendatacommons.org/licenses/odbl/1-0/
Full licence text: catalogue-licenses/collectdb-ODbL-1.0.txt
Machine-readable derivative: lib/atlas/hot-wheels-pilot.json
Preview download endpoint: /api/atlas/hot-wheels-pilot

Attribution and the downloadable derivative are shown alongside search and source-derived listings. Keep catalogue records separately attributable from private seller, order and payment information. A broader import still needs a coverage audit, reference/variant reconciliation, update strategy and review of any separately copyrighted images. The dataset describes itself as in progress.

## Storage and verification

No database schema or permission changes are required. Catalogue selections use the existing asset/listing lifecycle and save their provenance inside listing metadata. Unit tests cover printing identity, malformed records, finish filtering and source/variant retention. Runtime API checks cover live Pokémon search/detail and static Hot Wheels search/export. A complete signed-in listing publication test remains separate.

## Pokémon browsing and personal library

English set directory, filterable set cards, and exact card pages are available in preview. Set/card responses are cached for one day. Card pages support authenticated collection intake (finish, condition, optional grading) and a private wishlist. `assets.collectible_details` and `assets.catalogue_reference` retain identity independently of listings. Existing collection and sell-from-collection routes preserve it; collectible asking prices are not stored as valuations. Wishlist alerts are not yet connected for Pokémon. Reference images and market valuations remain excluded pending image permission review and reliable pricing evidence.

## Hot Wheels 2024–2026 expansion

`lib/atlas/hot-wheels-catalogue.json` replaces the pilot for lookup and browsing. It contains 3,679 unique edition/variant identities from collectdb revision `27d8f2f9f58f32d251cb3dc3251aed2e78d14a4a`, with 2024–2026 series appearances. Source references resolve to canonical IDs; variant relationships inherit missing casting metadata without merging distinct identities. Packaged products are excluded. Import fails on unresolved references or conflicting IDs. No image, valuation or private user data is included.

Reproduce with Python + PyYAML: `python scripts/import-hot-wheels.py /path/to/collectdb`. Use the pinned source revision to reproduce this exact export; review a later revision's diff and audit before updating. Partial upstream coverage and missing toy numbers remain explicit. Browse by year/series and search by model/toy number; pagination returns 24 unique records. Public preview export: `/api/atlas/hot-wheels?download=1`. Attribution appears on browse, item and seller-search pages and marketplace listings.

Car pages save private collection copies and category-scoped wishlist entries through existing owner RLS; no schema change is required. Collection copies preserve car/packaging condition and exact catalogue identity for selling. No catalogue artwork or price claims are added.

## Full available Hot Wheels car data

The catalogue now contains **30,663 distinct edition/variant identities**, covering all 59 source years (1968–2026), plus one entry with an unknown year. All source car items and nested variants are processed; packaged products remain outside the car import. There are no unresolved references or conflicting IDs. The source is still in progress: 4,541 entries lack a recorded toy number and 14 lack a variant label. These omissions remain explicit; this is not a claim that every Hot Wheels release exists in the source.

For the full dataset, the repository JSON wraps deterministic gzip/base64 data, decoded only in server modules. Search text is precomputed, filters/pagination return at most 24 records, and catalogue data is not shipped to the client bundle. The licence download endpoint returns **`tbx-hot-wheels-catalogue.json.gz`**, containing the full normalized machine-readable JSON and audit/provenance, to keep the response below platform body limits. Import and public export carry the same source revision, stable identities and licence. Existing saved car references remain valid.

## Images and price evidence

Pokémon browse/search/card pages display documented TCGdex image URLs as reference images, with a strict HTTPS assets.tcgdex.net allowlist, low-resolution browsing, high-resolution detail and a missing-image fallback. Artwork remains third-party intellectual property; the database MIT licence is not presented as an artwork licence. Seller photos remain mandatory for listings.

Card pages show fresh TCGplayer raw-card market references only from variants_detailed entries whose thirdParty product ID matches the priced product. An ID assigned to multiple distinct variant labels is suppressed, as are prices older than seven days, malformed or missing values. These are explicitly overseas references, not local valuations; graded prices are not inferred. Frankfurter USD/ZAR daily conversion includes its source and rate date; unavailable/stale FX yields foreign currency only. References and converted amounts are never written into asset estimated_value or listing asking_price.

Exact catalogue/category matches in public Active published TBX listings provide seller-photo and asking-price evidence on both categories' detail pages. RLS is retained; private/draft/reserved records are not queried. Sandbox asking prices are labelled test evidence and simulated sales never become verified valuations. Hot Wheels bulk reference artwork and overseas valuation coverage remain unconnected pending an appropriate licensed source. No image or price scraping of hobbyDB/HWDB is performed.

## LEGO market graphs

The shared LEGO price panel includes a current-reference bar chart and 1M/3M/6M/1Y history controls. Retail reference values use the same condition-adjustment factor as the summary; TBX asking prices remain unadjusted. Graphs show anonymized reference numbers and no external shopping links. The desktop layout places chart and price summary side by side; narrow screens stack them. SVG points support focus and touch/click, and an adjacent text panel exposes the selected value.

History reads market_sales for the exact collectible and condition, verified=true, ZAR/ZA, active sales-capable sources, and the last 365 days. Explicit sandbox/test/simulation records, invalid prices, future dates and other conditions/currencies are excluded. Dates are grouped in Johannesburg time; the yellow line uses the daily median, with relative sale-count bars and actual count/range details. It never treats current retail listings or simulated order ledgers as historical sales. Over-limit/error responses are unavailable rather than partial history; missing history displays an empty state. The sandbox currently has no recorded sale-history rows. No synthetic history is seeded.

## Price-over-time correction

The primary LEGO chart is a date-axis reference-price line, not an unordered price comparison. It starts with today's observed condition-adjusted retail reference price; it does not create earlier prices. There is a dot for one date and a connecting line only when two or more actual observation dates exist. The 1M/3M/6M/1Y controls filter recorded dates. Reference counts describe the sources supporting each observation, never items sold.

Preview pricing lookups record actual retail-reference observations in the existing market_price_snapshots table, identified by source_summary.kind=atlas_retail_reference_v1 and the exact original condition. Only validated server-fetched prices are recorded, through the existing preview service configuration; clients cannot submit prices. A deterministic set/condition/Johannesburg-day UUID prevents duplicate daily rows during concurrent requests. A changed observation updates only that day's tagged row. Other snapshot sources are excluded. New Open Box is stored in the legacy Unknown condition bucket with its exact condition preserved in source_summary; the history query always filters this explicit metadata. No order, payment or personal data is involved.

Snapshots are collected when pricing is looked up, not by a scheduled job. Saving failure is exposed in the chart, while the current observed price still displays. Production writes remain disabled. The separate verified-sale-history utilities are retained for future use; retail reference history is not described as completed-sale history.
