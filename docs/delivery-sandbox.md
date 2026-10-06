# Sandbox delivery

Preview only; backed by the isolated tbx-payfast-sandbox database. No external courier calls, usable locker codes, real fulfilment, or bank movements.

Buyer chooses locker/door delivery on the order page with sample destination and packed dimensions. These provisional measurements must be checked with the seller. Locker parcel checks accept rotations within 60 × 41 × 69 cm and 20 kg. This selection is not a rate quote and does not unblock buyer-funded checkout.

After verified test payment and reconciled courier cost, the seller supplies a sample origin and clicks Ready to send. This creates a SIM reference with a 36-hour test handover allowance; the live integration's expiry must be confirmed with TCG. Owner/Operations controls in Admin → Orders simulate handover, locker arrival, and collection/door delivery. Locker arrival starts a separate 36-hour test collection window, with no inspection or payout release. Actual simulated receipt starts the ledger's 48-hour inspection period. Existing receipt, dispute and finance controls remain in use.

Expired test bookings can be renewed by Seller/Operations. Expired collections require admin review; no automatic receipt or payout is allowed. Disputed/refunded/paid ledgers block delivery changes. Duplicate event retries are no-ops. SQL operations lock the order and ledger, audit changes, and notify buyer and seller. Existing ledger dispatch/delivery calls cannot bypass booking/collection for managed deliveries. Earlier orders without a delivery record retain their original test controls.

Live dependencies: TCG marketplace account/billing approval, correct current API credentials, actual pickup-point identifiers and validated addresses, server-side price quotes and binding them to checkout, label/PIN requirements, signed courier tracking event handling, cover and returns terms, expiry/rebooking charges, reminders and exception resolution. None is represented as active in this sandbox.

Validation: node --test tests/*.test.mjs; npm run typecheck; npm run build. Run tests/sql/sandbox-delivery.sql against the isolated sandbox; it rolls back all fixture changes.
