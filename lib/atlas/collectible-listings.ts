import {createClient} from '@/lib/supabase/server';
export type CatalogueListing={id:string;title:string;price:number;condition:string;packaging:string;imageUrl:string|null};
export async function collectibleListings(category:'Hot Wheels'|'Pokémon',id:string):Promise<{listings:CatalogueListing[];total:number;unavailable:boolean}> {
  if(!/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(id))return {listings:[],total:0,unavailable:true};
  try {
    const supabase=await createClient();
    const {data,count,error}=await supabase.from('listings').select('id, title, asset_id, asking_price, value_quote',{count:'exact'}).eq('status','Active').not('published_at','is',null).eq('value_quote->>category',category).eq('value_quote->catalogueReference->>id',id).order('asking_price',{ascending:true}).limit(12);
    if(error)return {listings:[],total:0,unavailable:true};
    const assets=(data||[]).map(row=>row.asset_id).filter(Boolean);
    const {data:photos}=assets.length?await supabase.from('asset_evidence').select('asset_id,storage_bucket,storage_path').in('asset_id',assets).order('created_at',{ascending:true}):{data:[]};
    const images=new Map<string,string>();
    for(const photo of photos||[])if(photo.storage_bucket&&photo.storage_path&&!images.has(photo.asset_id))images.set(photo.asset_id,supabase.storage.from(photo.storage_bucket).getPublicUrl(photo.storage_path).data.publicUrl);
    const listings=(data||[]).flatMap(row=>{const price=Number(row.asking_price);if(!Number.isFinite(price)||price<=0)return [];const details=row.value_quote?.collectibleDetails||{};return [{id:row.id,title:row.title||'Collectible',price,condition:details.Condition||'Not recorded',packaging:details['Sealed or loose']||details.Edition||'Not recorded',imageUrl:images.get(row.asset_id)||null}];});
    return {listings,total:count??listings.length,unavailable:false};
  }catch{return {listings:[],total:0,unavailable:true};}
}
