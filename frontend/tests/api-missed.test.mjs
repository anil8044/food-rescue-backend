import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

async function loadApi(fetch) {
  const context = vm.createContext({ fetch, URLSearchParams });
  const client = new vm.SourceTextModule(await readFile(new URL('../src/api/client.js', import.meta.url), 'utf8'), {
    context, initializeImportMeta(meta) { meta.env = { VITE_API_BASE_URL: 'http://test.local/api' }; },
  });
  const api = new vm.SourceTextModule(await readFile(new URL('../src/api/index.js', import.meta.url), 'utf8'), { context });
  await api.link(() => client);
  await api.evaluate();
  return api.namespace;
}

test('missed summary requests the new endpoint and preserves backend order', async () => {
  const rows = [{ recipientId: 2, missedCount: 3 }, { recipientId: 1, missedCount: 1 }];
  const api = await loadApi(async (url, options) => {
    assert.equal(url, 'http://test.local/api/missed-collections');
    assert.equal(options.method, 'GET');
    return new Response(JSON.stringify(rows));
  });
  assert.deepEqual(JSON.parse(JSON.stringify(await api.missedApi.summary())), rows);
});

test('empty summary stays empty', async () => {
  const api = await loadApi(async () => new Response('[]'));
  assert.equal((await api.missedApi.summary()).length, 0);
});

test('suspend and reinstate use existing user updates', async () => {
  const requests = [];
  const api = await loadApi(async (url, options) => {
    requests.push({ url, method: options.method, body: JSON.parse(options.body) });
    return new Response(options.body);
  });
  await api.usersApi.update(2, { verificationStatus: 'REJECTED' });
  await api.usersApi.update(2, { verificationStatus: 'APPROVED' });
  assert.deepEqual(requests, [
    { url: 'http://test.local/api/users/2', method: 'PUT', body: { verificationStatus: 'REJECTED' } },
    { url: 'http://test.local/api/users/2', method: 'PUT', body: { verificationStatus: 'APPROVED' } },
  ]);
});

test('failed summary or decision exposes the backend error', async () => {
  const api = await loadApi(async () => new Response(JSON.stringify({ error: 'Recipient not found' }), { status: 404 }));
  await assert.rejects(api.missedApi.summary(), { message: 'Recipient not found', status: 404 });
  await assert.rejects(api.usersApi.update(999, { verificationStatus: 'REJECTED' }), { message: 'Recipient not found', status: 404 });
});

test('network failure produces a readable error', async () => {
  const api = await loadApi(async () => { throw new Error('offline'); });
  await assert.rejects(api.missedApi.summary(), { status: 0, message: 'Cannot reach the server. Check that the backend is running (http://test.local/api).' });
});

