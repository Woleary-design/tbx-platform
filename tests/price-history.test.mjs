import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildSaleHistory,historyWindow} from '../lib/market/price-history.ts';
const now=Date.parse('2026-10-14T10:00:00Z');const base={sold_at:'2026-10-13T10:00:00Z',sold_price:100,currency:'ZAR',country_code:'ZA',item_condition:'Used Complete',verified:true,verification_method:'provider_verified',market_sources:{code:'tbx',is_active:true,supports_sales:true}};
test('history uses actual verified sales and does not include sandbox, other conditions, currencies or future sales',()=>{
 const invalid=[{...base,verified:false},{...base,item_condition:'New Sealed'},{...base,currency:'USD'},{...base,country_code:'US'},{...base,sold_at:'2027-01-01'},{...base,sold_at:'2020-01-01'},{...base,verification_method:'sandbox_payment'},{...base,raw_data:{sandbox:true}},{...base,market_sources:{...base.market_sources,code:'test'}},{...base,sold_price:-1}];
 assert.equal(buildSaleHistory(invalid,'Used Complete',now).length,0);
 assert.deepEqual(buildSaleHistory([base,{...base,sold_price:200},{...base,sold_price:1000}],'Used Complete',now),[{date:'2026-10-13',median:200,low:100,high:1000,count:3}]);
});
test('sale dates use Johannesburg day boundaries and windows contain only recorded days',()=>{
 const points=buildSaleHistory([{...base,sold_at:'2026-10-12T23:30:00Z'},{...base,sold_at:'2026-10-13T01:00:00Z',sold_price:200}],'Used Complete',now);
 assert.equal(points.length,1);assert.equal(points[0].date,'2026-10-13');assert.equal(points[0].median,150);
 assert.equal(historyWindow([{...points[0],date:'2026-08-01'},...points],30,new Date(now).toISOString()).length,1);
 assert.equal(historyWindow([{...points[0],date:'2026-08-01'},...points],90,new Date(now).toISOString()).length,2);
});
