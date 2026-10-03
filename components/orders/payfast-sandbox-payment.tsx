"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayfastSandboxPayment({ reservationId, status }: { reservationId: string; status?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/payfast/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Sandbox checkout unavailable");
      if (result.mode !== "sandbox" || result.action !== "https://sandbox.payfast.co.za/eng/process") throw new Error("Unexpected checkout destination");
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;
      for (const [name, value] of Object.entries(result.fields)) {
        const input = document.createElement("input");
        input.type = "hidden"; input.name = name; input.value = String(value);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      form.remove();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sandbox checkout unavailable");
      setLoading(false);
    }
  }
  return (
    <section className="rounded-[1.75rem] border border-yellow-200 bg-yellow-50 p-6">
      <h2 className="font-semibold text-slate-950">PayFast sandbox test</h2>
      <p className="mt-2 text-sm text-slate-600">This is a test payment. No real money is collected, and this test does not arrange dispatch or complete your purchase.</p>
      {status === "complete" ? <p role="status" className="mt-4 font-semibold text-emerald-700">Test payment verified by PayFast.</p> : status === "cancelled" ? <p role="status" className="mt-4 text-slate-600">Sandbox test cancelled.</p> : <Button type="button" disabled={loading} onClick={pay} className="mt-4">{loading ? "Opening sandbox…" : "Test with PayFast sandbox"}</Button>}
      <p className="mt-3 text-xs text-slate-500">After returning from PayFast, refresh this page to check the verified test result.</p>
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
