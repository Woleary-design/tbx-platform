import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { safeNextPath } from "@/lib/auth/safe-next";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_recovery_link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code, request.nextUrl.searchParams.get("sb_flow_id") ? { flowId: request.nextUrl.searchParams.get("sb_flow_id")! } : undefined);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=recovery_link_expired`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
