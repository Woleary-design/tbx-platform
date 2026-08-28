"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, CreditCard, Loader2, LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatZar, type MarketplaceListing } from "@/features/marketplace/data/marketplace.mock";
import { getEnabledShippingMethods, shippingMethods, type CourierCode } from "@/features/marketplace/data/shipping-options";

const steps = ["Review Order", "Seller confirms", "Payment", "Courier", "Inspection", "Complete"];

export function ProtectedCheckout({ listing }: { listing: MarketplaceListing }) {
  const router = useRouter();
  const enabledMethods = getEnabledShippingMethods(listing.shipping.enabledMethods);
  const [selectedCode, setSelectedCode] = useState<CourierCode>(enabledMethods[0].code);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedMethod = shippingMethods[selectedCode];
  const total = listing.priceZar + selectedMethod.priceZar;

  async function reservePurchase() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/purchases/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push(`/sign-in?next=${encodeURIComponent(`/checkout/${listing.id}`)}`);
        return;
      }
      if (!response.ok || !payload.reservationId) {
        throw new Error(payload.error || "This item could not be reserved. It may no longer be available.");
      }

      router.push(`/orders/${encodeURIComponent(payload.reservationId)}?courier=${encodeURIComponent(selectedMethod.code)}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "This item could not be reserved.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
          <h2 className="text-2xl font-semibold text-slate-950">Protected purchase steps</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className={index === 0 ? "rounded-2xl bg-yellow-400 p-4 text-slate-950 shadow" : "rounded-2xl border border-[#eadfce] bg-white p-4 text-slate-600"}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">Step {index + 1}</p>
                <p className="mt-2 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Choose delivery</h2>
              <p className="mt-1 text-sm text-slate-500">Only methods enabled by this seller are shown.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {enabledMethods.map((method) => {
              const selected = method.code === selectedCode;
              return (
                <button
                  key={method.code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedCode(method.code)}
                  className={selected
                    ? "rounded-2xl border border-yellow-400 bg-yellow-400/[0.08] p-5 text-left ring-2 ring-yellow-400/25"
                    : "rounded-2xl border border-[#eadfce] bg-white p-5 text-left hover:border-yellow-400/60"}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{method.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{method.service}</p>
                    </div>
                    <span className={selected ? "grid h-7 w-7 place-items-center rounded-full bg-yellow-400 text-slate-950" : "h-7 w-7 rounded-full border border-[#eadfce]"}>
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">{method.estimate}</span>
                    <strong className="text-slate-950">{formatZar(method.priceZar)}</strong>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-[#eadfce] bg-white p-4 text-sm leading-6 text-slate-600">
            <strong className="text-slate-950">{selectedMethod.sellerHandoff}.</strong> {selectedMethod.bookingNote}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">Payment</h2></div>
            <p className="mt-5 text-sm leading-6 text-slate-600">No payment is taken when you reserve. The seller first confirms that the item is still available. Payment options will only be shown after that confirmation.</p>
          </div>
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">Protected delivery</h2></div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p className="rounded-xl border border-[#eadfce] bg-white p-4">Courier: <strong>{selectedMethod.name}</strong></p>
              <p className="rounded-xl border border-[#eadfce] bg-white p-4">Estimated delivery: <strong>{selectedMethod.estimate}</strong></p>
              <p className="rounded-xl border border-[#eadfce] bg-white p-4">Insurance: <strong>{listing.shipping.insuranceIncluded ? "Included" : "Not included"}</strong></p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
          <h2 className="text-2xl font-semibold text-slate-950">What happens next</h2>
          <div className="mt-6 grid gap-4">
            {["TBX reserves the listing for you", "Seller confirms the item is still available", "Payment becomes available only after confirmation", selectedMethod.name + " delivery follows after payment", "Buyer inspection and completion follow the verified order state"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-[#eadfce] bg-white p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span className="font-medium text-slate-700">{item}</span></div>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.10)] lg:sticky lg:top-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5 text-yellow-300" /> TBX Secure</div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">Reservation Summary</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between gap-4"><span>{listing.title}</span><strong>{formatZar(listing.priceZar)}</strong></div>
          <div className="flex justify-between gap-4"><span>{selectedMethod.name}</span><strong>{formatZar(selectedMethod.priceZar)}</strong></div>
          <div className="flex justify-between gap-4"><span>Insurance</span><strong>Included</strong></div>
          <div className="flex justify-between border-t border-[#eadfce] pt-3 text-base text-slate-950"><span>Expected total</span><strong>{formatZar(total)}</strong></div>
        </div>
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <Button type="button" onClick={reservePurchase} disabled={submitting} className="mt-6 h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 shadow-[0_16px_36px_rgba(245,179,1,0.25)] hover:bg-yellow-300 disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Reserving item…" : "Reserve this item"}
          {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
        <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-500"><LockKeyhole className="mt-1 h-4 w-4 shrink-0" /> Reserving creates a real TBX purchase reservation. No payment or courier booking happens at this step.</p>
      </aside>
    </div>
  );
}
