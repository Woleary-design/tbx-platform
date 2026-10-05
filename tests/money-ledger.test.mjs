import assert from 'node:assert/strict';
import test from 'node:test';
import { payoutReady, payoutLabel } from '../lib/money/ledger.ts';
const l = { status:'delivered',seller_cents:90000,processor_cents:3500,buyer_accepted_at:null,inspection_ends_at:'2026-10-07T12:00:00Z' };
test('payout waits for delivery, costs and inspection or buyer acceptance',()=>{
 assert.equal(payoutReady(l,Date.parse('2026-10-07T11:59:59Z')),false);
 assert.equal(payoutReady(l,Date.parse(l.inspection_ends_at)),true);
 assert.equal(payoutReady({...l,buyer_accepted_at:'2026-10-05T12:00:00Z'}),true);
 for(const status of ['pending','in_transit','disputed','paid_test','refunded_test']) assert.equal(payoutReady({...l,status,buyer_accepted_at:'2026-10-05T12:00:00Z'}),false);
 assert.equal(payoutReady({...l,processor_cents:null,buyer_accepted_at:'2026-10-05T12:00:00Z'}),false);
 assert.equal(payoutReady({...l,seller_cents:null,buyer_accepted_at:'2026-10-05T12:00:00Z'}),false);
});
test('payout wording distinguishes a simulation from a real transfer',()=>{
 assert.match(payoutLabel({...l,status:'paid_test'}),/simulation/);
 assert.match(payoutLabel({...l,status:'refunded_test'}),/simulation/);
 assert.match(payoutLabel({...l,status:'disputed'}),/Paused/);
 assert.match(payoutLabel({...l,buyer_accepted_at:'2026-10-05T12:00:00Z'}),/Ready.*simulation/);
});
