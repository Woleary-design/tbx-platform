"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function money(value: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value ?? 0);
}

export function MinifigureMarketValue({
  assetId,
  minifigureId,
  condition,
  initialValue,
}: {
  assetId: string;
  minifigureId: string;
  condition: string;
  initialValue: number | null;
}) {
  const [value, setValue] = useState<number | null>(initialValue && initialValue > 0 ? initialValue : null);
  const [loading, setLoading] = useState(!initialValue || initialValue <= 0);

  useEffect(() => {
    if (value && value > 0) return;
    let cancelled = false;

    async function resolve() {
      try {
        const supabase = createClient();
        const { data: figure } = await supabase
          .from("lego_minifigures")
          .select("catalogue_id")
          .eq("id", minifigureId)
          .maybeSingle();

        if (!figure?.catalogue_id || cancelled) return;
        const response = await fetch(`/api/value/minifigure/${encodeURIComponent(figure.catalogue_id)}?condition=${encodeURIComponent(condition)}`);
        const payload = await response.json();
        const estimate = Number(payload?.quote?.recommended ?? 0);
        if (!response.ok || !Number.isFinite(estimate) || estimate <= 0 || cancelled) return;

        const rounded = Math.round(estimate);
        setValue(rounded);
        await supabase.from("assets").update({ estimated_value: rounded }).eq("id", assetId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void resolve();
    return () => { cancelled = true; };
  }, [assetId, condition, minifigureId, value]);

  if (loading && !value) return <span className="text-white/45">Checking…</span>;
  return <>{value ? money(value) : "Pricing unavailable"}</>;
}
