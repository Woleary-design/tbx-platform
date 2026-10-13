'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CollectibleCatalogueSearch } from '@/components/sell/collectible-catalogue-search';
import { PokemonSetBrowser } from '@/components/atlas/pokemon-set-browser';
import type { CatalogueMatch } from '@/lib/atlas/collectible-catalogue';
export function CollectibleCatalogueExplorer() {
  const [category,setCategory] = useState<'Pokémon'|'Hot Wheels'>('Pokémon');
  const [selected,setSelected] = useState<CatalogueMatch|null>(null);
  return <div className="space-y-6 text-white">
    <Link href="/atlas" className="text-white/60">← Atlas LEGO catalogue</Link>
    <h1 className="text-4xl font-bold">Atlas collectibles</h1>
    <div className="flex flex-wrap gap-3">{(['Pokémon','Hot Wheels'] as const).map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>{setCategory(value);setSelected(null);}} className={`rounded-xl border px-5 py-3 font-bold ${category===value?'border-yellow-400 bg-yellow-400 text-slate-950':'border-white/20'}`}>{value}</button>)}</div>
    {category==='Pokémon'?<PokemonSetBrowser/>:null}
    <CollectibleCatalogueSearch key={category} category={category} onSelect={setSelected}/>
    {selected?<section className="space-y-3 rounded-2xl border border-emerald-400/30 p-5"><h2 className="text-2xl font-bold">{selected.name}</h2><p>{selected.series} · {selected.identifier} · {selected.language}{selected.variant?` · ${selected.variant}`:''}</p><p className="text-sm text-white/60">Catalogue identity only. You supply item condition, current photos and selling price.</p><>{category==='Pokémon'?<Link href={`/atlas/pokemon/cards/${selected.id}`} className="mr-3 inline-flex rounded-xl border border-white/20 px-5 py-3 font-bold">View card details</Link>:null}<Link href={`/sell/collectibles?${new URLSearchParams({category:category==='Pokémon'?'pokemon':'hot-wheels',catalogueId:selected.id})}`} className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950">Sell this item</Link></></section>:null}
  </div>;
}
