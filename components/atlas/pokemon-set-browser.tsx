'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PokemonSet } from '@/lib/atlas/pokemon';
export function PokemonSetBrowser() {
  const [sets,setSets]=useState<PokemonSet[]>([]);
  const [query,setQuery]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [limit,setLimit]=useState(36);
  const [retry,setRetry]=useState(0);
  useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');
    void fetch('/api/atlas/pokemon',{signal:controller.signal}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error);if(!controller.signal.aborted)setSets(p.sets);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[retry]);
  const matches=sets.filter(s=>`${s.name} ${s.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="space-y-5">
    <div><p className="text-xs uppercase tracking-widest text-yellow-300">English card catalogue</p><h2 className="mt-2 text-3xl font-bold">Browse Pokémon sets</h2><p className="mt-2 text-white/60">Choose a set to browse its cards and identify your exact printing.</p></div>
    <label className="block">Find a set<input value={query} onChange={e=>{setQuery(e.target.value);setLimit(36);}} className="mt-2 w-full rounded-xl border border-white/20 bg-[#0b1223] p-3" placeholder="Base Set, Scarlet & Violet, swsh3…"/></label>
    {loading?<p role="status">Loading sets…</p>:error?<div role="alert"><p>{error}</p><button type="button" onClick={()=>setRetry(v=>v+1)} className="mt-3 underline">Try again</button></div>:<><p className="text-sm text-white/55">{matches.length} sets{query?' match your search':''}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{matches.slice(0,limit).map(s=><Link href={`/atlas/pokemon/sets/${s.id}`} key={s.id} className="rounded-2xl border border-white/10 bg-[#0b1223] p-5 hover:border-yellow-400"><span className="text-xs uppercase text-yellow-300">{s.id}</span><h3 className="mt-2 text-xl font-bold">{s.name}</h3><p className="mt-3 text-sm text-white/55">{s.count} catalogue cards →</p></Link>)}</div>{matches.length>limit?<button type="button" onClick={()=>setLimit(v=>v+36)} className="rounded-xl border border-white/20 px-5 py-3">Show more sets</button>:null}</>}
  </section>;
}
