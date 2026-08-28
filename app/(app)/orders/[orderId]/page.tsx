import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { SellerConfirmationActions } from "@/components/orders/seller-confirmation-actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orderId: string }> };

const statusCopy: Record<string, { title: string; body: string }> = {
  awaiting_seller: {
    title: "Waiting for seller confirmation",
    body: "The item is reserved while the seller confirms that it is still available. No payment is taken at this stage.",
  },
  awaiting_payment: {
    title: "Seller confirmed availability",
    body: "The item is confirmed. Payment is the next step, but TBX will not claim payment is available until a real payment integration is enabled.",
  },
  ready_to_ship: {
    title: "Preparing for dispatch",
    body: "The order is ready for the seller to dispatch.",
  },
  shipped: {
    title: "Your item is on the way",
    body: "The seller has marked the order as shipped. Tracking details are shown below when available.",
  },
  completed: {
    title: "Purchase complete",
    body: "The buyer confirmed receipt and the item has been transferred into the buyer’s TBX inventory.",
  },
  seller_declined: {
    title: "Item unavailable",
    body: "The seller could not confirm availability. No payment was taken.",
  },
};

export default async function OrderTimelinePage({ params }: Props) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/sign-in?next=${encodeURIComponent(`/orders/${orderId}`)}`);

  const { data: reservation } = await supabase
    .from("purchase_reservations")
    .select(`
      id,
      listing_id,
      asset_id,
      buyer_id,
      seller_id,
      amount,
      currency,
      status,
      seller_deadline,
      payment_deadline,
      seller_responded_at,
      paid_at,
      shipped_at,
      completed_at,
      cancelled_at,
      cancellation_reason,
      tracking_number,
      carrier,
      created_at,
      assets(set_number, set_name, condition)
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (!reservation) notFound();

  const asset = Array.isArray(reservation.assets) ? reservation.assets[0] : reservation.assets;
  const isBuyer = reservation.buyer_id === userData.user.id;
  const isSeller = reservation.seller_id === userData.user.id;
  const copy = statusCopy[reservation.status] ?? {
    title: "Purchase in progress",
    body: "This page reflects the verified state stored in TBX.",
  };
  const deadline = reservation.status === "awaiting_seller" ? reservation.seller_deadline : reservation.payment_deadline;

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href="/marketplace" className="text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">
          <ShieldCheck className="h-4 w-4" /> Verified TBX reservation
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{copy.body}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Item</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{asset?.set_name || "TBX item"}</h2>
          <p className="mt-2 text-sm text-slate-500">{asset?.set_number ? `LEGO ${asset.set_number}` : "Collection item"}{asset?.condition ? ` · ${asset.condition}` : ""}</p>
          <div className="mt-5 flex items-center justify-between border-t border-[#eadfce] pt-4">
            <span className="text-sm text-slate-500">Item price</span>
            <strong className="text-xl text-slate-950">{reservation.currency} {Number(reservation.amount).toLocaleString("en-ZA")}</strong>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Status</p>
          <div className="mt-4 flex items-start gap-3">
            {reservation.status === "shipped" || reservation.status === "completed" ? <Truck className="mt-1 h-6 w-6 text-emerald-600" /> : <Clock3 className="mt-1 h-6 w-6 text-yellow-500" />}
            <div><p className="font-semibold text-slate-950">{reservation.status.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500">You are viewing this order as the {isBuyer ? "buyer" : "seller"}.</p></div>
          </div>
          {deadline ? <p className="mt-5 rounded-xl bg-[#fffaf1] p-4 text-sm text-slate-600">Current deadline: <strong>{new Date(deadline).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</strong></p> : null}
        </div>
      </section>

      {reservation.status === "awaiting_seller" && isSeller ? (
        <SellerConfirmationActions reservationId={reservation.id} />
      ) : null}

      {reservation.tracking_number || reservation.carrier ? (
        <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6">
          <div className="flex items-center gap-3"><PackageCheck className="h-6 w-6 text-emerald-600" /><h2 className="text-xl font-semibold text-slate-950">Delivery tracking</h2></div>
          <p className="mt-4 text-sm text-slate-600">{reservation.carrier || "Courier"}{reservation.tracking_number ? ` · ${reservation.tracking_number}` : ""}</p>
        </section>
      ) : null}

      {reservation.status === "awaiting_seller" && isBuyer ? (
        <section className="rounded-[1.75rem] border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="font-semibold text-slate-950">No payment has been taken</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">The seller has been notified. This listing is reserved while TBX waits for their availability confirmation.</p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-xl"><Link href={`/marketplace/${reservation.listing_id}`}>View listing</Link></Button>
        <Button asChild className="rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/marketplace">Browse Marketplace</Link></Button>
      </div>
    </div>
  );
}
