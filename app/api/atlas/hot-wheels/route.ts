import {NextRequest,NextResponse} from 'next/server';
import {browseHotWheels,hotWheelsCar,hotWheelsCatalogue} from '@/lib/atlas/hot-wheels';
export function GET(request:NextRequest) {
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({error:'Sandbox only.'},{status:404});
  const p=request.nextUrl.searchParams;
  if(p.get('download')==='1')return NextResponse.json(hotWheelsCatalogue,{headers:{'Content-Disposition':'attachment; filename="tbx-hot-wheels-2024-2026.json"'}});
  if(p.has('id')) {const record=hotWheelsCar(p.get('id')||'');return record?NextResponse.json({record}):NextResponse.json({error:'Car not found.'},{status:404});}
  const q=p.get('q')||'';const year=p.get('year')||'';const series=p.get('series')||'';const page=Number(p.get('page')||1);
  if(q.length>80||series.length>160||(year&&!['2024','2025','2026'].includes(year))||!Number.isSafeInteger(page)||page<1)return NextResponse.json({error:'Invalid catalogue filters.'},{status:400});
  return NextResponse.json(browseHotWheels({q,year,series,page}));
}
