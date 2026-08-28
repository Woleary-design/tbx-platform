import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock3, ShoppingBag, Store } from "lucide-react";
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

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/sign-in?next=${encodeURIComponent("/orders")}`);

  const { data } = await supabase
    .from("purchase_reservations")
    .select("id,buyer_id,seller_id,amount,currency,status,created_at,assets(set_name,set_number)")
    .order("created_at", { ascending: false });

  const reservations = (data ?? []) as Reservation[];

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300">TBX Orders</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Buying & selling</h1>
        <p className="mt-3 max-w-2xl text-white/65">Real reservations linked to your account. Seller confirmations and buyer order progress live here.</p>
      </section>

      {reservations.length === 0 ? (
        <section className="rounded-[1.75rem] border border-[#eadfce] bg-white p-8 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-500">When you buy or sell through TBX, the reservation will appear here.</p>
          <Link href="/marketplace" className="mt-5 inline-flex font-semibold text-yellow-700 hover:text-yellow-800">Browse Marketplace →</Link>
        </section>
      ) : (
        <section className="space-y-3">
          {reservations.map((reservation) => {
            const asset = Array.isArray(reservation.assets) ? reservation.assets[0] : reservation.assets;
            const isSeller = reservation.seller_id === userData.user.id;
            const needsAction = isSeller && reservation.status === "awaiting_seller";
            return (
              <Link key={reservation.id} href={`/orders/${reservation.id}`} className="flex items-center gap-4 rounded-[1.5rem] border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${needsAction ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                  {isSeller ? <Store className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-950">{asset?.set_name || "TBX item"}</h2>
                    {needsAction ? <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Action required</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{isSeller ? "Selling" : "Buying"}{asset?.set_number ? ` · LEGO ${asset.set_number}` : ""} · {reservation.status.replaceAll("_", " ")}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-semibold text-slate-950">{reservation.currency} {Number(reservation.amount).toLocaleString("en-ZA")}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{new Date(reservation.created_at).toLocaleDateString("en-ZA")}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
