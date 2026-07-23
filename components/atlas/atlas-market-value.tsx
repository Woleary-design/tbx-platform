"use client";

import { useEffect, useState } from "react";
import { MarketSnapshot } from "@/components/market/market-snapshot";
import {
  MARKET_CONDITIONS,
  type CatalogueIdentity,
  type MarketCondition,
  type MarketSnapshotData,
} from "@/lib/market/intelligence";

export function AtlasMarketValue({ identity }: { identity: CatalogueIdentity }) {
  const [condition, setCondition] = useState<MarketCondition>("Used Complete");
  const [data, setData] = useState<MarketSnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/value/${encodeURIComponent(identity.identifier)}?condition=${encodeURIComponent(condition)}`,
          { signal: controller.signal },
        );
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Pricing is unavailable.");
        setData({ ...(payload as MarketSnapshotData), identity });
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        setData(null);
        setError(caughtError instanceof Error ? caughtError.message : "Pricing is unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [condition, identity.category, identity.identifier, identity.name]);

  return (
    <section className="space-y-4" aria-labelledby={`market-value-${identity.identifier}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">Atlas market intelligence</p>
          <h2 id={`market-value-${identity.identifier}`} className="mt-2 text-3xl font-semibold text-white">
            What is it worth today?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Compare live TBX listings with exact-match market evidence and a condition-adjusted estimate for this {identity.category} record.
          </p>
        </div>
        <label className="block min-w-64">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Condition</span>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value as MarketCondition)}
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#0b1223] px-4 text-sm text-white outline-none focus:border-yellow-400/40"
          >
            {MARKET_CONDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm text-amber-100">
          {error}
        </div>
      ) : (
        <MarketSnapshot data={data} loading={loading} />
      )}
    </section>
  );
}
