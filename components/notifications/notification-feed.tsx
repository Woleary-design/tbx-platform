"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Notice = { historical?: boolean; id: string; title: string; body: string | null; entity_type: string | null; entity_id: string | null; read_at: string | null; created_at: string };
type Feed = { notifications: Notice[]; unread: number };

export function NotificationFeed({ orderId, bell = false, refreshOrders = false }: { orderId?: string; bell?: boolean; refreshOrders?: boolean }) {
  const router = useRouter();
  const previousIds = useRef<string | null>(null);
  const [feed, setFeed] = useState<Feed>({ notifications: [], unread: 0 });
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = orderId ? `/api/notifications?orderId=${encodeURIComponent(orderId)}` : bell ? "/api/notifications?countOnly=true" : "/api/notifications";
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(url, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Updates unavailable");
      const data: Feed = await response.json();
      const ids = data.notifications.map(item => item.id).join(",");
      if (refreshOrders && previousIds.current !== null && previousIds.current !== ids) router.refresh();
      previousIds.current = ids;
      setFeed(data); setError(false); setLoaded(true);
    } catch {
      if (!signal?.aborted) setError(true);
    }
  }, [url, refreshOrders, router]);
  useEffect(() => {
    const controller = new AbortController();
    const update = () => { if (document.visibilityState === "visible") void refresh(controller.signal); };
    update();
    const timer = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    window.addEventListener("tbx-notifications-read", update);
    document.addEventListener("visibilitychange", update);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", update); window.removeEventListener("tbx-notifications-read", update); document.removeEventListener("visibilitychange", update); };
  }, [refresh]);

  async function markRead(ids: string[]) {
    setBusy(true);
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      if (!response.ok) throw new Error("Could not mark read");
      window.dispatchEvent(new Event("tbx-notifications-read"));
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  if (bell) return <Link href="/notifications" aria-label={error ? "Notifications — updates unavailable" : `Notifications, ${feed.unread} unread`} className="relative inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-white hover:border-yellow-400/30"><Bell className="h-4 w-4" />{feed.unread > 0 ? <span className="rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-slate-950">{feed.unread > 99 ? "99+" : feed.unread}</span> : null}</Link>;
  const unreadIds = feed.notifications.filter(item => !item.read_at).map(item => item.id);
  const groups = new Map<string, Notice[]>();
  for (const item of feed.notifications) {
    const key = item.entity_type === "purchase_reservation" && item.entity_id ? item.entity_id : item.id;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  function renderNotice(item: Notice, historical = false) {
    return <article key={item.id} className={`rounded-xl border p-4 ${historical || item.read_at ? "border-white/10" : "border-yellow-400/30 bg-yellow-400/5"}`}>
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3><span className="text-xs text-slate-400">{historical ? "Past update" : !item.read_at ? "New" : "Current update"}</span></div>
      {item.body ? <p className="mt-2 text-sm leading-6 text-slate-300">{historical ? "Recorded in your order history. Open the order for its current status." : item.body}</p> : null}
      <p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })} SAST</p>
      <div className="mt-3 flex gap-4">{!orderId && !historical && item.entity_type === "purchase_reservation" && item.entity_id ? <Link href={`/orders/${item.entity_id}`} className="text-sm font-semibold text-yellow-300">Open order</Link> : null}{!item.read_at ? <button type="button" disabled={busy} onClick={() => void markRead([item.id])} className="text-xs text-slate-300 underline disabled:opacity-50">Mark read</button> : null}</div>
    </article>;
  }
  return <section aria-label="Order notifications" className="rounded-2xl border border-white/10 bg-[#0b1220] p-5 text-white">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><Bell className="h-5 w-5 text-yellow-400" />{orderId ? "Your order updates" : "Your notifications"}</h2>{unreadIds.length > 0 ? <button type="button" disabled={busy} onClick={() => void markRead(unreadIds)} className="rounded-lg border border-white/20 px-3 py-2 text-xs disabled:opacity-50">Mark shown updates read</button> : null}</div>
    <p className="mt-2 text-xs text-slate-400">In-app updates refresh every 30 seconds while this screen is open.</p>
    {error ? <p role="status" className="mt-3 text-sm text-amber-300">Could not refresh updates. <button type="button" onClick={() => void refresh()} className="underline">Try again</button></p> : null}
    {!loaded && !error ? <p className="mt-4 text-sm text-slate-400">Loading updates…</p> : null}
    {loaded && feed.notifications.length === 0 ? <p className="mt-4 text-sm text-slate-400">No updates yet.</p> : null}
    <div className="mt-4 space-y-3">{Array.from(groups.entries()).map(([key, notices]) => <div key={key}>
      {renderNotice(notices[0], Boolean(notices[0].historical))}
      {notices.length > 1 ? <details className="mt-2 rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-sm text-slate-400">Order history · {notices.length - 1} earlier updates</summary><div className="mt-3 space-y-2">{notices.slice(1).map(item => renderNotice(item, true))}</div></details> : null}
    </div>)}</div>
  </section>;
}
