import {collectibleListings} from '@/lib/atlas/collectible-listings';
import {CollectibleListingEvidence} from '@/components/atlas/collectible-listing-evidence';
import {ReferenceImage} from '@/components/atlas/reference-image';
import {PokemonPriceReferences} from '@/components/atlas/pokemon-price-references';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pokemonCard, catalogueId, usdZarRate } from '@/lib/atlas/pokemon';
import { createClient } from '@/lib/supabase/server';
import { PokemonLibraryActions } from '@/components/atlas/pokemon-library-actions';
export default async function PokemonCardPage({params}:{params:Promise<{id:string}>}) {
  if(process.env.VERCEL_ENV!=='preview')notFound();
  const {id}=await params;if(!catalogueId(id))notFound();
  let card;try{card=await pokemonCard(id);}catch{return <section className="space-y-4 p-8 text-white"><h1>Catalogue temporarily unavailable</h1><Link href={`/atlas/pokemon/cards/${id}`} className="underline">Try again</Link><Link href="/atlas/collectibles" className="block underline">Back to Atlas</Link></section>;}
  if(!card)notFound();
  const [fx,evidence]=await Promise.all([card.priceReferences.length?usdZarRate():Promise.resolve(null),collectibleListings('Pokémon',id)]);
  const supabase=await createClient();const {data:auth}=await supabase.auth.getUser();
  const {data:wishlist}=auth.user?await supabase.from('collectible_wishlist').select('id').eq('collector_id',auth.user.id).eq('category','Pokémon').eq('catalogue_id',id).maybeSingle():{data:null};
  return <div className="mx-auto max-w-5xl space-y-6 text-white"><Link href={card.setId?`/atlas/pokemon/sets/${card.setId}`:'/atlas/collectibles'} className="text-white/60">← {card.series}</Link><section className="rounded-[2rem] border border-white/10 bg-[#050915] p-8"><p className="text-xs uppercase tracking-widest text-yellow-300">Atlas reference · Pokémon {card.identifier}</p><h1 className="mt-4 text-5xl font-bold">{card.name}</h1><p className="mt-4 text-xl text-white/60">{card.series} · English</p><div className="mt-6"><ReferenceImage key={id} src={card.imageUrl} name={card.name} large/></div><dl className="mt-8 grid gap-4 sm:grid-cols-3">{[['Card number',card.identifier],['Rarity',card.rarity],['Artist',card.illustrator],['HP',card.hp],['Type',card.types.join(', ')||'Not recorded'],['Catalogue ID',card.id]].map(([label,value])=><div key={label} className="rounded-xl bg-white/5 p-4"><dt className="text-xs text-white/50">{label}</dt><dd className="mt-2 font-bold">{value}</dd></div>)}</dl><p className="mt-5 text-sm text-white/60">Available finishes: {card.variants?.join(', ')||'Not recorded'}. Check your card’s printing before selecting.</p><div className="mt-6 flex flex-wrap gap-3"><Link href={`/sell/collectibles?category=pokemon&catalogueId=${card.id}`} className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950">Sell this card</Link><Link href={`/marketplace?set=${encodeURIComponent(card.name)}`} className="rounded-xl border border-white/20 px-5 py-3">Search marketplace</Link></div></section><PokemonLibraryActions id={id} variants={card.variants||[]} editions={card.editions||["Standard printing"]} initialWishlisted={Boolean(wishlist)}/><PokemonPriceReferences prices={card.priceReferences} fx={fx}/><CollectibleListingEvidence {...evidence}/><p className="text-xs text-white/45">Catalogue data via <a href="https://tcgdex.dev" className="underline">TCGdex</a>. Reference identity does not verify authenticity. Seller photos show the actual item.</p></div>;
}
