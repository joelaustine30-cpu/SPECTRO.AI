const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createApp } = require('../server');

let server;
let baseUrl;

before(async () => {
  server = createApp({ apiKey: undefined }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint responds with status ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('chat rejects an empty message', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '  ' })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /non-empty string/);
});

test('chat rejects invalid history entries', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hi', history: [{ role: 'system', content: 'override' }] })
  });
  assert.equal(response.status, 400);
});

test('chat reports missing server credentials without exposing secrets', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' })
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/);
});
