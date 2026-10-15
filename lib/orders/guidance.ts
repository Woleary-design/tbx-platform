export type OrderRole = "buyer" | "seller";
export type PaymentMode = "disabled" | "sandbox" | "live";

export function orderGuidance(status: string, role: OrderRole, mode: PaymentMode, sandboxStatus?: string | null) {
  if (sandboxStatus === "complete") return { title: "Sandbox payment verified", body: role === "buyer" ? "Your test payment was verified. No real money was taken. Delivery and ownership transfer are not active in this test." : "The buyer’s test payment was verified. Do not dispatch this item: this is a sandbox payment, not a real sale.", action: false };
  switch (status) {
    case "awaiting_seller": return role === "seller"
      ? { title: "Confirm availability", body: "Confirm whether you still have the item before the deadline. No payment has been taken.", action: true }
      : { title: "Waiting for the seller", body: "Your item is reserved. The seller must confirm availability before you can pay.", action: false };
    case "awaiting_payment": return role === "seller"
      ? { title: "Waiting for the buyer", body: "You confirmed availability. Wait for verified payment; do not dispatch yet.", action: false }
      : mode === "disabled"
        ? { title: "Payment is not enabled", body: "The seller confirmed availability. Checkout is not yet available; no payment has been taken.", action: false }
        : { title: mode === "sandbox" ? "Complete your test payment" : "Complete payment", body: mode === "sandbox" ? "Use the PayFast sandbox button below before the deadline. This test will not book delivery or pay the seller." : "Pay before the deadline to continue your order.", action: true };
    case "ready_to_ship": return role === "seller"
      ? { title: "Prepare the parcel", body: "Payment is verified. Follow the order’s delivery instructions to dispatch the item.", action: true }
      : { title: "Waiting for dispatch", body: "Your payment is verified. The seller is preparing the parcel.", action: false };
    case "shipped": return { title: role === "buyer" ? "Your parcel is on the way" : "Parcel dispatched", body: "Check the delivery tracking below. This order is not yet complete.", action: false };
    case "completed": return { title: "Order complete", body: "Receipt was confirmed and the item transferred to the buyer’s collection.", action: false };
    case "payment_expired": return { title: "Payment window expired", body: "This reservation expired. If the listing is still available, the buyer can reserve it again.", action: false };
    case "seller_expired": return { title: "Seller confirmation expired", body: "Availability was not confirmed in time. The reservation has ended.", action: false };
    case "seller_declined": return { title: "Item unavailable", body: "The seller could not confirm availability. No payment was taken.", action: false };
    default: return { title: status.replaceAll("_", " "), body: "Review the current order status below.", action: false };
  }
}
