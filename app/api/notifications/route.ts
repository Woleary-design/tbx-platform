import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers });
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (orderId && !uuid.test(orderId)) return NextResponse.json({ error: "Invalid order" }, { status: 400, headers });
  const countOnly = request.nextUrl.searchParams.get("countOnly") === "true";
  let query = supabase.from("notifications").select("id,title,body,entity_type,entity_id,read_at,created_at").eq("recipient_id", user.id);
  if (orderId) query = query.eq("entity_type", "purchase_reservation").eq("entity_id", orderId);
  const [items, unread] = await Promise.all([
    countOnly ? Promise.resolve({ data: [], error: null }) : query.order("created_at", { ascending: false }).limit(orderId ? 20 : 100),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).is("read_at", null),
  ]);
  if (items.error || unread.error) return NextResponse.json({ error: "Updates unavailable" }, { status: 503, headers });
  return NextResponse.json({ notifications: items.data, unread: unread.count ?? 0 }, { headers });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400, headers }); }
  if (!Array.isArray(body?.ids) || !body.ids.length || body.ids.length > 100 || !body.ids.every((id: unknown) => typeof id === "string" && uuid.test(id))) return NextResponse.json({ error: "Invalid notifications" }, { status: 400, headers });
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null).in("id", body.ids);
  return error ? NextResponse.json({ error: "Could not mark read" }, { status: 503, headers }) : NextResponse.json({ ok: true }, { headers });
}
