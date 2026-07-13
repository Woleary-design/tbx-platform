import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("id, type, title, body, href, read_at, created_at")
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Notification Centre</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">What needs your attention</h1>
        <p className="mt-4 max-w-2xl text-white/65">Wanted listings, confidence changes and collection milestones will appear here.</p>
      </section>

      {!notifications || notifications.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">You are all caught up.</h2>
          <p className="mt-2 text-slate-500">Relevant collector alerts will appear here as TBX events are processed.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_20px_65px_rgba(43,30,18,0.07)]">
          {notifications.map((notification) => {
            const content = (
              <div className={`flex gap-4 border-b border-slate-100 p-5 last:border-b-0 ${notification.read_at ? "bg-white" : "bg-[#fffaf1]"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{notification.title}</p>
                  {notification.body ? <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p> : null}
                  <p className="mt-2 text-xs text-slate-400">{new Date(notification.created_at).toLocaleString("en-ZA")}</p>
                </div>
              </div>
            );
            return notification.href ? <Link key={notification.id} href={notification.href} className="block hover:bg-slate-50">{content}</Link> : <div key={notification.id}>{content}</div>;
          })}
        </section>
      )}
    </div>
  );
}
