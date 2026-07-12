"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WantSetButton({ legoSetId, initialWanted }: { legoSetId: string; initialWanted: boolean }) {
  const [wanted, setWanted] = useState(initialWanted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleWant() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/wants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legoSetId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not update your Wants list.");
      setWanted(Boolean(payload.wanted));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update your Wants list.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        onClick={toggleWant}
        disabled={loading}
        variant="outline"
        className={wanted ? "h-12 rounded-xl border-yellow-300 bg-yellow-50 px-6 text-slate-950 hover:bg-yellow-100" : "h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"}
        aria-pressed={wanted}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={wanted ? "h-4 w-4 fill-current text-yellow-500" : "h-4 w-4"} />}
        {wanted ? "Wanted" : "Add to Wants"}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
