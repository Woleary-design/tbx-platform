import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpen, Box, Camera, CircleDollarSign, FileText, MapPin, PackageCheck, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

function money(value: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value ?? 0);
}

export default async function CollectionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) notFound();

  const { data: asset } = await supabase
    .from("assets")
    .select("id, asset_id, set_number, set_name, theme, condition, estimated_value, purchase_price, original_receipt, instructions_complete, minifigures_complete, original_owner, sealed, notes, created_at, updated_at, is_public")
    .eq("id", id)
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (!asset) notFound();

  const checks = [asset.original_receipt, asset.instructions_complete, asset.minifigures_complete, asset.original_owner, asset.sealed || asset.condition !== "New Sealed"];
  const health = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const gain = Number(asset.estimated_value ?? 0) - Number(asset.purchase_price ?? 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link href="/collection" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to My Collection</Link>

      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid lg:grid-cols-[1fr_380px]">
          <div className="p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">LEGO {asset.set_number}</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">{asset.set_name}</h1>
            <p className="mt-3 text-lg text-white/60">{asset.theme || "Uncategorised"}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{asset.condition}</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{asset.is_public ? "Public" : "Private"}</span>
              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950">{health}% Collection Health</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[["Market value", money(asset.estimated_value)], ["Purchase price", money(asset.purchase_price)], ["Value difference", money(gain)], ["Record ID", asset.asset_id]].map(([label, value]) => <div key={label} className="bg-white/5 p-6"><p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p><p className="mt-3 text-xl font-semibold">{value}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><PackageCheck className="h-6 w-6 text-yellow-600" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Your copy</p><h2 className="text-2xl font-semibold">Condition and completeness</h2></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[[Box, "Build / condition", asset.condition], [BadgeCheck, "Original owner", asset.original_owner ? "Yes" : "Not recorded"], [FileText, "Receipt", asset.original_receipt ? "Available" : "Missing"], [BookOpen, "Instructions", asset.instructions_complete ? "Included and complete" : "Not confirmed"], [PackageCheck, "Minifigures", asset.minifigures_complete ? "Complete" : "Not confirmed"], [Camera, "Photos", "Open photo manager next"]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof Box; return <div key={label as string} className="rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4"><ItemIcon className="h-5 w-5 text-yellow-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label as string}</p><p className="mt-1 font-semibold text-slate-950">{value as string}</p></div>; })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-yellow-600" /><h2 className="text-2xl font-semibold">Notes</h2></div>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">{asset.notes || "No notes have been added yet."}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Collection Health</p>
            <div className="mt-3 flex items-end justify-between"><p className="text-5xl font-semibold">{health}%</p><Sparkles className="h-7 w-7 text-yellow-500" /></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${health}%` }} /></div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              {!asset.original_receipt && <p>• Add receipt or proof of purchase</p>}
              {!asset.instructions_complete && <p>• Confirm instruction status</p>}
              {!asset.minifigures_complete && <p>• Confirm minifigure completeness</p>}
              {!asset.original_owner && <p>• Add ownership information</p>}
              {health === 100 && <p>Everything currently requested is complete.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfce] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <ShoppingBag className="h-7 w-7 text-yellow-300" />
            <h2 className="mt-4 text-2xl font-semibold">Ready to sell?</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">Your collection details will pre-fill the listing. You will only need to set the fixed price and delivery options.</p>
            <Button className="mt-6 h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">List for Sale</Button>
          </div>

          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-6 text-sm text-slate-600">
            <p className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-yellow-600" /> Market pricing engine will appear here.</p>
            <p className="mt-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-yellow-600" /> Storage location will be editable here.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
