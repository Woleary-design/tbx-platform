'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { subcategories, collectibleError, type Category, type CollectibleDetails } from '@/lib/marketplace/categories';

export function CollectibleSellForm() {
  const router = useRouter();
  const [category, setCategory] = useState<Exclude<Category, 'LEGO'>>('Pokémon');
  const [type, setType] = useState<string>(subcategories['Pokémon'][0]);
  const [details, setDetails] = useState<CollectibleDetails>({});
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const fields = category === 'Pokémon'
    ? ['Name', 'Set', 'Language', ...(type === 'Individual cards' || type === 'Graded cards' ? ['Card number'] : []), ...(type === 'Graded cards' ? ['Grading company', 'Grade', 'Certification number'] : [])]
    : ['Model', 'Series', 'Year'];
  const choices: Record<string, string[]> = category === 'Pokémon'
    ? { Condition: type === 'Sealed packs and boxes' ? ['Factory sealed', 'Damaged sealed packaging'] : ['Near mint', 'Lightly played', 'Moderately played', 'Heavily played', 'Damaged'] }
    : { 'Sealed or loose': ['Sealed', 'Loose'], 'Packaging condition': ['Mint', 'Minor wear', 'Damaged', 'No packaging'], Condition: ['Mint', 'Excellent', 'Good', 'Worn', 'Damaged'] };
  const input = 'mt-2 w-full rounded-xl border border-white/20 bg-[#0b1223] p-3 text-white';
  function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = collectibleError(category, type, details);
    if (invalid) { setError(invalid); return; }
    const title = details.Name || details.Model;
    window.localStorage.setItem('tbx-listing-draft', JSON.stringify({
      category, subcategory: type, collectibleDetails: details, itemKind: 'collectible', title,
      setNumber: details['Card number'] || details.Year || 'COLLECTIBLE', theme: category,
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
    <label className="block">Category<select className={input} value={category} onChange={event => { const next = event.target.value as Exclude<Category, 'LEGO'>; setCategory(next); setType(subcategories[next][0]); setDetails({}); setError(''); }}><option>Pokémon</option><option>Hot Wheels</option></select></label>
    <label className="block">Listing type<select className={input} value={type} onChange={event => { setType(event.target.value); setDetails(current => Object.fromEntries(Object.entries(current).filter(([key]) => !['Grading company','Grade','Certification number','Card number','Condition'].includes(key)))); }}>{subcategories[category].map(value => <option key={value}>{value}</option>)}</select></label>
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label key={field}>{field}<input required maxLength={120} className={input} value={details[field] || ''} onChange={event => setDetails(current => ({...current, [field]: event.target.value}))} /></label>)}
    {Object.entries(choices).map(([field, values]) => <label key={field}>{field}<select required className={input} value={details[field] || ''} onChange={event => setDetails(current => ({...current, [field]: event.target.value}))}><option value="">Choose…</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>)}</div>
    <label className="block">What’s included, wear and damage<textarea required maxLength={3000} className={input} rows={4} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <p className="text-sm text-white/60">{category === 'Pokémon' ? 'Photograph the front and back of cards. For graded cards include the slab label and certification number. Grading and authenticity are seller declarations.' : 'Photograph the car, base and packaging where present. Show any card bends, blister cracks or paint damage.'}</p>
    {error ? <p role="alert" className="text-red-300">{error}</p> : null}
    <button className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950">Continue to price and delivery</button>
  </form>;
}
