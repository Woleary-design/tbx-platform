# PayFast sandbox integration

The integration is disabled by default and can only post to PayFast's sandbox.
Live payments, courier bookings, asset transfers, refunds and seller payouts are not enabled by this change.

## Enable on a preview deployment

Apply `20261002115217_payfast_sandbox_attempts.sql` to a development database, then configure server-side environment variables:

- `TBX_PAYFAST_SANDBOX_ENABLED=true`
- `PAYFAST_SANDBOX_MERCHANT_ID` and `PAYFAST_SANDBOX_MERCHANT_KEY`
- `PAYFAST_SANDBOX_PASSPHRASE` matching the sandbox account
- `TBX_SITE_URL` with the HTTPS preview origin, with no path or query
- `SUPABASE_SERVICE_ROLE_KEY` for the development project, never a NEXT_PUBLIC variable

Leave `TBX_PAYMENTS_LIVE=false`. Use a sandbox account, not Rudman's live credentials.

## Acceptance checks before deployment

1. Register two test users and confirm emails on the requesting device.
2. Verify password login, wrong-password rejection, logout, expired confirmation links and reset-email recovery.
3. Create a test listing and reserve it as the other user. Seller confirms availability.
4. Buyer opens the order page and chooses the sandbox button before the payment deadline.
5. Complete the wallet payment in PayFast sandbox. A browser return alone must not show verified success.
6. Verify the notification signature and server confirmation produce a `complete` sandbox attempt with the exact stored order amount.
7. Replay the notification: one attempt remains, with the same provider ID. Cancelled or repeated callbacks must not downgrade a complete payment.
8. Wrong merchant, wrong amount, duplicate fields, invalid signature and unknown attempts must not change state. A provider timeout must return a retryable 503.
9. Test nonbuyer access and expired reservations: checkout must fail.
10. Confirm the actual reservation, listing, asset owner and courier state are unchanged by sandbox payment.

These end-to-end steps require a deployed preview, the development migration, sandbox configuration and access to test email accounts. Local protocol tests alone do not prove them.

The start RPC locks the reservation, checks the authenticated buyer, seller-confirmed status, deadline and ZAR amount. The notification RPC is callable only by the service role, checks the stored amount, locks the attempt and protects completed results from downgrade. Sandbox outcomes remain isolated from fulfilment, even for notifications received after reservation expiry.

Reference: https://developers.payfast.co.za/docs#custom-integration

## Isolated TBX preview configuration

The `fix/auth-launch-checks` preview uses the separate `tbx-payfast-sandbox` Supabase project. Its browser URL and publishable keys are branch-specific overrides. `TBX_SANDBOX_SUPABASE_URL` identifies this override, and the server reads `TBX_SANDBOX_SERVICE_ROLE_KEY` only when `VERCEL_ENV=preview` and the browser URL matches it. An incomplete or mismatched override fails closed.

Set `TBX_SITE_URL` to the stable preview branch origin. The callback must be reachable by PayFast without Vercel Authentication before enabling the sandbox flag. Existing production connection variables remain separate. Test users, listings and uploads must be created in the sandbox; no production user data is copied.
