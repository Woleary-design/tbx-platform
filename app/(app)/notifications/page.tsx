import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type NotificationData = { href?: string } | null;

function notificationHref(entityType: string | null, entityId: string | null, data: NotificationData) {
  if (data?.href) return data.href;
  if (!entityType || !entityId) return null;
  if (entityType === "purchase_reservation" || entityType === "order") return `/orders/${entityId}`;
  if (entityType === "listing") return `/marketplace/${entityId}`;
  return null;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("id, notification_type, title, body, entity_type, entity_id, data, read_at, created_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,.10),rgba(255,255,255,.02))] p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-violet-300">Notifications</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What needs your attention</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Order updates, seller confirmations and marketplace activity appear here.</p>
      </section>

      {!notifications || notifications.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] p-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold text-white">You are all caught up.</h2>
          <p className="mt-2 text-sm text-slate-500">There are no notifications for your account right now.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]">
          {notifications.map((notification) => {
            const href = notificationHref(notification.entity_type, notification.entity_id, notification.data as NotificationData);
            const content = (
              <div className={`flex gap-4 border-b border-white/10 p-5 last:border-b-0 ${notification.read_at ? "bg-transparent" : "bg-violet-400/[0.04]"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{notification.title}</p>
                    {!notification.read_at ? <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[11px] font-semibold text-violet-300">New</span> : null}
                  </div>
                  {notification.body ? <p className="mt-1 text-sm leading-6 text-slate-400">{notification.body}</p> : null}
                  <p className="mt-2 text-xs text-slate-600">{new Date(notification.created_at).toLocaleString("en-ZA")}</p>
                </div>
              </div>
            );
            return href ? <Link key={notification.id} href={href} className="block hover:bg-white/[0.025]">{content}</Link> : <div key={notification.id}>{content}</div>;
          })}
        </section>
      )}
    </div>
  );
}
