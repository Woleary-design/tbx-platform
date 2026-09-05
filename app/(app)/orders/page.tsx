import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, ShoppingBag, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Reservation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number | string;
  currency: string;
  status: string;
  created_at: string;
  assets: { set_name: string | null; set_number: string | null } | { set_name: string | null; set_number: string | null }[] | null;
};

const statusCopy: Record<string, { label: string; detail: string }> = {
  awaiting_seller: { label: "Seller confirmation needed", detail: "Confirm whether the item is still available." },
  awaiting_payment: { label: "Waiting for payment", detail: "The seller confirmed the item and the buyer can continue." },
  ready_to_ship: { label: "Ready to send", detail: "Payment is complete. Prepare the parcel for delivery." },
  shipped: { label: "On the way", detail: "The parcel has been dispatched." },
  completed: { label: "Completed", detail: "This purchase has been completed." },
  seller_declined: { label: "Unavailable", detail: "The seller could not complete this sale." },
};

function OrderCard({ reservation, role }: { reservation: Reservation; role: "seller" | "buyer" }) {
  const asset = Array.isArray(reservation.assets) ? reservation.assets[0] : reservation.assets;
  const needsAction = role === "seller" && reservation.status === "awaiting_seller";
  const copy = statusCopy[reservation.status] ?? {
    label: reservation.status.replaceAll("_", " "),
    detail: "Open this order to see its latest progress.",
  };

  return (
    <Link
      href={`/orders/${reservation.id}`}
      className={`group block overflow-hidden rounded-[1.75rem] border transition hover:-translate-y-0.5 ${needsAction ? "border-[#ffd84d]/45 bg-[linear-gradient(135deg,rgba(255,216,77,0.14),rgba(255,255,255,0.035))] shadow-[0_18px_60px_rgba(255,216,77,0.08)]" : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]"}`}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${needsAction ? "bg-[#ffd84d] text-[#050915]" : "bg-white/[0.07] text-white/65"}`}>
          {role === "seller" ? <Store className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-[-0.02em] text-white">{asset?.set_name || "TBX item"}</h3>
            {needsAction ? <span className="rounded-full bg-[#ffd84d] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#050915]">Action required</span> : null}
          </div>
          <p className="mt-1 text-sm text-white/42">{asset?.set_number ? `LEGO ${asset.set_number}` : "Collection item"}</p>
          <div className="mt-4 flex items-start gap-2">
            {reservation.status === "completed" ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> : <Clock3 className={`mt-0.5 h-4 w-4 ${needsAction ? "text-[#ffd84d]" : "text-white/35"}`} />}
            <div>
              <p className={`text-sm font-bold ${needsAction ? "text-[#ffd84d]" : "text-white/75"}`}>{copy.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-white/42">{copy.detail}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-white/[0.08] pt-4 sm:block sm:min-w-40 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
          <div>
            <p className="text-xl font-black text-white">{reservation.currency} {Number(reservation.amount).toLocaleString("en-ZA")}</p>
            <p className="mt-1 text-xs text-white/35">{new Date(reservation.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <span className={`inline-flex items-center gap-2 text-sm font-bold sm:mt-4 ${needsAction ? "text-[#ffd84d]" : "text-white/60"}`}>
            {needsAction ? "Respond now" : "View order"}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function OrderSection({ title, description, reservations, role }: { title: string; description: string; reservations: Reservation[]; role: "seller" | "buyer" }) {
  if (reservations.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd84d]">{role === "seller" ? "Your sales" : "Your purchases"}</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/42">{description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/55">{reservations.length}</span>
      </div>
      <div className="space-y-3">{reservations.map((reservation) => <OrderCard key={reservation.id} reservation={reservation} role={role} />)}</div>
    </section>
  );
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/sign-in?next=${encodeURIComponent("/orders")}`);

  const { data } = await supabase
    .from("purchase_reservations")
    .select("id,buyer_id,seller_id,amount,currency,status,created_at,assets(set_name,set_number)")
    .order("created_at", { ascending: false });

  const reservations = (data ?? []) as Reservation[];
  const selling = reservations.filter((reservation) => reservation.seller_id === userData.user.id);
  const buying = reservations.filter((reservation) => reservation.buyer_id === userData.user.id);
  const actionsRequired = selling.filter((reservation) => reservation.status === "awaiting_seller").length;

  return (
    <div className="mx-auto max-w-6xl space-y-9">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(255,216,77,0.12),transparent_34%),#07101f] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffd84d]">TBX Orders</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white md:text-5xl">Buying &amp; Selling</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/52">Manage every purchase and sale in one place—from reservation to delivery.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
            {[["Selling", selling.length], ["Buying", buying.length], ["Needs action", actionsRequired]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {reservations.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-10 text-center">
          <PackageCheck className="mx-auto h-9 w-9 text-white/35" />
          <h2 className="mt-4 text-2xl font-black text-white">No orders yet</h2>
          <p className="mt-2 text-sm text-white/45">Your purchases and sales will appear here.</p>
          <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ffd84d] px-5 py-3 text-sm font-black text-[#050915]">Browse Marketplace <ArrowRight className="h-4 w-4" /></Link>
        </section>
      ) : (
        <div className="space-y-10">
          <OrderSection title="Selling" description="Reservations and sales for items you listed." reservations={selling} role="seller" />
          <OrderSection title="Buying" description="Items you reserved or purchased." reservations={buying} role="buyer" />
        </div>
      )}
    </div>
  );
}
