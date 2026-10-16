import assert from 'node:assert/strict';
import test from 'node:test';
import { orderGuidance } from '../lib/orders/guidance.ts';

test('only the seller is asked to confirm availability', () => {
  assert.equal(orderGuidance('awaiting_seller','buyer','sandbox').action,false);
  assert.equal(orderGuidance('awaiting_seller','seller','sandbox').action,true);
});
test('buyer payment actions depend on enabled checkout; seller must wait', () => {
  assert.equal(orderGuidance('awaiting_payment','buyer','disabled').action,false);
  assert.equal(orderGuidance('awaiting_payment','buyer','sandbox').action,true);
  assert.match(orderGuidance('awaiting_payment','seller','live').body,/do not dispatch/i);
});
test('verified sandbox payment never asks either party to pay or dispatch, even after expiry', () => {
  for (const status of ['awaiting_payment','payment_expired']) {
    assert.equal(orderGuidance(status,'buyer','sandbox','complete').action,false);
    const seller = orderGuidance(status,'seller','sandbox','complete');
    assert.equal(seller.action,false);
    assert.match(seller.body,/do not dispatch/i);
  }
});
test('real dispatch instructions are only seller actions after verified payment', () => {
  assert.equal(orderGuidance('ready_to_ship','seller','live').action,true);
  assert.equal(orderGuidance('ready_to_ship','buyer','live').action,false);
  assert.equal(orderGuidance('payment_expired','buyer','live').action,false);
});

import { sandboxOrderGuidance } from '../lib/orders/sandbox-guidance.ts';
test('verified test payment stays visible after delivery selection and asks only seller to prepare', () => {
  const ledger={status:'pending',buyer_accepted_at:null};
  const buyer=sandboxOrderGuidance(ledger,{status:'selected'},'buyer',0);
  const seller=sandboxOrderGuidance(ledger,{status:'selected'},'seller',0);
  assert.match(buyer.title,/payment received/i);
  assert.match(buyer.next,/seller prepares/i);
  assert.match(seller.next,/Ready to send/);
});
test('inspection, dispute and settlement override delivery progress', () => {
  const delivery={status:'received'};
  assert.match(sandboxOrderGuidance({status:'delivered',buyer_accepted_at:null},delivery,'buyer',0).next,/Confirm test receipt/);
  assert.match(sandboxOrderGuidance({status:'delivered',buyer_accepted_at:'2026-10-16'},delivery,'buyer',0).next,/Finance reviews/);
  assert.match(sandboxOrderGuidance({status:'disputed',buyer_accepted_at:null},delivery,'seller',0).title,/under review/);
  assert.equal(sandboxOrderGuidance({status:'paid_test',buyer_accepted_at:'2026-10-16'},delivery,'buyer',0).next,'No action needed.');
});
test('expired test bookings and locker collection keep their distinct next actors', () => {
  const ledger={status:'pending',buyer_accepted_at:null};
  assert.match(sandboxOrderGuidance(ledger,{status:'booked',dropoff_deadline:'2026-01-01'},'seller',Date.parse('2026-10-16')).next,/Renew/);
  assert.match(sandboxOrderGuidance({status:'in_transit',buyer_accepted_at:null},{status:'awaiting_collection'},'buyer',0).next,/simulated buyer collection/);
});
