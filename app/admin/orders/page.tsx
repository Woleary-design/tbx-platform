import Link from "next/link";
import { requireAdmin, canAccessAdminSection } from "@/lib/admin";
import { moneyCents, payoutLabel, type SandboxLedger } from "@/lib/money/ledger";
import { sandboxConfig } from "@/lib/payments/payfast";

function date(value: string | null) {
  return value ? `${new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" })} SAST` : "—";
}

export default async function AdminOrdersPage() {
  const { supabase, role } = await requireAdmin("orders");
  const sandbox = Boolean(sandboxConfig());
  const { data: orders, error } = await supabase.from("purchase_reservations")
    .select("id,listing_id,buyer_id,seller_id,amount,currency,status,created_at,seller_deadline,payment_deadline,seller_responded_at,paid_at,shipped_at,completed_at,tracking_number,carrier,assets(set_name,set_number)")
    .order("created_at", { ascending: false }).limit(100);
  const rows = orders ?? [];
  const canReadLedger = ["super_admin", "finance", "operations", "support"].includes(role);
  const { data: ledgers, error: ledgerError } = sandbox && canReadLedger && rows.length
    ? await supabase.from("sandbox_order_ledger").select("*").in("reservation_id", rows.map(o => o.id))
    : { data: null, error: null };
  const states = new Map<string, SandboxLedger>((ledgers ?? []).map(l => [l.reservation_id, l]));
  const accountIds = [...new Set(rows.flatMap(o => [o.buyer_id, o.seller_id]))];
  const { data: members } = accountIds.length ? await supabase.from("collectors").select("id,display_name,username,tbx_id").in("id", accountIds) : { data: null };
  const names = new Map((members ?? []).map(m => [m.id, m.display_name || m.username || m.tbx_id || m.id.slice(0,8).toUpperCase()]));
  const accountName = (id: string) => names.get(id) || `Account ${id.slice(0,8).toUpperCase()}`;
  const complete = rows.filter(o => states.get(o.id)?.status === "paid_test" || o.status === "completed").length;
  const paymentPending = rows.filter(o => o.status === "awaiting_payment" && !states.has(o.id)).length;
  return <div className="space-y-6">
    <div><p className="text-sm font-semibold text-violet-300">Orders</p><h1 className="mt-2 text-3xl font-semibold">Buyer &amp; seller progress</h1><p className="mt-2 text-slate-400">See both sides of each order, what happens next and who needs to act. All times are SAST.</p></div>
    {sandbox ? <p className="rounded-xl border border-amber-400/30 p-4 text-sm text-amber-300">Sandbox: payments, delivery and payouts shown here are tests. No courier booking or bank transfer occurs.</p> : null}
    {error || ledgerError ? <p role="alert" className="text-amber-300">Some order information could not be loaded. Refresh before taking action.</p> : null}
    {sandbox && !canReadLedger ? <p className="text-sm text-slate-400">Your role can view reservations. Sandbox delivery and finance details require Owner, Finance, Operations or Support access.</p> : null}
    <div className="grid gap-4 sm:grid-cols-4">{[["Awaiting seller", rows.filter(o => o.status === "awaiting_seller").length],["Awaiting payment",paymentPending],["Problems to review",(ledgers ?? []).filter(l => l.status === "disputed").length],["Completed",complete]].map(([label,value]) => <div key={label} className="tbx-surface rounded-2xl p-5"><p className="text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-slate-400">{label}</p></div>)}</div>
    {!error && rows.length === 0 ? <p className="text-slate-400">No orders yet.</p> : null}
    {rows.map(order => {
      const ledger = states.get(order.id);
      const asset = Array.isArray(order.assets) ? order.assets[0] : order.assets;
      const payment = ledger ? "Test payment verified" : order.paid_at ? "Payment received" : "Payment pending";
      const settled = ledger?.status === "paid_test" || ledger?.status === "refunded_test";
      const delivery = ledger ? ({ pending: "Delivery preparation", in_transit: "Test parcel dispatched", delivered: "Test parcel delivered", disputed: "Problem under review", paid_test: "Test order complete", refunded_test: "Test order refunded" }[ledger.status] ?? ledger.status) : order.status.replaceAll("_", " ");
      const buyerNext = settled ? "No action needed." : ledger?.status === "disputed" ? "Wait for the reported problem to be reviewed." : ledger?.status === "delivered" ? ledger.buyer_accepted_at ? "Receipt confirmed. Wait for payout review." : "Confirm receipt or report a problem." : ledger ? "Wait for delivery updates. Do not pay again." : order.status === "awaiting_seller" ? "Wait for seller confirmation." : order.status === "awaiting_payment" ? "Open checkout when the full payment total is ready." : "Follow the order's delivery updates.";
      const sellerNext = settled ? "No action needed." : ledger?.status === "disputed" ? "Payout paused. Wait for review." : ledger?.status === "delivered" ? "Wait for receipt confirmation and payout review." : ledger ? "Follow the sandbox delivery test. Do not dispatch the real item." : order.status === "awaiting_seller" ? "Confirm availability or decline." : order.status === "awaiting_payment" ? "Wait for verified payment before dispatch." : "Follow the order's delivery instructions.";
      const adminNext = settled ? "Complete — no action needed." : ledger?.status === "disputed" ? "Review the reported problem before any payout." : ledger?.courier_cents === null ? "Confirm the test courier cost." : ledger?.status === "pending" ? "Simulate dispatch." : ledger?.status === "in_transit" ? "Simulate delivery." : ledger?.status === "delivered" ? !ledger.buyer_accepted_at && (!ledger.inspection_ends_at || Date.parse(ledger.inspection_ends_at) > Date.now()) ? "Wait for buyer receipt confirmation or the inspection deadline." : ledger.processor_cents === null ? "Record the test processing fee." : "Finance: review and simulate seller payout." : order.status === "awaiting_seller" ? "Wait for the seller's response." : order.status === "awaiting_payment" ? "Wait for checkout and verified payment." : "Review delivery progress.";
      return <article key={order.id} id={`order-${order.id}`} className="tbx-surface rounded-2xl border border-white/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{asset?.set_name || "TBX item"}</h2><p className="mt-1 text-xs text-slate-400">Order {order.id.slice(0,8).toUpperCase()} · {asset?.set_number ? `LEGO ${asset.set_number}` : "Collection item"}</p></div><div className="text-right"><p className="font-semibold">{order.currency} {Number(order.amount).toLocaleString("en-ZA", {minimumFractionDigits:2})}</p><p className="mt-1 text-sm text-violet-300">{delivery}</p></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-white/10 p-4"><h3 className="font-semibold">Buyer</h3><p className="mt-1 break-all text-xs text-slate-400">{accountName(order.buyer_id)}</p><p className="mt-3 text-sm">{payment}</p>{ledger ? <p className="mt-1 text-sm text-slate-400">Receipt: {ledger.buyer_accepted_at ? "Confirmed" : settled ? "Test closed" : "Waiting"}</p> : null}<p className="mt-3 text-sm text-yellow-300">Next: {buyerNext}</p></section>
          <section className="rounded-xl border border-white/10 p-4"><h3 className="font-semibold">Seller</h3><p className="mt-1 break-all text-xs text-slate-400">{accountName(order.seller_id)}</p><p className="mt-3 text-sm">Availability: {order.seller_responded_at || ledger || order.paid_at ? "Responded" : "Waiting for response"}</p>{ledger ? <p className="mt-1 text-sm text-slate-400">Payout: {payoutLabel(ledger)} · {ledger.seller_cents === null ? "Amount pending" : moneyCents(ledger.seller_cents)}</p> : null}<p className="mt-3 text-sm text-yellow-300">Next: {sellerNext}</p></section>
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.04] p-4"><p className="text-sm font-semibold">Admin next step</p><p className="mt-1 text-sm text-slate-300">{adminNext}</p>{ledger && canAccessAdminSection(role,"payouts") ? <Link href={`/admin/payouts#order-${order.id}`} className="mt-3 inline-block text-sm font-semibold text-yellow-300">Open finance &amp; delivery controls →</Link> : null}</div>
        <details className="mt-4 text-sm"><summary className="cursor-pointer text-slate-400">Dates and tracking</summary><dl className="mt-3 grid gap-2 text-slate-400 sm:grid-cols-2"><div>Created: {date(order.created_at)}</div><div>Seller response: {date(order.seller_responded_at)}</div><div>Seller deadline: {date(order.seller_deadline)}</div><div>Payment deadline: {ledger ? "Test payment already verified" : date(order.payment_deadline)}</div><div>Inspection ends: {date(ledger?.inspection_ends_at ?? null)}</div><div>Tracking: {order.carrier || "—"} {order.tracking_number || ""}</div></dl></details>
      </article>;
    })}
  </div>;
}
