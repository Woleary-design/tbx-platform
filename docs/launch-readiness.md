# TBX transaction launch gates

TBX stays in reservation-only mode until payments, courier quotes and seller verification are operational. The UI must never describe an integration as live merely because a screen exists.

## Environment gates

- `TBX_PAYMENTS_LIVE=true` only after a sandbox purchase, failed payment, refund and webhook replay have passed.
- `TBX_COURIER_QUOTES_LIVE=true` only after live quote, booking, label and tracking tests have passed for every displayed method.
- `TBX_REQUIRE_VERIFIED_SELLERS=true` once identity, address and payout checks have an operational review path. When enabled, unverified sellers cannot receive reservations.

## Provider work still requiring business setup

1. Select and contract a South African payment provider with marketplace or split-payment support.
2. Define escrow/held-funds wording with legal counsel before enabling protected-payment claims.
3. Obtain The Courier Guy/PUDO commercial API access and agree who absorbs quote differences.
4. Select an identity/KYC provider and document manual-review and appeal handling.
5. Configure secrets in Vercel; never expose them through `NEXT_PUBLIC_` variables.

## Release acceptance

Before public transactions, verify the full path with separate seller and buyer accounts: list with a seller photo, reserve, seller confirms, pay, book courier, track, inspect, complete, release payout, dispute and refund.

