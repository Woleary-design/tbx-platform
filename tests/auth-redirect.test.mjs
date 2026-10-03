import assert from 'node:assert/strict';
import test from 'node:test';
import { safeNextPath } from '../lib/auth/safe-next.ts';

test('authentication redirects preserve local destinations', () => {
  for (const path of ['/dashboard', '/checkout/abc?source=login', '/update-password', '/collection#sets']) {
    assert.equal(safeNextPath(path), path);
  }
});

test('authentication redirects reject external and browser-normalized escapes', () => {
  for (const path of [undefined, null, '', 'https://evil.example', '//evil.example', '/\\evil.example', '/\n/evil.example', '/\t/evil.example', '/a/..//evil.example']) {
    assert.equal(safeNextPath(path), '/dashboard');
  }
});
