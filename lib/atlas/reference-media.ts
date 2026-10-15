export function pokemonImage(value:unknown,quality:'low'|'high'='low'):string|null {
  if(typeof value!=='string')return null;
  try {const url=new URL(value);if(url.protocol!=='https:'||url.hostname!=='assets.tcgdex.net'||url.port||url.username||url.password||url.search||url.hash||!/^\/en\/[a-zA-Z0-9._/-]+$/.test(url.pathname))return null;return `${url.origin}${url.pathname.replace(/\/$/,'')}/${quality}.webp`;}catch{return null;}
}
export type ForeignPrice={variant:string;source:'TCGplayer';currency:'USD';amount:number;updated:string;productId:number};
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
export function pokemonReferences(value:unknown,now=Date.now()):ForeignPrice[] {
  const card=object(value);const variants=Array.isArray(card.variants_detailed)?card.variants_detailed.map(object):[];
  const identities=new Map<number,Set<string>>();
  function label(v:Record<string,unknown>) {return [v.type,v.subtype,v.foil,v.size,...(Array.isArray(v.stamp)?v.stamp:[])].filter(x=>typeof x==='string').join(' · ');}
  for(const v of variants){const id=object(v.thirdParty).tcgplayer;if(typeof id==='number'){const set=identities.get(id)||new Set();set.add(label(v));identities.set(id,set);}}
  const result:ForeignPrice[]=[];
  for(const v of variants){const id=object(v.thirdParty).tcgplayer;const pricing=object(object(v.pricing).tcgplayer);if(typeof id!=='number'||!Number.isSafeInteger(id)||id<=0||identities.get(id)?.size!==1||pricing.unit!=='USD'||typeof pricing.updated!=='string')continue;
    const timestamp=Date.parse(pricing.updated);if(!Number.isFinite(timestamp)||timestamp>now+300000||now-timestamp>7*86400000)continue;
    for(const quote of Object.values(pricing)){const p=object(quote);if(p.productId!==id||typeof p.marketPrice!=='number'||!Number.isFinite(p.marketPrice)||p.marketPrice<=0)continue;
      if(!result.some(r=>r.productId===id&&r.variant===label(v)))result.push({variant:label(v),source:'TCGplayer',currency:'USD',amount:p.marketPrice,updated:pricing.updated,productId:id});
    }
  }
  return result;
}
export type ExchangeRate={rate:number;date:string};
export function parseUsdZar(value:unknown,now=Date.now()):ExchangeRate|null {
  const row=object(value);const date=typeof row.date==='string'?row.date:'';const timestamp=Date.parse(date);
  if(row.base!=='USD'||row.quote!=='ZAR'||typeof row.rate!=='number'||!Number.isFinite(row.rate)||row.rate<=0||row.rate>1000||!Number.isFinite(timestamp)||timestamp>now||now-timestamp>7*86400000)return null;
  return {rate:row.rate,date};
}
export function convertedReference(amount:number,fx:ExchangeRate|null):number|null {return fx&&Number.isFinite(amount)&&amount>0?Math.round(amount*fx.rate*100)/100:null;}
