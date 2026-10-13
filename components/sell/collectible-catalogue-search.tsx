'use client';
import { useEffect, useRef, useState } from 'react';
import type { CatalogueMatch } from '@/lib/atlas/collectible-catalogue';
export function CollectibleCatalogueSearch({category,onSelect}: {category:'Pokémon'|'Hot Wheels';onSelect:(match:CatalogueMatch)=>void}) {
  const controller = useRef<AbortController|null>(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  const [query,setQuery] = useState('');
  const [results,setResults] = useState<CatalogueMatch[]>([]);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const code = category === 'Pokémon' ? 'pokemon' : 'hot-wheels';
  async function search() {
    if (busy) return;
    controller.current?.abort(); const request = new AbortController(); controller.current=request;
    setBusy(true); setMessage(''); setResults([]);
    try {
      const response = await fetch(`/api/atlas/collectibles?${new URLSearchParams({category:code,q:query})}`,{signal:request.signal});
      const payload = await response.json();
      if(request.signal.aborted)return;
      if (!response.ok) throw new Error(payload.error || 'Catalogue unavailable.');
      setResults(payload.results);
      if (!payload.results.length) setMessage('No matching catalogue entry. Try another name or enter details manually.');
    } catch (error) { if(request.signal.aborted)return;setMessage(error instanceof Error ? error.message : 'Catalogue unavailable.'); }
    finally { if(!request.signal.aborted)setBusy(false); }
  }
  async function choose(match:CatalogueMatch) {
    if (busy) return;
    controller.current?.abort(); const request = new AbortController(); controller.current=request;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/atlas/collectibles?${new URLSearchParams({category:code,id:match.id})}`,{signal:request.signal});
      const payload = await response.json();
      if(request.signal.aborted)return;
      if (!response.ok || !payload.results?.[0]) throw new Error(payload.error || 'That entry could not be loaded.');
      onSelect(payload.results[0]);
      setMessage('Catalogue entry selected. Check the number and finish against your actual item.');
    } catch (error) { if(request.signal.aborted)return;setMessage(error instanceof Error ? error.message : 'Try again.'); }
    finally { if(!request.signal.aborted)setBusy(false); }
  }
  return <section aria-label="Atlas catalogue search" className="space-y-4 rounded-2xl border border-yellow-400/25 bg-[#0b1223] p-5">
    <h2 className="text-xl font-bold">Find it in Atlas</h2>
    <p className="text-sm text-white/65">{category === 'Pokémon' ? 'Search English cards by name or catalogue ID, for example Charizard or base1-4. Select the exact printing, then confirm its finish.' : 'Pilot: 10 variants from 2025 HW J-Imports. Search Honda, Skyline, Mazda, Subaru or a toy number. Other cars can be entered manually.'}</p>
    <div className="flex gap-3"><label className="flex-1"><span className="sr-only">Catalogue name or identifier</span><input value={query} maxLength={80} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void search();}}} className="w-full rounded-xl border border-white/20 bg-[#050915] p-3" placeholder={category==='Pokémon'?'Card name or catalogue ID':'Model or toy number'} /></label><button type="button" disabled={busy||query.trim().length<2} onClick={()=>void search()} className="rounded-xl bg-yellow-400 px-5 font-bold text-slate-950 disabled:opacity-50">{busy?'Loading…':'Search'}</button></div>
    <div className="grid gap-3 sm:grid-cols-2">{results.map(match=><button type="button" key={match.id} disabled={busy} onClick={()=>void choose(match)} className="rounded-xl border border-white/15 p-4 text-left hover:border-yellow-400 disabled:opacity-50"><strong className="block">{match.name}</strong><span className="mt-1 block text-sm text-white/60">{match.series} · {match.identifier}{match.variant ? ` · ${match.variant}` : ''}</span><span className="mt-2 block text-xs text-yellow-300">Select this entry</span></button>)}</div>
    {message?<p role="status" className="text-sm text-amber-200">{message}</p>:null}
    {category==='Hot Wheels'?<p className="text-xs text-white/50">Contains information from <a href="https://github.com/topvault/collectdb" target="_blank" rel="noreferrer" className="underline">collectdb</a>, available under <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="underline">ODbL</a>. <a href="/api/atlas/hot-wheels-pilot" className="underline">Download pilot catalogue</a>.</p>:<p className="text-xs text-white/50">Catalogue data via <a href="https://tcgdex.dev" target="_blank" rel="noreferrer" className="underline">TCGdex</a>. Seller photos show the actual item; catalogue identity does not verify authenticity or grading.</p>}
  </section>;
}
