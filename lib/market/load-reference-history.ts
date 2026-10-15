import {createClient} from '@/lib/supabase/server';
import {createServiceClient} from '@/lib/supabase/service';
import type {PriceHistory} from './price-history';
import {buildReferenceHistory,referenceDay,referenceSnapshotId,REFERENCE_KIND,type ReferenceSnapshot} from './reference-history';
type Retail={status:string;adjustedLow:number|null;adjustedRecommended:number|null;adjustedHigh:number|null;listings:unknown[]};
export async function loadReferenceHistory(setId:string,condition:string,retail:Retail|null):Promise<PriceHistory> {
 const now=Date.now(),asOf=new Date(now).toISOString();let recording:'saved'|'unavailable'|'not_applicable'='not_applicable';
 const validCondition=['New Sealed','New Open Box','Used Complete','Used Incomplete'].includes(condition);
 const current=validCondition&&retail?.status==='available'&&retail.listings.length>0&&[retail.adjustedLow,retail.adjustedRecommended,retail.adjustedHigh].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0)?{captured_at:asOf,market_value:retail.adjustedRecommended,low_price:retail.adjustedLow,high_price:retail.adjustedHigh,source_summary:{kind:REFERENCE_KIND,condition,referenceCount:retail.listings.length}}:null;
 if(current&&process.env.VERCEL_ENV==='preview'){
  try {const service=createServiceClient();const snapshotId=referenceSnapshotId(setId,condition,referenceDay(now));
   const {data:existing,error:lookupError}=await service.from('market_price_snapshots').select('id,market_value,low_price,high_price,source_summary').eq('id',snapshotId).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
   if(lookupError)throw lookupError;
   const payload={...current,id:snapshotId,lego_set_id:setId,condition:condition==='New Open Box'?'Unknown':condition,currency:'ZAR',sold_sample_count:0,average_sold_price:null};
   const changed=!existing||Number(existing.market_value)!==current.market_value||Number(existing.low_price)!==current.low_price||Number(existing.high_price)!==current.high_price||existing.source_summary?.referenceCount!==current.source_summary.referenceCount;
   if(changed){const {error}=existing?await service.from('market_price_snapshots').update(payload).eq('id',existing.id).abortSignal(AbortSignal.timeout(5000)):await service.from('market_price_snapshots').upsert(payload,{onConflict:'id'}).abortSignal(AbortSignal.timeout(5000));if(error)throw error;}
   recording='saved';
  }catch{recording='unavailable';}
 }
 try {const supabase=await createClient();const {data,error}=await supabase.from('market_price_snapshots').select('captured_at,market_value,low_price,high_price,source_summary').eq('lego_set_id',setId).eq('currency','ZAR').eq('source_summary->>kind',REFERENCE_KIND).eq('source_summary->>condition',condition).gte('captured_at',new Date(now-365*86400000).toISOString()).order('captured_at',{ascending:false}).limit(2000).abortSignal(AbortSignal.timeout(5000));
  if(error)throw error;const points=buildReferenceHistory([...(data||[]) as ReferenceSnapshot[],...(current?[current]:[])],condition,now);return {points,status:points.length?'available':'empty',asOf,condition,kind:'references',recording};
 }catch{const points=current?buildReferenceHistory([current],condition,now):[];return {points,status:points.length?'available':'unavailable',asOf,condition,kind:'references',recording};}
}
