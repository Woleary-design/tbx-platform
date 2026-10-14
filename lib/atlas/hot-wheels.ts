import catalogue from './hot-wheels-catalogue.json' with { type: 'json' };
import type { CatalogueMatch } from './collectible-catalogue.ts';
export type HotWheelsMatch = CatalogueMatch & {recordSourceUrl:string;sourceRevision:string;memberships:{year:string;series:string;sourceUrl:string}[]};
export const hotWheelsCatalogue = catalogue;
const records: HotWheelsMatch[] = catalogue.records as HotWheelsMatch[];
const byId = new Map(records.map(record => [record.id, record]));
export function hotWheelsCar(id:string) { return byId.get(id) || null; }
export function browseHotWheels({q='',year='',series='',page=1}:{q?:string;year?:string;series?:string;page?:number}) {
  const terms=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches=records.filter(record => (!year && !series || record.memberships.some(m=>(!year||m.year===year)&&(!series||m.series===series))) && terms.every(term=>[record.name,record.identifier,record.variant,...record.memberships.map(m=>`${m.year} ${m.series}`)].join(' ').toLowerCase().includes(term)));
  const pages=Math.max(1,Math.ceil(matches.length/24));const current=Math.max(1,Math.min(page,pages));
  return {results:matches.slice((current-1)*24,current*24),total:matches.length,page:current,pages,
    years:[...new Set(records.flatMap(record=>record.memberships.map(m=>m.year)))].sort().reverse(),
    series:[...new Set(records.flatMap(record=>record.memberships.filter(m=>!year||m.year===year).map(m=>m.series)))].sort(),
    scope:catalogue.scope,notice:catalogue.notice};
}
export const hotWheelsPackaging = ['Sealed','Opened packaging','Loose'] as const;
export const hotWheelsConditions = ['Mint','Good','Fair','Damaged'] as const;
export function hotWheelsCopyError(body: {packaging?:unknown;condition?:unknown;packagingCondition?:unknown}) {
  if(!hotWheelsPackaging.some(value=>value===body.packaging)||!hotWheelsConditions.some(value=>value===body.condition))return 'Choose packaging and car condition.';
  if(body.packaging!=='Loose'&&!hotWheelsConditions.some(value=>value===body.packagingCondition))return 'Choose packaging condition.';
  return null;
}
