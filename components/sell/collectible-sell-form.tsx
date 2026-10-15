'use client';
import { CollectibleCatalogueSearch } from './collectible-catalogue-search';
import { catalogueFields, type CatalogueMatch } from '@/lib/atlas/collectible-catalogue';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subcategories, collectibleError, type Category, type CollectibleDetails } from '@/lib/marketplace/categories';

export function CollectibleSellForm() {
  const router = useRouter();
  const [category, setCategory] = useState<Exclude<Category, 'LEGO'>>('Pokémon');
  const [type, setType] = useState<string>(subcategories['Pokémon'][0]);
  const [details, setDetails] = useState<CollectibleDetails>({});
  const [catalogue,setCatalogue] = useState<CatalogueMatch|null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const code = params.get('category'); const id = params.get('catalogueId');
    if (!id || !['pokemon','hot-wheels'].includes(code || '')) return;
    const selectedCategory = code === 'pokemon' ? 'Pokémon' : 'Hot Wheels';
    setCategory(selectedCategory); setType(selectedCategory === 'Pokémon' ? 'Individual cards' : 'Single cars');
    const controller = new AbortController();
    void fetch(`/api/atlas/collectibles?${new URLSearchParams({category:code!,id})}`,{signal:controller.signal}).then(async response=>{const payload=await response.json();if(!response.ok||!payload.results?.[0])throw new Error(payload.error||'Catalogue entry unavailable.');if(controller.signal.aborted)return;const match:CatalogueMatch=payload.results[0];setCatalogue(match);setDetails({...catalogueFields(match),Edition:match.editions?.[0] || "Standard printing"});if(selectedCategory==='Hot Wheels'&&match.variant?.includes('Treasure Hunt'))setType('Treasure Hunts');}).catch(error=>{if(!controller.signal.aborted)setError(error instanceof Error?error.message:'Catalogue unavailable.');});
    return ()=>controller.abort();
  },[]);
  const fields = category === 'Pokémon'
    ? ['Name', 'Set', 'Language', ...(type === 'Individual cards' || type === 'Graded cards' ? ['Card number'] : []), ...(type === 'Graded cards' ? ['Grading company', 'Grade', 'Certification number'] : [])]
    : ['Model', 'Series', 'Year', 'Toy number', 'Variant'];
  const choices: Record<string, string[]> = category === 'Pokémon'
    ? { Condition: type === 'Sealed packs and boxes' ? ['Factory sealed', 'Damaged sealed packaging'] : ['Near mint', 'Lightly played', 'Moderately played', 'Heavily played', 'Damaged'] }
    : { 'Sealed or loose': ['Sealed', 'Loose'], 'Packaging condition': ['Mint', 'Minor wear', 'Damaged', 'No packaging'], Condition: ['Mint', 'Excellent', 'Good', 'Worn', 'Damaged'] };
  const input = 'mt-2 w-full rounded-xl border border-white/20 bg-[#0b1223] p-3 text-white';
  function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = collectibleError(category, type, details);
    if (invalid) { setError(invalid); return; }
    if (catalogue?.source === 'TCGdex' && !details.Finish?.trim()) { setError('Choose the finish of your actual card.'); return; }
    if (catalogue?.source === 'TCGdex' && catalogue.editions && !catalogue.editions.includes(details.Edition)) {setError('Choose your card edition.');return;}
    const title = details.Name || details.Model;
    window.localStorage.setItem('tbx-listing-draft', JSON.stringify({
      category, subcategory: type, collectibleDetails: details, catalogueReference: catalogue ? {...catalogue, variant: details.Finish || catalogue.variant} : null, itemKind: 'collectible', title,
      setNumber: details['Card number'] || details['Toy number'] || details.Year || 'COLLECTIBLE', theme: category,
      condition: details.Condition, included: type,
      description, shippingMethods: ['courier-guy', 'pudo'], delivery: 'TBX delivery',
    }));
    router.push('/sell/atlas');
  }
  return <form onSubmit={start} className="space-y-6">
    <Link href="/sell/quick" className="text-sm text-white/70">← Selling options</Link>
    <p className="text-xs font-bold uppercase tracking-widest text-yellow-300">Sandbox listing</p>
    <h1 className="text-4xl font-bold">Sell a collectible</h1>
    <p className="text-white/65">Describe the actual item and any wear or damage. You’ll add price, delivery and your photos next.</p>
    <label className="block">Category<select className={input} value={category} onChange={event => { const next = event.target.value as Exclude<Category, 'LEGO'>; setCategory(next); setType(subcategories[next][0]); setDetails({}); setCatalogue(null); setError(''); }}><option>Pokémon</option><option>Hot Wheels</option></select></label>
    <label className="block">Listing type<select className={input} value={type} onChange={event => { setType(event.target.value); setCatalogue(null); setDetails(current => Object.fromEntries(Object.entries(current).filter(([key]) => !['Grading company','Grade','Certification number','Card number','Condition'].includes(key)))); }}>{subcategories[category].map(value => <option key={value}>{value}</option>)}</select></label>
    {category === "Hot Wheels" || type === "Individual cards" || type === "Graded cards" ? <CollectibleCatalogueSearch key={`${category}-${type}`} category={category} onSelect={match=>{if(category==="Hot Wheels")setType(match.variant?.includes("Treasure Hunt")?"Treasure Hunts":"Single cars");setCatalogue(match);setDetails(current=>({...current,...catalogueFields(match),Finish:"",Edition:match.editions?.[0] || "Standard printing"}));setError("");}} /> : <p className="text-sm text-white/60">Sealed products and bundles use manual details for now. Card catalogue entries describe individual cards.</p>}
    {catalogue ? <div className="rounded-xl border border-emerald-400/25 p-4"><p>Selected: <strong>{catalogue.name}</strong> · {catalogue.series} · {catalogue.identifier}</p>{catalogue.source === "TCGdex" ? <><label className="mt-3 block">Edition<select value={details.Edition || "Standard printing"} className={input} onChange={event=>setDetails(current=>({...current,Edition:event.target.value}))}>{(catalogue.editions || ["Standard printing"]).map(value=><option key={value}>{value}</option>)}</select></label><label className="mt-3 block">Card finish<select required value={details.Finish || ""} className={input} onChange={event=>setDetails(current=>({...current,Finish:event.target.value}))}><option value="">Choose finish…</option>{(catalogue.variants?.length ? catalogue.variants : ["Not specified — describe below"]).map(value=><option key={value}>{value}</option>)}</select></label></> : <p className="text-sm text-white/65">{catalogue.variant}</p>}</div> : null}
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label key={field}>{field}<input required={!["Toy number","Variant"].includes(field)} maxLength={120} className={input} value={details[field] || ''} onChange={event => {if(["Name","Set","Language","Card number","Model","Series","Year","Toy number","Variant"].includes(field))setCatalogue(null);setDetails(current => ({...current, [field]: event.target.value}));}} /></label>)}
    {Object.entries(choices).map(([field, values]) => <label key={field}>{field}<select required className={input} value={details[field] || ''} onChange={event => setDetails(current => ({...current, [field]: event.target.value}))}><option value="">Choose…</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>)}</div>
    <label className="block">What’s included, wear and damage<textarea required maxLength={3000} className={input} rows={4} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <p className="text-sm text-white/60">{category === 'Pokémon' ? 'Photograph the front and back of cards. For graded cards include the slab label and certification number. Grading and authenticity are seller declarations.' : 'Photograph the car, base and packaging where present. Show any card bends, blister cracks or paint damage.'}</p>
    {error ? <p role="alert" className="text-red-300">{error}</p> : null}
    <button className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950">Continue to price and delivery</button>
  </form>;
}
