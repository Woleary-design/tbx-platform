import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalogueId, pokemonFetch, pokemonSet } from '@/lib/atlas/pokemon';
import { pokemonMatch } from '@/lib/atlas/collectible-catalogue';
import { PokemonCardGrid } from '@/components/atlas/pokemon-card-grid';
export default async function PokemonSetPage({params}:{params:Promise<{id:string}>}) {
  if(process.env.VERCEL_ENV!=='preview')notFound();
  const {id}=await params;if(!catalogueId(id))notFound();
  let data:unknown;
  try { data=await pokemonFetch(`sets/${encodeURIComponent(id)}`); } catch {return <section className="space-y-4 p-8 text-white"><h1 className="text-2xl">Catalogue temporarily unavailable</h1><Link href={`/atlas/pokemon/sets/${id}`} className="underline">Try again</Link><Link href="/atlas/collectibles" className="block underline">Back to Atlas</Link></section>;}
  const set=pokemonSet(data);if(!set)notFound();
  const raw=data as {cards?:unknown[]};
  const cards=(raw.cards||[]).map(pokemonMatch).filter(v=>v!==null).map(c=>({id:c.id,name:c.name,number:c.identifier,imageUrl:c.imageUrl||null}));
  return <div className="mx-auto max-w-6xl space-y-8 text-white"><Link href="/atlas/collectibles" className="text-white/60">← Pokémon catalogue</Link><section className="rounded-[2rem] border border-white/10 bg-[#050915] p-8"><p className="text-xs uppercase tracking-widest text-yellow-300">Pokémon · {set.id}</p><h1 className="mt-4 text-4xl font-bold sm:text-6xl">{set.name}</h1><p className="mt-4 text-white/60">{set.series} · English</p><dl className="mt-6 grid gap-3 sm:grid-cols-3">{[['Cards',String(cards.length)],['Released',set.releaseDate||'Not recorded'],['Catalogue',set.id]].map(([label,value])=><div key={label} className="rounded-xl bg-white/5 p-4"><dt className="text-xs text-white/50">{label}</dt><dd className="mt-2 text-xl font-bold">{value}</dd></div>)}</dl></section><PokemonCardGrid cards={cards}/><p className="text-xs text-white/45">Catalogue data via TCGdex. Card condition and authenticity are recorded separately for each seller’s copy.</p></div>;
}
