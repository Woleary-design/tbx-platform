import Link from "next/link";
import { OrderMoney } from "@/components/money/order-money";
import { notFound, redirect } from "next/navigation";
import { Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { SellerConfirmationActions } from "@/components/orders/seller-confirmation-actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { sandboxConfig } from "@/lib/payments/payfast";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { orderGuidance } from "@/lib/orders/guidance";
import { marketplaceReadiness } from "@/lib/marketplace/readiness";
import { PayfastSandboxPayment } from "@/components/orders/payfast-sandbox-payment";

type Props = { params: Promise<{ orderId: string }> };

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
      listings(value_quote),
      assets(set_number, set_name, condition)
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (!reservation) notFound();

  const asset = Array.isArray(reservation.assets) ? reservation.assets[0] : reservation.assets;
  const isBuyer = reservation.buyer_id === userData.user.id;
  const isSeller = reservation.seller_id === userData.user.id;
  if (!isBuyer && !isSeller) notFound();
  const sandboxEnabled = Boolean(sandboxConfig());
  const { data: sandboxAttempt } = sandboxEnabled && (isBuyer || isSeller)
    ? await supabase.from("payfast_sandbox_attempts").select("status").eq("reservation_id", orderId).maybeSingle()
    : { data: null };
  const listing = Array.isArray(reservation.listings) ? reservation.listings[0] : reservation.listings;
  const buyerPaysDelivery = listing?.value_quote?.sellerFundsShipping === false;
  const copy = buyerPaysDelivery && reservation.status === "awaiting_payment" && sandboxAttempt?.status !== "complete"
    ? { title: "Delivery quote pending", body: isBuyer ? "The seller confirmed availability. Your total will include the item and delivery. Wait for the confirmed courier cost before paying." : "Availability confirmed. The buyer will pay delivery separately. Wait for verified payment before dispatch.", action: false }
    : orderGuidance(reservation.status, isBuyer ? "buyer" : "seller", sandboxEnabled ? "sandbox" : marketplaceReadiness.paymentsLive ? "live" : "disabled", sandboxAttempt?.status);
  const { data: ledger } = sandboxEnabled
    ? await supabase.from("sandbox_order_ledger").select("*").eq("reservation_id", orderId).maybeSingle()
    : { data: null };
  const deadline = reservation.status === "awaiting_seller" ? reservation.seller_deadline : reservation.status === "awaiting_payment" && sandboxAttempt?.status !== "complete" ? reservation.payment_deadline : null;

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

      <NotificationFeed orderId={orderId} refreshOrders />
      {ledger ? <OrderMoney ledger={ledger} viewer={isBuyer ? "buyer" : "seller"} /> : null}

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Item</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{asset?.set_name || "TBX item"}</h2>
          <p className="mt-2 text-sm text-slate-500">{asset?.set_number ? `LEGO ${asset.set_number}` : "Collection item"}{asset?.condition ? ` · ${asset.condition}` : ""}</p>
          <div className="mt-5 flex items-center justify-between border-t border-[#eadfce] pt-4">
            <span className="text-sm text-slate-500">Item price</span>
            <strong className="text-xl text-slate-950">{reservation.currency} {Number(reservation.amount).toLocaleString("en-ZA")}</strong>
          </div>
          {buyerPaysDelivery && isSeller ? <div className="mt-3 space-y-2 text-sm text-slate-600"><p className="flex justify-between"><span>TBX fee (10%)</span><strong>{reservation.currency} {(Number(reservation.amount) * 0.1).toFixed(2)}</strong></p><p className="flex justify-between text-slate-950"><span>You receive (estimated)</span><strong>{reservation.currency} {(Number(reservation.amount) * 0.9).toFixed(2)}</strong></p></div> : null}
          {buyerPaysDelivery ? <p className="mt-3 text-sm text-slate-600">{isBuyer ? "Delivery: paid by you, quote pending. Total to pay will be shown before payment." : "Delivery is paid separately by the buyer. Your estimated payout is the item price less the 10% TBX fee."}</p> : null}
        </div>

        <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Status</p>
          <div className="mt-4 flex items-start gap-3">
            {reservation.status === "shipped" || reservation.status === "completed" ? <Truck className="mt-1 h-6 w-6 text-emerald-600" /> : <Clock3 className="mt-1 h-6 w-6 text-yellow-500" />}
            <div><p className="font-semibold text-slate-950">{sandboxAttempt?.status === "complete" ? "Sandbox test complete" : reservation.status.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500">You are viewing this order as the {isBuyer ? "buyer" : "seller"}.</p></div>
          </div>
          {deadline ? <p className="mt-5 rounded-xl bg-[#fffaf1] p-4 text-sm text-slate-600">Current deadline: <strong>{new Date(deadline).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" })}</strong> SAST</p> : null}
        </div>
      </section>

      {reservation.status === "awaiting_seller" && isSeller ? (
        <SellerConfirmationActions reservationId={reservation.id} />
      ) : null}

      {sandboxEnabled && !buyerPaysDelivery && isBuyer && (reservation.status === "awaiting_payment" || sandboxAttempt) ? (
        <PayfastSandboxPayment reservationId={reservation.id} status={sandboxAttempt?.status} />
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
