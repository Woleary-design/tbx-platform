'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {CatalogueMatch} from '@/lib/atlas/collectible-catalogue';
type Results={results:CatalogueMatch[];total:number;pages:number;page:number;years:string[];series:string[]};
export function HotWheelsBrowser() {
  const [year,setYear]=useState('2026');const [series,setSeries]=useState('');const [query,setQuery]=useState('');const [q,setQ]=useState('');const [page,setPage]=useState(1);
  const [data,setData]=useState<Results|null>(null);const [busy,setBusy]=useState(true);const [error,setError]=useState('');const [retry,setRetry]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();setBusy(true);setError('');
    void fetch(`/api/atlas/hot-wheels?${new URLSearchParams({year,series,q,page:String(page)})}`,{signal:controller.signal}).then(async response=>{const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Could not load catalogue.');if(!controller.signal.aborted)setData(payload);}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Could not load catalogue.');}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});
    return ()=>controller.abort();
  },[year,series,q,page,retry]);
  const input='mt-2 w-full rounded-xl border border-white/20 bg-[#0b1223] p-3';
  return <section className="space-y-5 rounded-2xl border border-white/10 p-5" aria-busy={busy}>
    <h2 className="text-2xl font-bold">Browse Hot Wheels</h2><p className="text-sm text-white/60">2024–2026 catalogue. Each entry identifies a particular variant. Source coverage is incomplete; reference photos and valuations are not available.</p>
    <div className="grid gap-4 sm:grid-cols-2"><label>Year<select className={input} value={year} onChange={e=>{setYear(e.target.value);setSeries('');setPage(1);}}><option value="">All years</option>{['2026','2025','2024'].map(value=><option key={value}>{value}</option>)}</select></label><label>Series<select disabled={busy} className={input} value={series} onChange={e=>{setSeries(e.target.value);setPage(1);}}><option value="">All series</option>{data?.series.map(value=><option key={value}>{value}</option>)}</select></label></div>
    <form className="flex items-end gap-3" onSubmit={e=>{e.preventDefault();setQ(query.trim());setPage(1);}}><label className="flex-1">Model or toy number<input maxLength={80} className={input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Skyline, Honda or JBC25"/></label><button className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950">Search</button></form>
    {error?<p role="alert" className="text-red-300">{error} <button type="button" onClick={()=>setRetry(n=>n+1)} className="underline">Try again</button></p>:null}
    <p role="status" className="text-sm text-white/60">{busy?'Loading catalogue…':data?`${data.total.toLocaleString()} variants found`:''}</p>
    {!busy&&!error&&data?<><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.results.map(car=><Link key={car.id} href={`/atlas/hot-wheels/cars/${car.id}`} className="rounded-xl border border-white/15 p-4 hover:border-yellow-400"><strong>{car.name}</strong><p className="mt-2 text-sm text-white/60">{car.year} · {car.series}</p><p className="mt-2 text-sm">{car.identifier} · {car.variant}</p><span className="mt-3 block text-xs text-yellow-300">View this variant →</span></Link>)}</div>{!data.results.length?<p>No matching cars. Try another filter or list your car manually.</p>:null}<div className="flex items-center justify-between gap-3"><button type="button" disabled={page<=1} onClick={()=>setPage(n=>n-1)} className="rounded-xl border border-white/20 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {data.page} of {data.pages}</span><button type="button" disabled={page>=data.pages} onClick={()=>setPage(n=>n+1)} className="rounded-xl border border-white/20 px-4 py-2 disabled:opacity-40">Next</button></div></>:null}
    <p className="text-xs text-white/50">Contains information from <a href="https://github.com/topvault/collectdb" className="underline">collectdb</a>, available under <a href="https://opendatacommons.org/licenses/odbl/1-0/" className="underline">ODbL</a>. <a href="/api/atlas/hot-wheels?download=1" className="underline">Download catalogue</a>.</p>
  </section>;
}
