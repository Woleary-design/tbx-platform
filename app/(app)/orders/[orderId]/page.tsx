import Link from "next/link";
import { CheckCircle2, Clock, PackageCheck, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const timeline = [
  { label: "Payment Protected", active: true },
  { label: "Seller Confirmed", active: true },
  { label: "Packed", active: true },
  { label: "Courier Collected", active: false },
  { label: "In Transit", active: false },
  { label: "Delivered", active: false },
  { label: "Inspection Window", active: false },
  { label: "Funds Released", active: false },
];

export default function OrderTimelinePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>
      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Order TBX-1001</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Your payment is protected.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">The seller has confirmed the order. TBX Secure keeps funds protected until delivery and inspection are complete.</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
          <h2 className="text-2xl font-semibold text-slate-950">Protected transaction timeline</h2>
          <div className="mt-8 space-y-4">
            {timeline.map((step, index) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={step.active ? "grid h-9 w-9 place-items-center rounded-full bg-yellow-400 text-slate-950" : "grid h-9 w-9 place-items-center rounded-full border border-[#eadfce] bg-[#fffaf1] text-slate-400"}>
                    {step.active ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </span>
                  {index < timeline.length - 1 ? <span className="mt-2 h-8 w-px bg-[#eadfce]" /> : null}
                </div>
                <div className="pt-1">
                  <p className={step.active ? "font-semibold text-slate-950" : "font-semibold text-slate-500"}>{step.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{step.active ? "Completed" : "Waiting for next update"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">TBX Secure</h2></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Funds remain protected while the item is packed, collected, delivered and inspected.</p>
          </div>
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-6 shadow-[0_18px_55px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><PackageCheck className="h-6 w-6 text-yellow-500" /><h2 className="text-xl font-semibold text-slate-950">Inspection Window</h2></div>
            <p className="mt-4 text-3xl font-semibold text-slate-950">48:00</p>
            <p className="mt-1 text-sm text-slate-500">Countdown placeholder after delivery.</p>
            <div className="mt-5 grid gap-3">
              <Button className="rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300">Accept Item</Button>
              <Button variant="outline" className="rounded-xl border-[#eadfce]">Report Issue</Button>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-[#eadfce] bg-[#fffaf1] p-6">
            <div className="flex items-center gap-3"><Star className="h-6 w-6 fill-yellow-400 text-yellow-400" /><h2 className="text-xl font-semibold text-slate-950">After completion</h2></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Funds release, seller is paid, trust scores update and both collectors can review each other.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
