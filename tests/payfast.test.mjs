import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { amountCents, checkoutFields, encodePayfast, parameterString, sandboxConfig, signPayfast, validSignature } from '../lib/payments/payfast.ts';

test('PayFast encoding matches PHP urlencode for spaces and punctuation', () => {
  assert.equal(encodePayfast(" A B!'()*~ "), 'A+B%21%27%28%29%2A%7E');
});
test('signing uses documented field order, skips blank checkout fields, and salts with passphrase', () => {
  const fields = { merchant_id: '10000100', item_name: 'Test & LEGO', empty: '', amount: '10.00' };
  const expected = 'merchant_id=10000100&item_name=Test+%26+LEGO&amount=10.00&passphrase=secret+phrase';
  assert.equal(signPayfast(fields, 'secret phrase'), createHash('md5').update(expected).digest('hex'));
});
test('notifications include empty fields and reject tampering', () => {
  const fields = { m_payment_id: 'abc', amount_gross: '10.00', custom_str1: '' };
  const payload = { ...fields, signature: signPayfast(fields, 'secret', true) };
  assert.equal(parameterString(payload, true), 'm_payment_id=abc&amount_gross=10.00&custom_str1=');
  assert.equal(validSignature(payload, 'secret'), true);
  assert.equal(validSignature({ ...payload, amount_gross: '100.00' }, 'secret'), false);
  assert.equal(validSignature({ ...payload, signature: 'broken' }, 'secret'), false);
});
test('amount parsing rejects ambiguous values without rounding', () => {
  assert.equal(amountCents('123.45'), 12345);
  assert.equal(amountCents('5'), 500);
  for (const value of ['4.99','-5','1e3','10.001','NaN','10oops',' 10']) assert.throws(() => amountCents(value));
});
test('checkout has only sandbox URLs and return redirects cannot assert payment success', () => {
  const fields = checkoutFields({ merchantId:'test', merchantKey:'key', passphrase:'secret', siteUrl:'https://tbx.example' }, { id:'attempt', reservation_id:'order', amount:'10' });
  assert.equal(fields.amount,'10.00');
  assert.equal(fields.return_url,'https://tbx.example/orders/order?sandbox=returned');
  assert.equal(fields.notify_url,'https://tbx.example/api/payments/payfast/notify');
  assert.equal(validSignature(fields,'secret'),true);
});
test('sandbox defaults to disabled', () => {
  const original=process.env.TBX_PAYFAST_SANDBOX_ENABLED;
  delete process.env.TBX_PAYFAST_SANDBOX_ENABLED;
  try { assert.equal(sandboxConfig(),null); }
  finally { if (original !== undefined) process.env.TBX_PAYFAST_SANDBOX_ENABLED=original; }
});
