export type SaleEvidence={sold_at:string;sold_price:number|string;currency:string;country_code:string;item_condition:string;verified:boolean;verification_method:string|null;raw_data?:Record<string,unknown>|null;market_sources?:{code:string;is_active:boolean;supports_sales:boolean}|{code:string;is_active:boolean;supports_sales:boolean}[]|null};
export type HistoryPoint={date:string;median:number;low:number;high:number;count:number};
export type PriceHistory={points:HistoryPoint[];status:'available'|'empty'|'unavailable';asOf:string;condition:string};
function median(values:number[]){const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;}
export function buildSaleHistory(rows:SaleEvidence[],condition:string,now=Date.now()):HistoryPoint[] {
 const days=new Map<string,number[]>();
 for(const row of rows){const source=Array.isArray(row.market_sources)?row.market_sources[0]:row.market_sources;const price=Number(row.sold_price);const time=Date.parse(row.sold_at);const raw=row.raw_data||{};
  if(!row.verified||row.currency!=='ZAR'||row.country_code!=='ZA'||row.item_condition!==condition||!source?.is_active||!source.supports_sales||/sandbox|simulat|test/i.test(source.code+' '+(row.verification_method||''))||raw.sandbox===true||raw.is_test===true||raw.mode==='sandbox'||!Number.isFinite(price)||price<=0||!Number.isFinite(time)||time>now||time<now-365*86400000)continue;
  const date=new Date(time+2*3600000).toISOString().slice(0,10);const values=days.get(date)||[];values.push(price);days.set(date,values);
 }
 return [...days].sort(([a],[b])=>a.localeCompare(b)).map(([date,values])=>({date,median:median(values),low:Math.min(...values),high:Math.max(...values),count:values.length}));
}
export function historyWindow(points:HistoryPoint[],days:number,asOf:string){const now=Date.parse(asOf)+2*3600000;const from=new Date(now-(days-1)*86400000).toISOString().slice(0,10);const to=new Date(now).toISOString().slice(0,10);return points.filter(p=>p.date>=from&&p.date<=to);}
