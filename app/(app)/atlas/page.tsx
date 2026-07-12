import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type AtlasSet = {
  id: string;
  set_number: string;
  name: string;
  theme: string | null;
  subtheme: string | null;
  year_released: number | null;
  piece_count: number | null;
  minifigure_count: number | null;
  image_url: string | null;
};

export default async function AtlasDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  let request = supabase
    .from("lego_sets")
    .select("id, set_number, name, theme, subtheme, year_released, piece_count, minifigure_count, image_url")
    .eq("is_active", true)
    .order("year_released", { ascending: false, nullsFirst: false })
    .limit(60);

  if (query) {
    const escaped = query.replace(/[%_,]/g, "");
    request = request.or(`set_number.ilike.%${escaped}%,name.ilike.%${escaped}%,theme.ilike.%${escaped}%,subtheme.ilike.%${escaped}%`);
  }

  const { data } = await request;
  const sets = (data ?? []) as AtlasSet[];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300">
              <BookOpen className="h-4 w-4" /> Project Atlas
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">The LEGO directory for serious collectors.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Find official set records, understand what belongs with each set, and add the right item to your collection without re-entering catalogue data.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <p className="mt-4 font-semibold">Atlas is the reference layer.</p>
            <p className="mt-2 text-sm leading-6 text-white/65">Collection Records, evidence requirements and future market intelligence will all connect back to one trusted set record.</p>
          </div>
        </div>
      </section>

      <form className="rounded-[1.5rem] border border-[#eadfce] bg-white p-4 shadow-[0_16px_50px_rgba(43,30,18,0.08)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by set number, name, theme or subtheme"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-32 text-sm outline-none transition focus:border-slate-400"
          />
          <Button className="absolute right-2 top-2 h-10 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800">Search Atlas</Button>
        </label>
      </form>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">LEGO Directory</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{query ? `Results for “${query}”` : "Browse Atlas"}</h2>
          </div>
          <p className="text-sm text-slate-500">{sets.length} set{sets.length === 1 ? "" : "s"}</p>
        </div>

        {sets.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-[#d9c9af] bg-white p-10 text-center">
            <Boxes className="mx-auto h-9 w-9 text-yellow-600" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">No Atlas match yet.</h3>
            <p className="mt-2 text-slate-600">Try the set number or a broader theme name.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sets.map((set) => (
              <Link key={set.id} href={`/atlas/${encodeURIComponent(set.set_number)}`} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-[0_20px_65px_rgba(43,30,18,0.07)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(43,30,18,0.13)]">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#fffaf1] p-6">
                  {set.image_url ? <img src={set.image_url} alt={set.name} className="h-full w-full object-contain" /> : <Boxes className="h-14 w-14 text-yellow-500" />}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">LEGO {set.set_number}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{set.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{[set.theme, set.subtheme].filter(Boolean).join(" · ") || "Uncategorised"}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                    <div className="rounded-xl bg-slate-50 p-2">{set.year_released ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Year</span></div>
                    <div className="rounded-xl bg-slate-50 p-2">{set.piece_count ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Pieces</span></div>
                    <div className="rounded-xl bg-slate-50 p-2">{set.minifigure_count ?? "—"}<span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">Minifigs</span></div>
                  </div>
                  <p className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700 group-hover:text-yellow-700">View Atlas record <ArrowRight className="h-4 w-4" /></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
