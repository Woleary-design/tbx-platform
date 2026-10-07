import { createHash, timingSafeEqual } from "node:crypto";

export const sandboxHost = "https://sandbox.payfast.co.za";

/** PHP urlencode, as required by PayFast's form signature protocol. */
export function encodePayfast(value: string) {
  return encodeURIComponent(value.trim()).replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`).replace(/%20/g, "+");
}

export function parameterString(fields: Record<string, string>, includeEmpty = false) {
  return Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && (includeEmpty || value !== ""))
    .map(([key, value]) => `${key}=${encodePayfast(value)}`).join("&");
}

export function signPayfast(fields: Record<string, string>, passphrase?: string, includeEmpty = false) {
  let value = parameterString(fields, includeEmpty);
  if (passphrase) value += `&passphrase=${encodePayfast(passphrase)}`;
  return createHash("md5").update(value).digest("hex");
}

export function validSignature(fields: Record<string, string>, passphrase?: string) {
  if (!/^[a-f0-9]{32}$/.test(fields.signature ?? "")) return false;
  return timingSafeEqual(Buffer.from(signPayfast(fields, passphrase, true), "hex"), Buffer.from(fields.signature, "hex"));
}

/** Parse money without floating-point rounding or permissive parseFloat. */
export function amountCents(value: string) {
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)) throw new Error("Invalid payment amount");
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents < 500) throw new Error("Invalid payment amount");
  return cents;
}

export function sandboxConfig() {
  if (process.env.TBX_PAYFAST_SANDBOX_ENABLED !== "true") return null;
  const merchantId = process.env.PAYFAST_SANDBOX_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYFAST_SANDBOX_MERCHANT_KEY?.trim();
  const passphrase = process.env.PAYFAST_SANDBOX_PASSPHRASE;
  const siteUrl = process.env.TBX_SITE_URL;
  if (!merchantId || !merchantKey || !passphrase || !siteUrl) return null;
  let url: URL;
  try { url = new URL(siteUrl); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
  const notifyBypass = process.env.VERCEL_ENV === "preview"
    ? process.env.TBX_PAYFAST_NOTIFY_BYPASS?.trim() : undefined;
  return { merchantId, merchantKey, passphrase, siteUrl: url.origin, notifyBypass };
}

export function checkoutFields(config: NonNullable<ReturnType<typeof sandboxConfig>>, attempt: { id: string; reservation_id: string; amount: string }) {
  const cents = amountCents(attempt.amount);
  const notifyUrl = new URL("/api/payments/payfast/notify", config.siteUrl);
  if (config.notifyBypass) notifyUrl.searchParams.set("x-vercel-protection-bypass", config.notifyBypass);
  const fields: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${config.siteUrl}/orders/${attempt.reservation_id}?sandbox=returned`,
    cancel_url: `${config.siteUrl}/orders/${attempt.reservation_id}?sandbox=cancelled`,
    notify_url: notifyUrl.toString(),
    m_payment_id: attempt.id,
    amount: (cents / 100).toFixed(2),
    item_name: `TBX sandbox test ${attempt.reservation_id}`,
  };
  return { ...fields, signature: signPayfast(fields, config.passphrase) };
}
