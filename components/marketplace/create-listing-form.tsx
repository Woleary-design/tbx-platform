"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateListingForm({
  assetId,
  suggestedPrice,
}: {
  assetId: string;
  suggestedPrice: number | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          priceZar: Number(form.get("price_zar")),
          region: form.get("region"),
          shippingOption: form.get("shipping_option"),
          dispatchDays: Number(form.get("dispatch_days")),
          publish: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The listing could not be published.");
      router.push(`/marketplace/${payload.listingId}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The listing could not be published.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-5">
        <p className="font-semibold text-slate-950">Collection data is already attached.</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">Condition, Atlas identity and Collector Confidence come from the Collection Record. Only sale-specific details are required.</p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Asking price (R)</span>
        <input name="price_zar" type="number" required min="1" step="0.01" defaultValue={suggestedPrice ?? ""} placeholder="Enter asking price" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Delivery</span>
          <select name="shipping_option" defaultValue="courier" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">
            <option value="courier">Courier</option>
            <option value="collection">Collection only</option>
            <option value="courier_or_collection">Courier or collection</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Dispatch within</span>
          <select name="dispatch_days" defaultValue="3" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">
            {[1, 2, 3, 5, 7].map((days) => <option key={days} value={days}>{days} day{days === 1 ? "" : "s"}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Availability region</span>
        <select name="region" defaultValue="south_africa" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">
          <option value="south_africa">South Africa</option>
          <option value="worldwide">Worldwide</option>
        </select>
      </label>

      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={saving} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {saving ? "Publishing…" : "Publish Listing"}
        {!saving ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
