# TBX money flow — sandbox ledger

## Buyer-paid model for new listings

Buyer pays item price plus a confirmed courier quote. TBX commission is 10% of the item price. Seller proceeds are item price less commission. Payment-processing fees reduce TBX revenue, never the seller proceeds. A R1,000 item with R100 delivery allocates R900 to the seller, R100 to the courier and R100 to TBX before processing fees.

Courier cost and processor cost must be confirmed and frozen. All amounts are stored in integer cents. No unspecified courier fee is treated as free delivery. Existing seller-funded test orders retain their original funding model: courier costs also reduce their seller proceeds. Buyer-funded payments must reconcile gross = item + delivery before accounting can proceed. Checkout for those orders remains blocked until courier quote persistence is implemented.

## Sandbox flow

Verified PayFast sandbox notifications create one ledger and one audit event per order. Duplicate callbacks cannot create duplicate ledgers. Ledger accounting remains separate from purchase_reservations, fulfilment and ownership transfer.

1. Operations/Owner confirms the simulated courier cost; Finance/Owner records the simulated processor cost.
2. Seller or Operations/Owner simulates dispatch.
3. Operations/Owner simulates delivery, starting a 48-hour inspection window.
4. Buyer can confirm test receipt or report a problem. Seller can also report a problem.
5. Payout is eligible only after delivered + buyer acceptance or inspection expiry + complete cost allocations. Any dispute blocks payout.
6. Finance/Owner can record a simulated payout exactly once, or a simulated full refund. These do not contact a bank or issue a provider refund.

Buyer and seller receive in-app notices for each transition. Ledger events are append-only to authenticated users. Account participants can read only their ledger and events; authorized staff can review ledgers. Only controlled RPCs can change ledger state. The mutation API is enabled only in a configured sandbox Preview deployment. The table accepts sandbox mode only.

## Screens

Order pages show payment allocation and Pending / Ready for payout / Paid (simulation). Finance reviews costs and simulated payouts at /admin/payouts. Owner also has Operations simulation controls. A sandbox Owner/Finance account must be assigned before staff testing; roles are not inferred from being a buyer or seller.

## Validation

Node money-ledger tests cover inspection, acceptance, missing costs, dispute and settled-state labels. Transactional sandbox SQL acceptance checks integer allocation, immutable costs, role restrictions, delivery/inspection gates, disputes, refund, duplicate payout, RLS, direct-write denial and fulfilment isolation. Every acceptance mutation is rolled back.

## Live release requirements

These simulations are not an escrow service or a provider payout integration. Real money remains disabled. Before launch: obtain provider approval for marketplace collection and delayed payouts, implement verified seller bank onboarding, reconcile provider settlement/fees, persist courier quotes and booking/tracking, define cancellation/refund and dispute resolution rules, implement payout/refund provider calls with idempotency and reconciliation, and agree the inspection policy. The 48-hour window is a sandbox default, not a published legal policy. Full simulated refunds do not model unrecoverable courier/processing costs yet.
