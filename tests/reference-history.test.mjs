import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildReferenceHistory,referenceSnapshotId,REFERENCE_KIND} from '../lib/market/reference-history.ts';
const now=Date.parse('2026-10-14T10:00:00Z');const row={captured_at:'2026-10-14T08:00:00Z',market_value:300,low_price:200,high_price:400,source_summary:{kind:REFERENCE_KIND,condition:'Used Complete',referenceCount:5}};
test('dated reference history deduplicates daily observations and keeps the latest real price',()=>{assert.deepEqual(buildReferenceHistory([row,{...row,captured_at:'2026-10-14T09:00:00Z',market_value:320}],'Used Complete',now),[{date:'2026-10-14',median:320,low:200,high:400,count:5}]);});
test('history never backfills prices or mixes conditions, legacy snapshots and future observations',()=>{
 assert.deepEqual(buildReferenceHistory([],'Used Complete',now),[]);
 const invalid=[{...row,source_summary:{...row.source_summary,condition:'New Sealed'}},{...row,captured_at:'2027-01-01'},{...row,source_summary:{kind:'legacy'}},{...row,market_value:0}];assert.deepEqual(buildReferenceHistory(invalid,'Used Complete',now),[]);assert.equal(buildReferenceHistory([row],'Used Complete',now).length,1);
});

test('daily observation identity is stable for concurrent requests and separate by condition/day',()=>{const a=referenceSnapshotId('set-a','Used Complete','2026-10-14');assert.equal(a,referenceSnapshotId('set-a','Used Complete','2026-10-14'));assert.notEqual(a,referenceSnapshotId('set-a','New Sealed','2026-10-14'));assert.notEqual(a,referenceSnapshotId('set-a','Used Complete','2026-10-15'));assert.match(a,/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);});
