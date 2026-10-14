import {createHash} from 'node:crypto';
import type {HistoryPoint} from './price-history';
export const REFERENCE_KIND='atlas_retail_reference_v1';
export type ReferenceSnapshot={captured_at:string;market_value:number|string|null;low_price:number|string|null;high_price:number|string|null;source_summary:{kind?:string;condition?:string;referenceCount?:number}|null};
export function referenceDay(time:number){return new Date(time+7200000).toISOString().slice(0,10);}
export function buildReferenceHistory(rows:ReferenceSnapshot[],condition:string,now=Date.now()):HistoryPoint[] {
 const days=new Map<string,HistoryPoint>();
 for(const row of [...rows].sort((a,b)=>a.captured_at.localeCompare(b.captured_at))){const time=Date.parse(row.captured_at);const value=Number(row.market_value),low=Number(row.low_price),high=Number(row.high_price);const count=row.source_summary?.referenceCount;
  if(row.source_summary?.kind!==REFERENCE_KIND||row.source_summary.condition!==condition||!Number.isFinite(time)||time>now||time<now-365*86400000||![value,low,high].every(n=>Number.isFinite(n)&&n>0)||low>value||high<value||typeof count!=='number'||!Number.isSafeInteger(count)||count<1)continue;
  days.set(referenceDay(time),{date:referenceDay(time),median:value,low,high,count});
 }
 return [...days.values()].sort((a,b)=>a.date.localeCompare(b.date));
}

export function referenceSnapshotId(setId:string,condition:string,day:string){
 const hex=createHash('sha256').update(`atlas-retail-reference-v1:${setId}:${condition}:${day}`).digest('hex').slice(0,32).split('');hex[12]='8';hex[16]=((parseInt(hex[16],16)&3)|8).toString(16);const value=hex.join('');return `${value.slice(0,8)}-${value.slice(8,12)}-${value.slice(12,16)}-${value.slice(16,20)}-${value.slice(20)}`;
}
