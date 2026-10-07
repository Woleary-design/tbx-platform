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
  let query = supabase.from("notifications").select("id,notification_type,title,body,entity_type,entity_id,read_at,created_at").eq("recipient_id", user.id);
  if (orderId) query = query.eq("entity_type", "purchase_reservation").eq("entity_id", orderId);
  const [items, unread] = await Promise.all([
    countOnly ? Promise.resolve({ data: [], error: null }) : query.order("created_at", { ascending: false }).limit(orderId ? 20 : 100),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).is("read_at", null),
  ]);
  if (items.error || unread.error) return NextResponse.json({ error: "Updates unavailable" }, { status: 503, headers });
  const notices = items.data ?? [];
  const confirmationOrders = notices.filter(item => item.notification_type === "purchase.seller_confirmed" && item.entity_id).map(item => item.entity_id);
  let verifiedOrders = new Set<string>();
  if (confirmationOrders.length) {
    const verified = await supabase.from("notifications").select("entity_id").eq("recipient_id", user.id).eq("notification_type", "purchase.sandbox_payment_verified").eq("entity_type", "purchase_reservation").in("entity_id", confirmationOrders);
    if (verified.error) return NextResponse.json({ error: "Updates unavailable" }, { status: 503, headers });
    verifiedOrders = new Set((verified.data ?? []).map(item => item.entity_id));
  }
  const notifications = notices.map(item => {
    const historical = item.notification_type === "purchase.seller_confirmed" && item.entity_type === "purchase_reservation" && verifiedOrders.has(item.entity_id);
    if (historical) return { ...item, historical: true, body: "The seller confirmed availability before your test payment was verified. Open the order for its current status." };
    if (item.notification_type === "purchase.sandbox_payment_verified" && item.title === "Your test payment was verified") return { ...item, body: "Your test payment was verified. Delivery simulation pending. No real money was taken." };
    return item;
  });
  return NextResponse.json({ notifications, unread: unread.count ?? 0 }, { headers });
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
