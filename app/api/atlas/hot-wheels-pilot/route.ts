import { NextResponse } from 'next/server';
import pilot from '@/lib/atlas/hot-wheels-pilot.json';
export function GET() {
  if (process.env.VERCEL_ENV !== 'preview') return NextResponse.json({error:'Not available.'},{status:404});
  return NextResponse.json(pilot, {headers:{'Content-Disposition':'attachment; filename="tbx-hot-wheels-pilot.json"'}});
}
