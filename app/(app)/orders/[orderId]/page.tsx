import { notFound } from "next/navigation";

export default function OrderTimelinePage() {
  // Order status must come from a verified, authenticated transaction.
  // Until that integration exists, never render a simulated protected order.
  notFound();
}
