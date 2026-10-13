'use client';
import Link from 'next/link';
import { useState } from 'react';
export function PokemonCardGrid({cards}:{cards:{id:string;name:string;number:string}[]}) {
  const [query,setQuery]=useState('');
  const filtered=cards.filter(c=>`${c.name} ${c.number} ${c.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="space-y-5"><label className="block">Find a card in this set<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Card name or number" className="mt-2 w-full rounded-xl border border-white/20 bg-[#0b1223] p-3"/></label><p className="text-sm text-white/55">{filtered.length} cards</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(c=><Link key={c.id} href={`/atlas/pokemon/cards/${c.id}`} className="rounded-2xl border border-white/10 bg-[#0b1223] p-5 hover:border-yellow-400"><p className="text-xs text-yellow-300">#{c.number}</p><h2 className="mt-2 text-lg font-bold">{c.name}</h2><p className="mt-3 text-xs text-white/45">View printing and finishes →</p></Link>)}</div>{!filtered.length?<p>No cards match that search.</p>:null}</section>;
}
