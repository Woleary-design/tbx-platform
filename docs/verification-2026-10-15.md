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

## Signed-in follow-up — 15 October, afternoon SAST

This section updates the earlier gaps; it does not certify a launch.

- Vercel access and TBX account sign-in succeeded in the cloud browser. The dashboard visibly identified the collector and offered Sign out.
- Homepage `CAT` search reached Atlas and displayed 40 matching records. Seller search `42110` selected Land Rover Defender.
- The seller valuation displayed four references, Low/Middle/High, and one dated observation with no invented historic line. Slow pricing exposed a missing recovery path in QuickAddSetForm; commit `21c7084` added bounded requests, retry and stale-response protection and deployed to preview.
- The collection excludes the simulated sold White Ninja from current holdings and retains its order link. Seller order displayed R562.50 proceeds from R625 item price and R69 buyer-paid delivery. The earlier buyer order displayed R414 paid and retained its seller-funded delivery model. Both completed test orders showed no further action.
- Existing Dobby collection record carried identity and condition into listing. Condition and parcel steps worked; choosing Medium populated dimensions and enabled the photo step. No listing was published. The photo step required an actual current item photo and disabled Review listing without one.
- Removed non-LEGO links from the main Atlas and selling entry points and limited Marketplace to LEGO, including preview. Saved non-LEGO records and pilot implementation remain intact.
- Corrected listing confirmation copy from delivered price / before shipping to item price / seller receives. Buyer pays delivery separately at checkout.
- Responsive source review: sidebar hides below the large breakpoint, mobile navigation scrolls, forms use single columns before larger breakpoints. Increased mobile navigation targets to at least 44 pixels high. A physical-phone or emulated-width browser check was not completed; this browser API does not expose viewport resizing.
- Earlier technical follow-up installed a sandbox-specific five-minute expiry routine with verified-payment exclusions and added public visibility enforcement to Atlas search. SQL rollback regressions are in `tests/sql/sandbox-expiry.sql` and `tests/sql/atlas-visibility.sql`. Security advisory settings and live provider integrations remain outstanding.

Remaining browser coverage: actual item-photo upload, fresh listing publication, a second buyer session and fresh checkout, physical-phone layout and touch interaction. No real payment, courier booking or payout was performed.

## Browser follow-up — 16 October SAST

- Browser access recovered with the existing TBX sign-in. Exact-set search selected Dobby the House-Elf 76421, matching the supplied photo (the earlier 76469 record is a different model and was not overwritten).
- Condition radio choices responded, with Used Complete selected for the actual item. The correct-set valuation showed three references: Low R503, Middle R607, High R778 at the time of the check. The seller price remained R607.
- Supplied image.png passed photo validation and enabled listing review. With user instruction to list for sale, published listing `3e2f161c-bacd-4009-aaa1-fbcad520b1b4` in the isolated preview. Marketplace showed one live listing at R607. Medium parcel preset (45 × 35 × 20 cm, 3 kg) is test data, not measured packaging.
- Fresh publication exposed two display defects: the seller image optimizer returned HTTP 400 because next.config.ts allowed only production storage; the detail sidebar hardcoded delivery as included. Added the exact sandbox Asset-images host/path, displayed delivery from the stored payer model, and contained the portrait photo to show the whole item.
- No real payment, courier booking or payout occurred. Second-buyer reservation/checkout and phone interaction remain outstanding.
- Deployed image fix verified in browser: seller photo loaded with nonzero natural dimensions, and detail copy read Buyer pays at checkout. Own-seller reservation attempt returned You cannot buy your own listing; no reservation was created. Checkout correctly showed item subtotal and delivery quote pending. Aligned remaining insurance text to To be confirmed while live courier quoting is disconnected.

## 16 October: Dobby transaction and flow polish

- Separate buyer Doogz reserved listing 3e2f161c-bacd-4009-aaa1-fbcad520b1b4; seller confirmed availability. Order 688d809f-51a6-4d31-86d0-a5a67ab7550c.
- Seller parcel preset (45 × 35 × 20 cm, 3 kg; still requires measurement before real fulfilment) now carries into the delivery form. Sample locker quote R89; item R607; total R696.
- PayFast sandbox payment completed and TBX visibly verified payment. Seller fee R60.70 and simulated seller proceeds R546.30.
- Seller prepared a simulated booking. Admin simulated handover, locker arrival and buyer collection. Inspection began after collection; Doogz confirmed test receipt. Finance payout remains pending. No live payment, real courier booking or bank payout occurred.
- Sandbox Auth Site URL was localhost with an empty redirect allowlist. Updated sandbox-only default to the established branch preview origin and allowed paths on that exact host. New buyer login subsequently succeeded. Production Auth settings were not changed.
- Flow polish: order header names the next actor/action, verified payment remains explicit during parcel preparation, and item/delivery/full total appear before payment without expanding details. Seller availability controls are above secondary details.
- Admin dashboard and orders use shared verified sandbox stage guidance; completed/refunded tests stop counting as open actions, and sandbox transactions are excluded from live sales metrics. Provider banner correctly identifies sandbox mode.
- Switching between sign-in and registration clears old feedback; tabs are disabled during an in-flight authentication request. Notification feed already groups one current update with collapsed history and was retained.
- Validation: targeted ESLint, all automated Node tests (including new paid/delivery/receipt/dispute/settlement guidance cases), and production build with TypeScript passed. Browser verification of this preview update is recorded separately below if performed.
