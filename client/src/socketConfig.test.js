import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSocketUrl } from './socketConfig.js';

test('uses explicit VITE socket URL when provided', () => {
  const url = resolveSocketUrl({
    explicitUrl: 'http://example.test:3001',
    locationOrigin: 'http://localhost:5173'
  });

  assert.equal(url, 'http://example.test:3001');
});

test('uses backend port 3001 when frontend is running on Vite port 5173', () => {
  const url = resolveSocketUrl({
    explicitUrl: '',
    locationOrigin: 'http://localhost:5173'
  });

  assert.equal(url, 'http://localhost:3001');
});

test('uses same origin outside the Vite dev port', () => {
  const url = resolveSocketUrl({
    explicitUrl: '',
    locationOrigin: 'https://partida.example.com'
  });

  assert.equal(url, 'https://partida.example.com');
});
