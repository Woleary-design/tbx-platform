import {createClient} from '@/lib/supabase/server';
import {buildSaleHistory,type PriceHistory,type SaleEvidence} from './price-history';
export async function loadPriceHistory(collectibleId:string|null,condition:string):Promise<PriceHistory> {
 const asOf=new Date().toISOString();if(!collectibleId)return {points:[],status:'empty',asOf,condition};
 try {const supabase=await createClient();const {data,error,count}=await supabase.from('market_sales').select('sold_at,sold_price,currency,country_code,item_condition,verified,verification_method,raw_data,market_sources!inner(code,is_active,supports_sales)',{count:'exact'}).eq('collectible_id',collectibleId).eq('item_condition',condition).eq('currency','ZAR').eq('country_code','ZA').eq('verified',true).eq('market_sources.is_active',true).eq('market_sources.supports_sales',true).gte('sold_at',new Date(Date.parse(asOf)-365*86400000).toISOString()).lte('sold_at',asOf).order('sold_at',{ascending:true}).limit(10000).abortSignal(AbortSignal.timeout(8000));
  if(error||(count||0)>10000)return {points:[],status:'unavailable',asOf,condition};const points=buildSaleHistory((data||[]) as unknown as SaleEvidence[],condition,Date.parse(asOf));return {points,status:points.length?'available':'empty',asOf,condition};
 }catch{return {points:[],status:'unavailable',asOf,condition};}
}
