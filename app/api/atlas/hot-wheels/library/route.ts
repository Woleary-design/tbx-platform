import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {hotWheelsCar,hotWheelsCopyError} from '@/lib/atlas/hot-wheels';
import {catalogueFields} from '@/lib/atlas/collectible-catalogue';
export async function POST(request:Request) {
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({error:'Sandbox only.'},{status:404});
  const supabase=await createClient();const {data:auth}=await supabase.auth.getUser();
  if(!auth.user)return NextResponse.json({error:'Sign in to save cars.'},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body||typeof body.id!=='string'||!['collection','wishlist'].includes(body.action))return NextResponse.json({error:'Invalid catalogue action.'},{status:400});
  const car=hotWheelsCar(body.id);if(!car)return NextResponse.json({error:'Car not found.'},{status:404});
  if(body.action==='wishlist') {
    if(typeof body.wanted!=='boolean')return NextResponse.json({error:'Choose wishlist state.'},{status:400});
    const {error}=body.wanted?await supabase.from('collectible_wishlist').upsert({collector_id:auth.user.id,category:'Hot Wheels',catalogue_id:car.id,catalogue_reference:car},{onConflict:'collector_id,category,catalogue_id'}):await supabase.from('collectible_wishlist').delete().eq('collector_id',auth.user.id).eq('category','Hot Wheels').eq('catalogue_id',car.id);
    return error?NextResponse.json({error:'Could not update wishlist.'},{status:500}):NextResponse.json({wishlisted:body.wanted});
  }
  const invalid=hotWheelsCopyError(body);if(invalid)return NextResponse.json({error:invalid},{status:400});
  const details={...catalogueFields(car),'Sealed or loose':body.packaging,Condition:body.condition,'Packaging condition':body.packaging==='Loose'?'Not applicable':body.packagingCondition};
  const {data:asset,error}=await supabase.from('assets').insert({owner_id:auth.user.id,set_number:car.id,set_name:car.name,theme:'Hot Wheels',condition:body.condition==='Damaged'?'Used Incomplete':'Used Complete',sealed:body.packaging==='Sealed',estimated_value:null,passport_status:'Draft',is_public:false,collectible_details:details,catalogue_reference:car,notes:''}).select('id').single();
  return error||!asset?NextResponse.json({error:'Could not save your car. Please try again.'},{status:500}):NextResponse.json({assetId:asset.id});
}
