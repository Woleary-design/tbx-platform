import { NextRequest, NextResponse } from "next/server";
import { amountCents, parameterString, sandboxConfig, sandboxHost, validSignature } from "@/lib/payments/payfast";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = sandboxConfig();
  if (!config) return new NextResponse("Sandbox unavailable", { status: 503 });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return new NextResponse("Invalid content type", { status: 415 });
  const text = await request.text();
  if (text.length > 16000) return new NextResponse("Payload too large", { status: 413 });
  const params = new URLSearchParams(text);
  const fields: Record<string, string> = {};
  for (const [key, value] of params) {
    if (Object.hasOwn(fields, key) || !/^[a-z][a-z0-9_]*$/.test(key)) return new NextResponse("Invalid fields", { status: 400 });
    fields[key] = value;
  }
  if (fields.merchant_id !== config.merchantId || !validSignature(fields, config.passphrase)) return new NextResponse("Invalid signature", { status: 400 });
  if (!/^[0-9a-f-]{36}$/i.test(fields.m_payment_id ?? "") || !/^\d+$/.test(fields.pf_payment_id ?? "")) return new NextResponse("Invalid payment ID", { status: 400 });
  if (!["COMPLETE", "CANCELLED"].includes(fields.payment_status)) return new NextResponse("Unsupported status", { status: 400 });
  let cents: number;
  try { cents = amountCents(fields.amount_gross); } catch { return new NextResponse("Invalid amount", { status: 400 }); }
  try {
    // Never trust browser redirects or a referrer header as payment confirmation.
    const validation = await fetch(`${sandboxHost}/eng/query/validate`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: parameterString(fields, true), signal: AbortSignal.timeout(10000), redirect: "error",
    });
    if (!validation.ok) return new NextResponse("Validation unavailable", { status: 503 });
    if ((await validation.text()).trim() !== "VALID") return new NextResponse("Payment not verified", { status: 400 });
    const service = createServiceClient();
    const { error } = await service.rpc("record_payfast_sandbox_notification", {
      target_attempt_id: fields.m_payment_id, provider_payment_id: fields.pf_payment_id,
      received_amount: cents / 100, received_status: fields.payment_status,
    });
    if (error) return new NextResponse("Payment reconciliation unavailable", { status: 503 });
    return new NextResponse("OK", { status: 200 });
  } catch {
    return new NextResponse("Payment validation unavailable", { status: 503 });
  }
}
