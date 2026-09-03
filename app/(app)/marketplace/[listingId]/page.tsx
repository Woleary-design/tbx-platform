import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConditionReport, ProvenanceCard, SellerProtectedLabel, SellerTrustCard } from "@/features/marketplace/components/listing-detail-sections";
import { formatZar, getListingById, marketplaceListings, type MarketplaceListing } from "@/features/marketplace/data/marketplace.mock";
import { getEnabledShippingMethods, type CourierCode } from "@/features/marketplace/data/shipping-options";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ listingId: string }> };

export function generateStaticParams() {
  return marketplaceListings.map((listing) => ({ listingId: listing.id }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { listingId } = await params;
  if (getListingById(listingId)) notFound();
  let listing: MarketplaceListing | undefined;

  if (!listing) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select(`
        id, title, description, asking_price, published_at, value_quote,
        assets!listings_asset_id_fkey(id, set_number, set_name, theme, condition, original_owner, original_receipt, instructions_complete, minifigures_complete, lego_set_id),
        collectors!listings_seller_id_fkey(display_name, username, collector_level, confidence_score, completed_trades, average_dispatch_days, disputes, identity_verified, address_verified, payment_verified)
      `)
      .eq("id", listingId)
      .eq("status", "Active")
      .maybeSingle();

    if (data) {
      const asset = Array.isArray(data.assets) ? data.assets[0] : data.assets;
      const seller = Array.isArray(data.collectors) ? data.collectors[0] : data.collectors;
      let catalogueImageUrl: string | null = null;
      let sellerImageUrl: string | null = null;
      if (asset?.lego_set_id) {
        const { data: legoSet } = await supabase
          .from("lego_sets")
          .select("image_url")
          .eq("id", asset.lego_set_id)
          .maybeSingle();
        catalogueImageUrl = legoSet?.image_url ?? null;
      }
      if (asset?.id) {
        const { data: photo } = await supabase.from("asset_evidence").select("storage_bucket, storage_path").eq("asset_id", asset.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
        if (photo?.storage_bucket && photo.storage_path) sellerImageUrl = supabase.storage.from(photo.storage_bucket).getPublicUrl(photo.storage_path).data.publicUrl;
      }
      const quote = data.value_quote && typeof data.value_quote === "object" && !Array.isArray(data.value_quote)
        ? data.value_quote as Record<string, unknown>
        : {};
      const methods = Array.isArray(quote.shippingMethods)
        ? quote.shippingMethods.filter((method): method is CourierCode => ["courier-guy", "pudo"].includes(String(method)))
        : ["courier-guy", "pudo"] as CourierCode[];
      const condition = typeof quote.condition === "string" ? quote.condition : asset?.condition ?? "Used";
      const included = typeof quote.included === "string" ? quote.included : data.description ?? "Collection item";

      listing = {
        id: data.id,
        setNumber: asset?.set_number ?? "Collection",
        title: data.title || asset?.set_name || "LEGO collection",
        category: asset?.theme ?? "Collection",
        priceZar: Number(data.asking_price),
        condition,
        imageUrl: sellerImageUrl ?? catalogueImageUrl,
        sellerImageUrl,
        catalogueImageUrl,
        publishedAt: data.published_at ?? new Date().toISOString(),
        rarityRank: seller?.confidence_score ?? 50,
        seller: {
          name: "Private seller",
          level: seller?.collector_level ?? "Collector",
          trustScore: seller?.confidence_score ?? 50,
          rating: 0,
          sales: seller?.completed_trades ?? 0,
          averageDispatchDays: Number(seller?.average_dispatch_days ?? 2),
          disputes: seller?.disputes ?? 0,
          repeatBuyerPercent: 0,
          checks: [
            { label: "Identity verified", verified: Boolean(seller?.identity_verified) },
            { label: "Address verified", verified: Boolean(seller?.address_verified) },
            { label: "Payout verified", verified: Boolean(seller?.payment_verified) },
          ],
        },
        dispatchDays: Math.max(1, Math.round(Number(seller?.average_dispatch_days ?? 2))),
        conditionReport: [
          { label: "Condition", value: condition, detail: included },
          { label: "Instructions", value: asset?.instructions_complete ? "Included" : "Not confirmed", detail: "Seller supplied collection record" },
          { label: "Minifigures", value: asset?.minifigures_complete ? "Complete" : "Not confirmed", detail: "Seller supplied collection record" },
        ],
        provenance: [
          { label: "Original owner", value: asset?.original_owner ? "Yes" : "Not confirmed" },
          { label: "Receipt", value: asset?.original_receipt ? "Included" : "Not supplied" },
        ],
        shipping: { estimate: "1–5 business days", courierIncluded: true, insuranceIncluded: true, enabledMethods: methods },
      };
    }
  }

  if (!listing) notFound();
  const enabledShipping = getEnabledShippingMethods(listing.shipping.enabledMethods);
  const sellerImageUrl = listing.sellerImageUrl ?? null;
  const catalogueImageUrl = listing.catalogueImageUrl ?? (sellerImageUrl ? null : listing.imageUrl);
  const hasSplitImages = Boolean(sellerImageUrl && catalogueImageUrl);

  return (
    <div className="space-y-9">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to Marketplace</Link>
      <section className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2.25rem] border border-[#eadfce] bg-white shadow-[0_30px_100px_rgba(43,30,18,0.12)]">
            <div className={`grid ${hasSplitImages ? "md:grid-cols-[3fr_2fr]" : ""}`}>
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-slate-100">
                {sellerImageUrl ? <a href={sellerImageUrl} target="_blank" rel="noreferrer" className="absolute inset-0"><Image src={sellerImageUrl} alt={`Seller photo of ${listing.title}`} fill priority sizes={hasSplitImages ? "(max-width: 768px) 100vw, 42vw" : "(max-width: 1024px) 100vw, 70vw"} className="object-cover" /></a> : catalogueImageUrl ? <a href={catalogueImageUrl} target="_blank" rel="noreferrer" className="absolute inset-0"><Image src={catalogueImageUrl} alt={`Atlas reference for ${listing.title}`} fill priority sizes="(max-width: 1024px) 100vw, 70vw" className="object-contain p-5 sm:p-8" /></a> : <ShoppingBag className="h-28 w-28 text-yellow-600/70" />}
                <span className="absolute bottom-4 left-4 rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white">{sellerImageUrl ? "Seller photo" : catalogueImageUrl ? "Atlas reference" : "Photo unavailable"}</span>
              </div>
              {hasSplitImages ? <div className="relative grid aspect-[4/3] place-items-center overflow-hidden border-t border-[#eadfce] bg-[radial-gradient(circle_at_35%_22%,rgba(250,204,21,0.28),transparent_30%),linear-gradient(135deg,#fff8e8,#ecd1a8)] md:border-l md:border-t-0">
                <a href={catalogueImageUrl!} target="_blank" rel="noreferrer" className="absolute inset-0"><Image src={catalogueImageUrl!} alt={`Atlas reference for ${listing.title}`} fill sizes="(max-width: 768px) 100vw, 28vw" className="object-contain p-5 sm:p-7" /></a>
                <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">Atlas reference</span>
              </div> : null}
            </div>
            <div className="border-t border-[#eadfce] p-4 text-center text-xs font-semibold text-slate-500">Seller photos show the actual item. Atlas imagery identifies the set and does not represent its condition.</div>
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
          <div className="flex items-center justify-between gap-3"><SellerProtectedLabel /><button aria-label="Add to watchlist" className="rounded-full border border-[#eadfce] p-2 text-slate-500 hover:text-red-500"><Heart className="h-4 w-4" /></button></div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-[0.16em] text-yellow-300">Seller trust</p><p className="mt-2 text-3xl font-semibold">{listing.seller.trustScore} <span className="text-sm text-white/50">{listing.seller.level}</span></p></div>
          <p className="mt-6 text-4xl font-semibold text-slate-950">{formatZar(listing.priceZar)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Funds are held securely until delivery and your inspection window is complete.</p>
          <Button asChild className="mt-6 h-14 w-full rounded-xl bg-yellow-400 text-lg font-bold text-slate-950 shadow-[0_12px_30px_rgba(250,204,21,0.18)] hover:bg-yellow-300"><Link href={`/checkout/${listing.id}`}>Buy Protected <ArrowRight className="h-4 w-4" /></Link></Button>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p className="flex justify-between"><span>Shipping</span><strong>{listing.shipping.estimate}</strong></p>
            <div><p className="flex justify-between"><span>Delivery</span><strong>Included · buyer chooses</strong></p><p className="mt-2 text-xs text-slate-500">{enabledShipping.map((method) => method.name).join(" · ")}</p></div>
            <p className="flex justify-between"><span>Insurance</span><strong>{listing.shipping.insuranceIncluded ? "Included" : "Not included"}</strong></p>
            <p className="flex justify-between"><span>Dispatch</span><strong>{listing.dispatchDays} day{listing.dispatchDays === 1 ? "" : "s"}</strong></p>
          </div>
          <div className="mt-6 flex gap-2 rounded-2xl border border-[#eadfce] bg-white p-4 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" /><span><strong className="text-slate-950">TBX Secure:</strong> the seller is paid only after delivery and buyer inspection. TBX has not physically inspected this item.</span></div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Truck className="h-4 w-4" /> Protected delivery within South Africa</div>
        </aside>
      </section>
    </div>
  );
}
