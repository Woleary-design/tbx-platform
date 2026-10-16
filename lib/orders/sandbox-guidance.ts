type Ledger = { status: string; buyer_accepted_at: string | null };
type Delivery = { status: string; dropoff_deadline?: string | null; collection_deadline?: string | null };

/** Verified payment and fulfilment take precedence over the original reservation status. */
export function sandboxOrderGuidance(ledger: Ledger, delivery: Delivery | null, role: 'buyer' | 'seller', now: number) {
  const buyer = role === 'buyer';
  const result = (title: string, body: string, next: string) => ({ title, body, next, action: false });
  if (ledger.status === 'paid_test') return result('Test order complete', 'Receipt and simulated seller payout are complete. No bank transfer occurred.', 'No action needed.');
  if (ledger.status === 'refunded_test') return result('Test order refunded', 'A simulated refund was recorded. No actual refund was issued.', 'No action needed.');
  if (ledger.status === 'disputed') return result('Problem under review', 'Seller payout is paused while the reported problem is reviewed.', 'TBX reviews the reported problem.');
  if (ledger.status === 'delivered') return ledger.buyer_accepted_at
    ? result('Receipt confirmed', 'The buyer has confirmed receipt. The simulated seller payout is awaiting review.', 'Finance reviews the simulated seller payout.')
    : result('Test parcel delivered', buyer ? 'Your test parcel is ready for inspection.' : 'The test parcel has been received by the buyer.', buyer ? 'Confirm test receipt below, or report a problem.' : 'The buyer confirms receipt or reports a problem during inspection.');
  if (delivery?.status === 'awaiting_collection') {
    if (delivery.collection_deadline && Date.parse(delivery.collection_deadline) <= now) return result('Collection overdue — admin review', 'The sample collection deadline has passed. Inspection and payout remain held.', 'TBX reviews the uncollected test parcel.');
    return result('Ready for locker collection — test', 'The test parcel has arrived at the locker. Inspection starts after collection.', 'TBX records simulated buyer collection.');
  }
  if (delivery?.status === 'in_transit' || ledger.status === 'in_transit') return result('Test parcel on the way', 'Test payment is verified. Do not pay again.', 'TBX records the next simulated delivery update.');
  if (delivery?.status === 'booked') {
    const expired = Boolean(delivery.dropoff_deadline && Date.parse(delivery.dropoff_deadline) <= now);
    return result(expired ? 'Test booking expired' : 'Ready for test handover', 'A simulated booking is prepared. Do not send a real parcel.', expired ? buyer ? 'The seller renews the expired test booking.' : 'Renew the test booking below.' : 'TBX records the simulated courier handover.');
  }
  return result(buyer ? 'Test payment received — seller preparing parcel' : 'Test payment received — prepare the parcel', 'Payment is verified. No real courier is booked and no real parcel should be sent.', buyer ? 'The seller prepares the test booking. You do not need to pay again.' : 'Enter a sample drop-off or collection location below and select Ready to send.');
}
