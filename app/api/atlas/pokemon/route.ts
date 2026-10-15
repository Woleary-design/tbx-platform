import { NextRequest, NextResponse } from 'next/server';
import { catalogueId, pokemonFetch, pokemonSet } from '@/lib/atlas/pokemon';
export async function GET(request: NextRequest) {
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({error:'Sandbox only.'},{status:404});
  const id=request.nextUrl.searchParams.get('set');
  if(id && !catalogueId(id))return NextResponse.json({error:'Invalid set.'},{status:400});
  try {
    const value=await pokemonFetch(id?`sets/${encodeURIComponent(id)}`:'sets');
    if(!value)return NextResponse.json({error:'Set not found.'},{status:404});
    if(id)return NextResponse.json(value);
    return NextResponse.json({sets:Array.isArray(value)?value.map(pokemonSet).filter(Boolean):[]});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Catalogue unavailable.'},{status:503});}
}
