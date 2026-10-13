import { NextRequest, NextResponse } from 'next/server';
import pilot from '@/lib/atlas/hot-wheels-pilot.json';
import { pokemonMatch } from '@/lib/atlas/collectible-catalogue';

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') return NextResponse.json({error:'Catalogue testing is available in the sandbox only.'},{status:404});
  const params = request.nextUrl.searchParams;
  const category = params.get('category');
  const query = (params.get('q') || '').trim();
  const id = params.get('id');
  if (!['pokemon','hot-wheels'].includes(category || '') || (id ? !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(id) : query.length < 2 || query.length > 80)) return NextResponse.json({error:'Enter at least two characters, up to 80.'},{status:400});
  if (category === 'hot-wheels') {
    const terms = query.toLowerCase().split(/\s+/);
    return NextResponse.json({source:'collectdb',scope:pilot.scope,notice:pilot.notice,results:pilot.records.filter(record => id ? record.id === id : terms.every(term => [record.name,record.identifier,record.series,record.variant,record.year].join(' ').toLowerCase().includes(term))).slice(0,20)});
  }
  try {
    const exactId = id || (/^[a-zA-Z0-9.]+-[a-zA-Z]*[0-9][a-zA-Z0-9]*$/.test(query) ? query : null);
    const url = new URL(`https://api.tcgdex.net/v2/en/cards${exactId ? `/${encodeURIComponent(exactId)}` : ''}`);
    if (!exactId) { url.searchParams.set('name',query); url.searchParams.set('pagination:itemsPerPage','12'); }
    const response = await fetch(url, {next:{revalidate:86400},signal:AbortSignal.timeout(12000)});
    if (response.status === 404) return NextResponse.json({source:'TCGdex',results:[]});
    if (!response.ok) throw new Error('Catalogue request failed');
    const value: unknown = await response.json();
    const results = exactId ? [pokemonMatch(value)].filter(Boolean) : Array.isArray(value) ? value.map(pokemonMatch).filter(Boolean).slice(0,12) : [];
    return NextResponse.json({source:'TCGdex',scope:'English physical Pokémon cards; select the exact set, number and finish.',results});
  } catch {
    return NextResponse.json({error:'The Pokémon catalogue is temporarily unavailable. Retry or enter item details manually.'},{status:503});
  }
}
