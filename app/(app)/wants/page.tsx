import Link from "next/link";
import { Bell, Box, Heart, PackagePlus, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type LegoSet = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  year_released: number | null;
  image_url: string | null;
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const [{ data: wants }, { data: popularSets }] = await Promise.all([
    user
      ? supabase
          .from("collector_wants")
          .select("id, created_at, condition_preference, maximum_price_zar, lego_sets(id, set_number, name, theme, year_released, image_url)")
          .eq("collector_id", user.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("lego_sets")
      .select("id, set_number, name, theme, year_released, image_url")
      .eq("is_active", true)
      .not("image_url", "is", null)
      .order("year_released", { ascending: false })
      .limit(5),
  ]);

  const suggestions = (popularSets ?? []) as LegoSet[];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)] md:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">Wishlist</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Sets you’d love to own one day.</h1>
          <p className="mt-4 max-w-xl text-white/70">Add LEGO sets to your wishlist and TBX will notify you when matching fixed-price listings become available.</p>
        </div>
      </section>

      {!wants || wants.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
          <Heart className="mx-auto h-11 w-11 text-yellow-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Your wishlist is empty</h2>
          <p className="mt-2 text-slate-500">Search the LEGO directory and add the sets you’re hunting for.</p>
          <Button asChild className="mt-6 rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
            <Link href="/dashboard"><Search className="h-4 w-4" /> Search LEGO Directory</Link>
          </Button>
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
                    <Button asChild variant="outline" className="flex-1 rounded-xl"><Link href={`/atlas/${encodeURIComponent(set.set_number)}`}>View set</Link></Button>
                    <Button asChild className="flex-1 rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300"><Link href={`/collection/add?set=${encodeURIComponent(set.set_number)}`}><PackagePlus className="h-4 w-4" /> I own this</Link></Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {suggestions.length > 0 ? (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">LEGO directory</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recently added sets</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {suggestions.map((set) => (
              <Link key={set.id} href={`/atlas/${encodeURIComponent(set.set_number)}`} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="grid aspect-square place-items-center bg-[#fffaf1] p-5">
                  {set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain transition group-hover:scale-105" /> : <Box className="h-10 w-10 text-slate-300" />}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-yellow-600">{set.set_number}</p>
                  <h3 className="mt-1 line-clamp-2 font-semibold text-slate-950">{set.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{set.theme || "LEGO"}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700"><Heart className="h-3.5 w-3.5" /> Add to wishlist</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-2xl font-semibold text-slate-950">Why use your wishlist?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: Bell, title: "Get notified", detail: "Know when a set from your wishlist is listed for sale." },
            { icon: TrendingUp, title: "Track availability", detail: "See live listings without negotiating or messaging sellers." },
            { icon: Box, title: "Plan your collection", detail: "Keep future builds separate from the sets you already own." },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-2xl border bg-white p-5">
              <Icon className="h-6 w-6 text-yellow-500" />
              <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
