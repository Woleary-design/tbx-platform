import {createClient} from '@/lib/supabase/server';
export type HomeSet={set_number:string;name:string;theme:string|null;image_url:string|null};
export type HomeListing={id:string;title:string;price:number;condition:string;setNumber:string;imageUrl:string|null;sellerPhoto:boolean};
export async function loadStorefront(){
 const supabase=await createClient();
 const favourites=['10350','42171','75375','10317','10312','42143'];
 const [auth,catalogue,market]=await Promise.allSettled([
  supabase.auth.getUser(),
  supabase.from('lego_sets').select('set_number,name,theme,image_url').eq('is_active',true).in('set_number',favourites.flatMap(n=>[n,`${n}-1`])).not('image_url','is',null).limit(6).abortSignal(AbortSignal.timeout(6000)),
  supabase.from('listings').select('id,title,asking_price,value_quote,assets!listings_asset_id_fkey(id,set_name,set_number,theme,condition,lego_sets(image_url))').eq('status','Active').not('published_at','is',null).or('value_quote->>category.is.null,value_quote->>category.eq.LEGO').order('published_at',{ascending:false}).limit(6).abortSignal(AbortSignal.timeout(6000))
 ]);
 const user=auth.status==='fulfilled'?auth.value.data.user:null;
 const sets:HomeSet[]=catalogue.status==='fulfilled'&&!catalogue.value.error?(catalogue.value.data||[]):[];
 sets.sort((a,b)=>favourites.indexOf(a.set_number.split('-')[0])-favourites.indexOf(b.set_number.split('-')[0]));
 const unavailable=market.status==='rejected'||Boolean(market.value.error);
 const rows=market.status==='fulfilled'&&!market.value.error?(market.value.data||[]).filter(row=>{const asset=Array.isArray(row.assets)?row.assets[0]:row.assets;return asset&&!['Pokémon','Hot Wheels'].includes(asset.theme||'')&&Number.isFinite(Number(row.asking_price))&&Number(row.asking_price)>0;}):[];
 const ids=rows.flatMap(row=>{const asset=Array.isArray(row.assets)?row.assets[0]:row.assets;return asset?[asset.id]:[];});
 const images=new Map<string,string>();
 if(ids.length){try{const {data:photos}=await supabase.from('asset_evidence').select('asset_id,storage_bucket,storage_path').in('asset_id',ids).order('created_at',{ascending:true}).abortSignal(AbortSignal.timeout(5000));for(const p of photos||[])if(p.storage_bucket&&p.storage_path&&!images.has(p.asset_id))images.set(p.asset_id,supabase.storage.from(p.storage_bucket).getPublicUrl(p.storage_path).data.publicUrl);}catch{/* Listing remains usable without a photo preview. */}}
 const listings:HomeListing[]=rows.map(row=>{const a=Array.isArray(row.assets)?row.assets[0]:row.assets;const set=Array.isArray(a?.lego_sets)?a.lego_sets[0]:a?.lego_sets;return {id:row.id,title:row.title||a?.set_name||'LEGO',price:Number(row.asking_price),condition:row.value_quote?.condition||a?.condition||'Condition not recorded',setNumber:a?.set_number||'',imageUrl:images.get(a?.id||'')||set?.image_url||null,sellerPhoto:images.has(a?.id||'')};});
 return {user,sets,listings,unavailable};
}
