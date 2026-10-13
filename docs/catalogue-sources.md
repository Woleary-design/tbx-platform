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
