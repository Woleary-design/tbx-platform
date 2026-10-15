# TBX verification — 15 October 2026

## Follow-up implementation

- All 11 ESLint warnings resolved; lint and TypeScript are clean. Collection-resume effects use React effect events so saved drafts resume with current callbacks without repeated saves when form state changes.
- Sandbox reservation expiry installed and scheduled every five minutes, separately from production expiry. Verified payment attempts and any existing sandbox ledger prevent expiry. Rollback tests confirm paid-order protection, unpaid seller/payment expiry, listing reopening and repeat-run idempotency.
- Public Atlas RPC now enforces `atlas_visibility='public'`. A rollback test temporarily hides a known public record and confirms it disappears from RPC results, then restores it.
- Atlas search and catalogue pricing use bounded requests. Search provides a visible error/retry action; obsolete responses are ignored after navigation or query changes.
- All 39 unit tests passed and optimized build passed after the changes. No production database changes were applied.
- Remaining security advisor findings are not automatically resolved by these changes. Public read-only pricing/search RPCs and authenticated mutation RPCs require documented grant review; schema-extension relocation and leaked-password protection remain platform follow-up. No broad grants were added and no protection was weakened.
- Signed-in browser/mobile walkthrough remains unverified. Browser access is separate from API/database regression evidence; no successful signed-in test or screenshot is claimed.

The sections below retain the earlier audit baseline. The follow-up above supersedes the lint, sandbox-expiry and catalogue-visibility gaps listed there.

Scope: LEGO website on `fix/auth-launch-checks`, sandbox database, with a read-only check of production reservation scheduling. This is a technical verification, not live-commerce launch approval.

## Confirmed

- 39 automated tests passed: authentication redirect validation, order guidance, PayFast signatures and amount parsing, payout gates, delivery dimensions and sample rates, dated pricing history, and catalogue helpers.
- Optimized Next.js build and TypeScript passed. Full ESLint check has zero errors and 11 existing warnings (effect dependencies and unused imports).
- Preview HTTP responses succeeded for home, Atlas, marketplace, quick sell, value, sign-in, collection, orders and admin entry points. Redirected responses are not evidence of authenticated page functionality.
- Catalogue searches `CAT` and `42110` return results; the latter identifies Land Rover Defender. The homepage form submits to `/atlas` using `q`.
- LEGO 76469 pricing returns Low/Middle/High and dated reference history. Prices are market references, not guaranteed completed-sale values.
- PayFast sandbox readiness confirms isolated database configuration, callback reachability and rejection of an invalid signature.
- Database checkout regression passed: server-owned locker quote, buyer total including delivery, immutable delivery details after checkout starts, buyer-only checkout, ledger reconciliation, receipt and simulated payout. All fixture changes rolled back.
- Updated delivery regression passed: booking expiry, seller/staff role restrictions, duplicate booking/receipt handling, inspection only after collection, legacy endpoint guards, unrelated-user rejection, delivery RLS and direct-write denial. All fixture changes rolled back.
- Nine checked sensitive tables have RLS enabled. Anonymous sandbox-ledger reads are denied. Existing seller/courier/commission allocations reconcile.
- Production reservation-expiry function and five-minute scheduled job are present and active (read-only check).

## Changes from this check

- Admin order deadlines now use one request-time clock snapshot. The targeted purity-rule exception is documented because this is an async server-rendered page, not a client render-time clock.
- The older delivery SQL fixture now creates a fresh checkout inside its rollback transaction. It no longer tries to change a completed checkout's locked delivery details. Locker lifecycle assertions remain; the old door-delivery mutation block was removed because it bypassed current checkout rules. Door-delivery end-to-end coverage remains a gap.

## Remaining gaps

1. **Signed-in browser walkthrough:** the remote browser reaches Vercel authentication. No fresh browser verification of buyer, seller or staff sessions, mobile layout, photo upload, or new listing publication was completed. HTTP checks, component rendering checks from earlier fixes and database regressions do not replace this.
2. **Live transactions:** payments, delivery booking and payouts exercised here are sandbox simulations. Real PayFast settlement, courier booking/labels and bank payout execution are not certified.
3. **Sandbox expiry:** sandbox lacks `pg_cron` and `private.expire_purchase_reservations()`. Production has both. Do not copy the old production expiry routine into sandbox without adapting it to exclude verified sandbox payments, whose reservation status may still be `awaiting_payment`.
4. **Security advisory follow-up:** leaked-password protection is disabled in sandbox; `pg_trgm` and `unaccent` are in the public schema; security-definer RPC grants need explicit review. These are advisor findings, not proof of exploitable access. Staff RPC source includes owner checks; reservation mutation sources include user checks. No grants or auth settings were changed during this audit.
5. **Catalogue RPC curation:** the API post-filters public catalogue IDs, but the underlying `atlas_search` function itself checks active state without an explicit visibility predicate. A sampled nonpublic-record probe returned false; comprehensive enforcement at the RPC boundary still needs review.
6. **Processing cost:** the previously corrected completed test order retains an unverified processing cost. Its seller payout remains completed. TBX net after payment fees must remain pending until a verified fee is entered through an audited finance-correction workflow.
7. **Regression coverage:** the legacy seller-funded ledger fixture was not rerun; current buyer-paid locker checkout and payout were exercised. Existing lint warnings remain.

Security reference: [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [public-schema extensions](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [anonymous security-definer grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated security-definer grants](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
