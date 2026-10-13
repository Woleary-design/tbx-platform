import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pokemonCard, catalogueId } from '@/lib/atlas/pokemon';
import { catalogueFields } from '@/lib/atlas/collectible-catalogue';
export async function POST(request: Request) {
  if(process.env.VERCEL_ENV!=='preview')return NextResponse.json({error:'Sandbox only.'},{status:404});
  const supabase=await createClient();const {data:auth}=await supabase.auth.getUser();
  if(!auth.user)return NextResponse.json({error:'Sign in to save cards.'},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body||!catalogueId(body.id)||!['collection','wishlist'].includes(body.action))return NextResponse.json({error:'Invalid catalogue action.'},{status:400});
  if(body.action==='wishlist'&&typeof body.wanted!=='boolean')return NextResponse.json({error:'Choose wishlist state.'},{status:400});
  if(body.action==='wishlist'&&!body.wanted){const {error}=await supabase.from('collectible_wishlist').delete().eq('collector_id',auth.user.id).eq('category','Pokémon').eq('catalogue_id',body.id);return error?NextResponse.json({error:'Could not update wishlist.'},{status:500}):NextResponse.json({wishlisted:false});}
  try {
    const card=await pokemonCard(body.id);if(!card)return NextResponse.json({error:'Card not found.'},{status:404});
    const {setId,rarity,illustrator,hp,types,...reference}=card;
    void setId;void rarity;void illustrator;void hp;void types;
    if(body.action==='wishlist') {
      const {error}=await supabase.from('collectible_wishlist').upsert({collector_id:auth.user.id,category:'Pokémon',catalogue_id:card.id,catalogue_reference:reference},{onConflict:'collector_id,category,catalogue_id'});
      return error?NextResponse.json({error:'Could not save wishlist.'},{status:500}):NextResponse.json({wishlisted:true});
    }
    const finishes=card.variants?.length?card.variants:['Not specified — describe below'];
    if(!card.editions?.includes(body.edition)||!finishes.includes(body.finish)||!['Near mint','Lightly played','Moderately played','Heavily played','Damaged'].includes(body.condition)||typeof body.graded!=='boolean')return NextResponse.json({error:'Choose the card finish and condition.'},{status:400});
    if(body.graded&&![body.company,body.grade,body.cert].every(v=>typeof v==='string'&&v.trim().length>0&&v.length<=120))return NextResponse.json({error:'Enter grading company, grade and certification number.'},{status:400});
    const details={...catalogueFields(card),Finish:body.finish,Edition:body.edition,Condition:body.condition,...(body.graded?{'Grading company':body.company.trim(),Grade:body.grade.trim(),'Certification number':body.cert.trim()}:{})};
    const {data:asset,error}=await supabase.from('assets').insert({owner_id:auth.user.id,set_number:card.id,set_name:card.name,theme:'Pokémon',condition:body.condition==='Damaged'?'Used Incomplete':'Used Complete',sealed:false,estimated_value:null,passport_status:'Draft',is_public:false,collectible_details:details,catalogue_reference:{...reference,variant:body.finish},notes:''}).select('id').single();
    if(error||!asset)return NextResponse.json({error:'Could not save your card. Please try again.'},{status:500});
    return NextResponse.json({assetId:asset.id});
  }catch{return NextResponse.json({error:'Catalogue temporarily unavailable. Please try again.'},{status:503});}
}
