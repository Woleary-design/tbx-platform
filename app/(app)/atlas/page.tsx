import { BookOpen, Sparkles } from "lucide-react";
import { AtlasLiveSearch } from "@/components/atlas/atlas-live-search";
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

type AtlasDirectoryPageProps = {
  searchParams?: Promise<{ theme?: string }>;
};

export default async function AtlasDirectoryPage({ searchParams }: AtlasDirectoryPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialTheme = params?.theme?.trim() ?? "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("lego_sets")
    .select("id, set_number, name, theme, subtheme, year_released, piece_count, minifigure_count, image_url")
    .eq("is_active", true)
    .order("year_released", { ascending: false, nullsFirst: false })
    .limit(60);

  const initialResults = ((data ?? []) as AtlasSet[]).map((set) => ({
    id: set.id,
    setNumber: set.set_number,
    name: set.name,
    theme: set.theme ?? "LEGO",
    subtheme: set.subtheme,
    year: set.year_released,
    pieces: set.piece_count,
    minifigures: set.minifigure_count,
    imageUrl: set.image_url,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300">
              <BookOpen className="h-4 w-4" /> Atlas
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

      <AtlasLiveSearch initialResults={initialResults} initialQuery={initialTheme} />
    </div>
  );
}
