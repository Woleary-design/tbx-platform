"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SellerConfirmationActions({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"confirm" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(available: boolean) {
    setPending(available ? "confirm" : "decline");
    setError(null);

    try {
      const response = await fetch("/api/purchases/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, available }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error || "Could not update this order.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this order.");
      setPending(null);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-yellow-200 bg-yellow-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-700">Seller action required</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Is this item still available?</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Confirm only if you still have the item and are ready to complete the sale. The buyer will not be asked to pay until you confirm.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={pending !== null}
          onClick={() => respond(true)}
          className="rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {pending === "confirm" ? "Confirming…" : "Yes, confirm available"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => respond(false)}
          className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
        >
          <XCircle className="mr-2 h-4 w-4" />
          {pending === "decline" ? "Updating…" : "No, item unavailable"}
        </Button>
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}
    </section>
  );
}
