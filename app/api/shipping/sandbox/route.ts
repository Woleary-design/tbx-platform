import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sandboxConfig } from '@/lib/payments/payfast';
export async function POST(request: Request) {
 const config = sandboxConfig();
 if (!config || process.env.VERCEL_ENV !== 'preview') return NextResponse.json({ error:'Sandbox delivery is unavailable.' },{status:503});
 if (request.headers.get('origin') !== config.siteUrl) return NextResponse.json({ error:'Invalid origin.' },{status:403});
 const body = await request.json().catch(()=>null);
 if (!body || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.reservationId ?? '') || !['select','ready','dispatch','arrive','receive'].includes(body.action)
  || (body.details != null && (typeof body.details !== 'object' || Array.isArray(body.details) || JSON.stringify(body.details).length>1500))) return NextResponse.json({error:'Check the delivery details.'},{status:400});
 const supabase = await createClient();
 const {data} = await supabase.auth.getUser();
 if (!data.user) return NextResponse.json({error:'Sign in first.'},{status:401});
 const {error} = await supabase.rpc('act_on_sandbox_delivery',{target_reservation_id:body.reservationId,requested_action:body.action,details:body.details??{}});
 if(error) return NextResponse.json({error:'Action unavailable. Check payment, courier cost, delivery stage, deadlines and permissions.'},{status:409});
 return NextResponse.json({ok:true,simulation:true});
}
