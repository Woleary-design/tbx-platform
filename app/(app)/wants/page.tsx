import Link from "next/link";
import { Heart, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function WantsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: wants } = user
    ? await supabase
        .from("collector_wants")
        .select("id, created_at, condition_preference, maximum_price_zar, lego_sets(id, set_number, name, theme, year_released, image_url)")
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Collector Intent</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">My Wants</h1>
        <p className="mt-4 max-w-2xl text-white/65">Sets you are actively looking for. Future marketplace listings will be matched against this list.</p>
      </section>

      {!wants || wants.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-yellow-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Your Wants list is empty.</h2>
          <p className="mt-2 text-slate-500">Browse Atlas and add the sets you are actively hunting.</p>
          <Button asChild className="mt-6 rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href="/atlas">Browse Atlas</Link></Button>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {wants.map((want) => {
            const set = Array.isArray(want.lego_sets) ? want.lego_sets[0] : want.lego_sets;
            if (!set) return null;
            return (
              <article key={want.id} className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_18px_55px_rgba(43,30,18,0.07)]">
                <Link href={`/atlas/${encodeURIComponent(set.set_number)}`} className="block bg-[#fffaf1] p-6">
                  <div className="flex h-52 items-center justify-center">
                    {set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <Heart className="h-16 w-16 text-yellow-400" />}
                  </div>
                </Link>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-600">LEGO {set.set_number}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{set.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{set.theme || "Uncategorised"}{set.year_released ? ` · ${set.year_released}` : ""}</p>
                  <div className="mt-5 flex gap-2">
                    <Button asChild variant="outline" className="flex-1 rounded-xl"><Link href={`/atlas/${encodeURIComponent(set.set_number)}`}>View Atlas</Link></Button>
                    <Button asChild className="flex-1 rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300"><Link href={`/collection/add?set=${encodeURIComponent(set.set_number)}`}><PackagePlus className="h-4 w-4" /> I own this</Link></Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
