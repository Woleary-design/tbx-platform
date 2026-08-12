import Link from "next/link";
import { notFound } from "next/navigation";
import { ProtectedCheckout } from "@/features/marketplace/components/protected-checkout";
import { getListingById } from "@/features/marketplace/data/marketplace.mock";

type Props = { params: Promise<{ listingId: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { listingId } = await params;
  const listing = getListingById(listingId);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href={"/marketplace/" + listing.id} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to listing</Link>
      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Protected Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Choose delivery with TBX Secure.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Select one of the seller’s enabled delivery methods. Delivery is paid at checkout, tracking follows the order, and funds remain protected through the inspection window.</p>
      </section>
      <ProtectedCheckout listing={listing} />
    </div>
  );
}
