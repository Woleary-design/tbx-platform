export type SandboxLedger = {
 id: string; reservation_id: string; buyer_id: string; seller_id: string;
 gross_cents: number; item_cents: number; fee_cents: number;
 courier_cents: number | null; processor_cents: number | null; seller_cents: number | null;
 delivery_payer: 'buyer' | 'seller'; status: string;
 inspection_ends_at: string | null; buyer_accepted_at: string | null; payout_reference: string | null;
};
export function moneyCents(cents: number) {
 return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
}
export function payoutReady(ledger: SandboxLedger, now = Date.now()) {
 return ledger.status === 'delivered' && ledger.seller_cents !== null && ledger.processor_cents !== null
  && Boolean(ledger.buyer_accepted_at || (ledger.inspection_ends_at && Date.parse(ledger.inspection_ends_at) <= now));
}
export function payoutLabel(ledger: SandboxLedger, now = Date.now()) {
 if (ledger.status === 'paid_test') return 'Paid — simulation';
 if (ledger.status === 'refunded_test') return 'Refunded — simulation';
 if (ledger.status === 'disputed') return 'Paused — problem reported';
 return payoutReady(ledger, now) ? 'Ready for payout — simulation' : 'Pending';
}
