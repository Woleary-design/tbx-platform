import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketplaceListings } from "@/features/renaissance/data/collector-experience.mock";

const listing = marketplaceListings[0];

const steps = ["Review Order", "Payment", "TBX Secure", "Courier", "Inspection", "Complete"];

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href={`/marketplace/${listing.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to listing</Link>
      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Protected Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Buy with TBX Secure.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Your funds are protected while the seller packs, dispatches and delivers the item. Release only happens after delivery and the inspection window.</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Checkout steps</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className={index === 0 ? "rounded-2xl bg-yellow-400 p-4 text-slate-950 shadow" : "rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4 text-slate-600"}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">Step {index + 1}</p>
                  <p className="mt-2 font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
              <div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">Payment method</h2></div>
              <div className="mt-5 grid gap-3">
                {["Card placeholder", "Instant EFT placeholder", "Manual EFT placeholder"].map((item) => (
                  <div key={item} className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4 text-sm font-medium text-slate-700">{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
              <div className="flex items-center gap-3"><Truck className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">Delivery</h2></div>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4">Courier: The Courier Guy</p>
                <p className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4">Estimated delivery: 2 days</p>
                <p className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4">Insurance: Included</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">TBX Secure timeline</h2>
            <div className="mt-6 grid gap-4">
              {["Payment protected", "Seller packs item", "Courier collected", "Buyer inspection window", "Funds released"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-[#eadfce] bg-[#fffaf1] p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span className="font-medium text-slate-700">{item}</span></div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.10)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5 text-yellow-300" /> TBX Secure</div>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>{listing.title}</span><strong>{listing.price}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>Included</strong></div>
            <div className="flex justify-between"><span>Insurance</span><strong>Included</strong></div>
            <div className="flex justify-between border-t border-[#eadfce] pt-3 text-base text-slate-950"><span>Total</span><strong>{listing.price}</strong></div>
          </div>
          <Button asChild className="mt-6 h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 shadow-[0_16px_36px_rgba(245,179,1,0.25)] hover:bg-yellow-300">
            <Link href="/orders/TBX-1001">Confirm protected checkout <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-500"><LockKeyhole className="mt-1 h-4 w-4 shrink-0" /> Mock checkout only. No payment is processed yet.</p>
        </aside>
      </div>
    </div>
  );
}
