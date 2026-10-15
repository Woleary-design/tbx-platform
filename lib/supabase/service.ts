import { createClient } from "@supabase/supabase-js";

/** Import only in server routes; never expose this key in NEXT_PUBLIC variables. */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sandboxUrl = process.env.TBX_SANDBOX_SUPABASE_URL;
  // A sandbox override must be confined to Preview and match the browser database.
  const key = sandboxUrl
    ? process.env.VERCEL_ENV === "preview" && url === sandboxUrl
      ? process.env.TBX_SANDBOX_SERVICE_ROLE_KEY
      : undefined
    : process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Payment service configuration unavailable");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
