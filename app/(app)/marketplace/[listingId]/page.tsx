import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConditionReport, ProvenanceCard, SellerTrustCard, VerifiedLabel } from "@/features/marketplace/components/listing-detail-sections";
import { formatZar, getListingById, marketplaceListings } from "@/features/marketplace/data/marketplace.mock";

type Props = { params: Promise<{ listingId: string }> };

export function generateStaticParams() {
  return marketplaceListings.map((listing) => ({ listingId: listing.id }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { listingId } = await params;
  const listing = getListingById(listingId);
  if (!listing) notFound();

  return (
    <div className="space-y-9">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>
      <section className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2.25rem] border border-[#eadfce] bg-white shadow-[0_30px_100px_rgba(43,30,18,0.12)]">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-[radial-gradient(circle_at_35%_22%,rgba(250,204,21,0.34),transparent_30%),linear-gradient(135deg,#fff8e8,#ecd1a8)]">
              {listing.imageUrl ? <Image src={listing.imageUrl} alt={listing.title} fill priority sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" /> : <ShoppingBag className="h-28 w-28 text-yellow-600/70" />}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/35 to-transparent" />
              <div className="absolute left-5 top-5"><VerifiedLabel /></div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4">{["Hero", "Box", "Details", "Evidence"].map((label) => <div key={label} className="rounded-xl border border-[#eadfce] bg-[#fffaf1] p-3 text-center text-xs font-semibold text-slate-500">{label}</div>)}</div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-semibold">Trust {listing.seller.trustScore}</span><span className="rounded-full border border-[#eadfce] px-3 py-1.5 text-xs font-semibold text-slate-600">{listing.category}</span></div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-700">LEGO {listing.setNumber}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{listing.title}</h1>
            <p className="mt-4 text-lg text-slate-600">{listing.condition}</p>
          </div>

          <SellerTrustCard seller={listing.seller} />
          <ConditionReport rows={listing.conditionReport} />
          <ProvenanceCard rows={listing.provenance} />
        </div>

        <aside className="h-fit rounded-[1.9rem] border border-[#eadfce] bg-white p-6 shadow-[0_30px_100px_rgba(43,30,18,0.13)] lg:sticky lg:top-24">
          <div className="flex items-center justify-between"><VerifiedLabel /><button aria-label="Add to watchlist" className="rounded-full border border-[#eadfce] p-2 text-slate-500 hover:text-red-500"><Heart className="h-4 w-4" /></button></div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-[0.16em] text-yellow-300">Seller trust</p><p className="mt-2 text-3xl font-semibold">{listing.seller.trustScore} <span className="text-sm text-white/50">{listing.seller.level}</span></p></div>
          <p className="mt-6 text-4xl font-semibold text-slate-950">{formatZar(listing.priceZar)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Funds are held securely until delivery and your inspection window is complete.</p>
          <Button asChild className="mt-6 h-13 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300"><Link href={`/checkout/${listing.id}`}>Buy Protected <ArrowRight className="h-4 w-4" /></Link></Button>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p className="flex justify-between"><span>Shipping</span><strong>{listing.shipping.estimate}</strong></p>
            <p className="flex justify-between"><span>Courier</span><strong>{listing.shipping.courierIncluded ? "Included" : "Quoted separately"}</strong></p>
            <p className="flex justify-between"><span>Insurance</span><strong>{listing.shipping.insuranceIncluded ? "Included" : "Not included"}</strong></p>
            <p className="flex justify-between"><span>Dispatch</span><strong>{listing.dispatchDays} day{listing.dispatchDays === 1 ? "" : "s"}</strong></p>
          </div>
          <div className="mt-6 flex gap-2 rounded-2xl bg-[#fffaf1] p-4 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" /><span><strong className="text-slate-950">TBX Secure:</strong> the seller is paid only after delivery and buyer inspection.</span></div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Truck className="h-4 w-4" /> Protected delivery within South Africa</div>
        </aside>
      </section>
    </div>
  );
}
