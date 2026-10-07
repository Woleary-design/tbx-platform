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
