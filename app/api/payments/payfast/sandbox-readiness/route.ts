import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return new NextResponse("Not found", { status: 404 });
  const site = process.env.TBX_SITE_URL;
  const bypass = process.env.TBX_PAYFAST_NOTIFY_BYPASS;
  const sandboxUrl = process.env.TBX_SANDBOX_SUPABASE_URL;
  const databaseIsolated = Boolean(sandboxUrl && sandboxUrl === process.env.NEXT_PUBLIC_SUPABASE_URL && sandboxUrl === process.env.SUPABASE_URL);
  const configured = Boolean(site && bypass && databaseIsolated && process.env.TBX_SANDBOX_SERVICE_ROLE_KEY && process.env.PAYFAST_SANDBOX_MERCHANT_ID && process.env.PAYFAST_SANDBOX_MERCHANT_KEY && process.env.PAYFAST_SANDBOX_PASSPHRASE);
  if (!configured) return NextResponse.json({ configured: false, databaseIsolated, callbackReachable: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    const url = new URL("/api/payments/payfast/notify", site);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid site");
    url.searchParams.set("x-vercel-protection-bypass", bypass!);
    // Deliberately invalid payment: this must never record an attempt.
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "signature=invalid", redirect: "manual", signal: AbortSignal.timeout(10000), cache: "no-store" });
    const body = await response.text();
    const callbackReachable = (response.status === 400 && body === "Invalid signature") || (response.status === 503 && body === "Sandbox unavailable");
    return NextResponse.json({ configured, databaseIsolated, sandboxEnabled: process.env.TBX_PAYFAST_SANDBOX_ENABLED === "true", callbackReachable, invalidNotificationRejected: response.status === 400 && body === "Invalid signature" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ configured, databaseIsolated, callbackReachable: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
