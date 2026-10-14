"use client";

import Link from "next/link";
import { ArrowRight, Loader2, ShoppingBag, TrendingUp } from "lucide-react";

type MarketListing = { id:string; price:number; condition:string; publishedAt:string|null; href:string };
type ExternalListing = { id:string; title:string; source:string; price:number; href:string; thumbnail:string|null; condition:string };
type ValueQuote = { estimated_value:number|null; quick_sale:number|null; recommended:number|null; premium:number|null; confidence:number; verified_sales:number; active_listings:number; last_sale:number|null; data_status:string };
export type MarketSnapshotData = { quote:ValueQuote; market:{ lowestAsking:number|null; highestAsking:number|null; activeListingCount:number; listings:MarketListing[] }; externalMarket?:{ provider:string; status:string; searchUrl:string; retailLow:number|null; retailMedian:number|null; retailHigh:number|null; adjustedLow:number|null; adjustedRecommended:number|null; adjustedHigh:number|null; listings:ExternalListing[] }|null };

function money(value:number|null|undefined){return value==null?"—":`R${Math.round(value).toLocaleString("en-ZA")}`}

export function MarketSnapshot({data,loading}:{data:MarketSnapshotData|null;loading:boolean}){
 if(loading)return <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-sm text-white/45"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Checking current prices across the market</div>;
 if(!data)return null;
 const external=data.externalMarket?.status==="available"?data.externalMarket:null;
 const hasTbx=data.market.activeListingCount>0;
 const low=external?.adjustedLow??data.market.lowestAsking??data.quote.quick_sale??null;
 const recommended=external?.adjustedRecommended??data.quote.recommended??data.quote.estimated_value??null;
 const high=external?.adjustedHigh??data.market.highestAsking??data.quote.premium??null;
 const hasValuation=low!=null||recommended!=null||high!=null;
 const referenceCount=external?.listings.length??0;
 const evidenceCount=referenceCount+data.market.activeListingCount;
 return <section className="overflow-hidden rounded-[1.75rem] border border-[#e8c86a]/20 bg-[#08101c]">
  <div className="flex flex-col gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas market intelligence</p><h3 className="mt-2 text-2xl font-black tracking-[-0.035em]">Price reference summary</h3><p className="mt-2 text-sm text-white/40">A guide to pricing your LEGO, using available market evidence.</p></div>{evidenceCount>0?<div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200"><ShoppingBag className="h-4 w-4"/>{evidenceCount} price reference {evidenceCount===1?"point":"points"}</div>:null}</div>
  {hasValuation?<><div className="grid grid-cols-3 gap-px bg-white/[0.07]">{[["Low",money(low)],["Middle",money(recommended)],["High",money(high)]].map(([label,value])=><div key={label} className="bg-[#08101c] p-4 sm:p-5"><p className="text-[11px] text-white/35">{label}</p><p className={`mt-2 font-black tracking-[-0.035em] ${label==="Middle"?"text-xl text-[#e8c86a] sm:text-2xl":"text-lg sm:text-2xl"}`}>{value}</p></div>)}</div><div className="border-t border-white/[0.07] p-5"><p className="text-xs leading-5 text-white/38">{external?"Based on exact-set current South African retail asking prices, adjusted for the condition you selected. Asking prices are market evidence, not guaranteed sale prices.":"Based on available TBX market evidence for this exact set and condition."}</p></div></>:<div className="p-5"><p className="font-bold text-white">No reliable exact-set prices found yet.</p><p className="mt-2 text-sm leading-6 text-white/40">Atlas will not guess. You can still choose your own selling price and continue.</p></div>}
  {external?<div className="border-t border-white/[0.07] p-5"><h4 className="font-bold">Reference coverage</h4><p className="mt-2 text-sm text-white/50">{referenceCount} external retail reference {referenceCount===1?"point":"points"} inform this summary. Retail asking prices are adjusted for your selected condition; the middle figure is a price guide, not a completed-sale median.</p></div>:null}
  {hasTbx?<div className="border-t border-white/[0.07] p-5"><div className="mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#e8c86a]"/><h4 className="font-bold">Available on TBX</h4></div><div className="grid gap-3 sm:grid-cols-2">{data.market.listings.filter(listing=>listing.href.startsWith('/marketplace/')).slice(0,4).map((listing)=><Link key={listing.id} href={listing.href} className="flex items-center justify-between rounded-2xl border border-white/[0.08] p-4"><div><p className="font-black">{money(listing.price)}</p><p className="text-xs text-white/38">{listing.condition}</p></div><ArrowRight className="h-4 w-4 text-white/25"/></Link>)}</div></div>:null}
 </section>
}
