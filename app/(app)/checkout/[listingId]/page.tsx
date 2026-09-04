import Link from "next/link";
import { notFound } from "next/navigation";
import { ProtectedCheckout } from "@/features/marketplace/components/protected-checkout";
import { getListingById, type MarketplaceListing } from "@/features/marketplace/data/marketplace.mock";
import { type CourierCode } from "@/features/marketplace/data/shipping-options";
import { createClient } from "@/lib/supabase/server";
import { marketplaceReadiness } from "@/lib/marketplace/readiness";

type Props = { params: Promise<{ listingId: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { listingId } = await params;
  if (getListingById(listingId)) notFound();
  let listing: MarketplaceListing | undefined;

  if (!listing) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select(`
        id, title, description, asking_price, published_at, value_quote,
        assets!listings_asset_id_fkey(set_number, set_name, theme, condition),
        collectors!listings_seller_id_fkey(display_name, username, collector_level, confidence_score, average_dispatch_days)
      `)
      .eq("id", listingId)
      .eq("status", "Active")
      .maybeSingle();

    if (data) {
      const asset = Array.isArray(data.assets) ? data.assets[0] : data.assets;
      const seller = Array.isArray(data.collectors) ? data.collectors[0] : data.collectors;
      const quote = data.value_quote && typeof data.value_quote === "object" && !Array.isArray(data.value_quote)
        ? data.value_quote as Record<string, unknown>
        : {};
      const enabledMethods = Array.isArray(quote.shippingMethods)
        ? quote.shippingMethods.filter((method): method is CourierCode =>
            ["courier-guy", "pudo"].includes(String(method)),
          )
        : [];
      const shippingMethods: CourierCode[] = enabledMethods.length ? enabledMethods : ["courier-guy"];

      listing = {
        id: data.id,
        setNumber: asset?.set_number ?? "Collection",
        title: data.title || asset?.set_name || "LEGO collection",
        category: asset?.theme ?? "Collection",
        priceZar: Number(data.asking_price),
        condition: typeof quote.condition === "string" ? quote.condition : asset?.condition ?? "Used",
        imageUrl: null,
        publishedAt: data.published_at ?? new Date().toISOString(),
        rarityRank: seller?.confidence_score ?? 50,
        seller: {
          name: seller?.display_name || seller?.username || "TBX Collector",
          level: seller?.collector_level ?? "Collector",
          trustScore: seller?.confidence_score ?? 50,
          rating: 0,
          sales: 0,
          averageDispatchDays: Number(seller?.average_dispatch_days ?? 2),
          disputes: 0,
          repeatBuyerPercent: 0,
          checks: [],
        },
        dispatchDays: Math.max(1, Math.round(Number(seller?.average_dispatch_days ?? 2))),
        conditionReport: [],
        provenance: [],
        shipping: {
          estimate: "1–5 business days",
          courierIncluded: true,
          insuranceIncluded: true,
          enabledMethods: shippingMethods,
        },
      };
    }
  }

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href={"/marketplace/" + listing.id} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to listing</Link>
      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-7 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Protected Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Choose delivery and review.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{marketplaceReadiness.paymentsLive ? "Select one of the seller’s enabled delivery methods. Delivery is included in the listed price, tracking follows the order, and funds remain protected through the inspection window." : "Select a seller-enabled delivery method and send a reservation request. No payment or courier booking occurs while TBX is in transaction testing."}</p>
      </section>
      <ProtectedCheckout listing={listing} paymentsLive={marketplaceReadiness.paymentsLive} courierQuotesLive={marketplaceReadiness.courierQuotesLive} />
    </div>
  );
}
