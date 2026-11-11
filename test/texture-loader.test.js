import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTextures } from '../src/texture-loader.js';

const mk = (key, file, applied) => ({ key, file, apply: (tex) => applied.push([key, tex]) });

test('uma textura com falha não impede as demais (antes e depois dela)', async () => {
  const applied = [];
  const targets = [mk('mercurio', 'a.jpg', applied), mk('venus', 'bad.jpg', applied), mk('terra', 'c.jpg', applied), mk('marte', 'd.jpg', applied)];
  const io = {
    exists: async () => true,
    load: async (f) => { if (f === 'bad.jpg') throw new Error('imagem inválida'); return `tex:${f}`; },
  };
  const r = await applyTextures(targets, io);
  assert.deepEqual(r.loaded, ['mercurio', 'terra', 'marte']);
  assert.deepEqual(r.failed, [{ key: 'venus', error: 'imagem inválida' }]);
  assert.deepEqual(applied.map(([k]) => k), ['mercurio', 'terra', 'marte']);
});

test('arquivo ausente não é erro e não afeta os outros', async () => {
  const applied = [];
  const r = await applyTextures(
    [mk('a', 'falta.jpg', applied), mk('b', 'ok.jpg', applied)],
    { exists: async (f) => f !== 'falta.jpg', load: async (f) => f },
  );
  assert.deepEqual(r, { loaded: ['b'], failed: [] });
});

test('falha em exists() (rede) ou em apply() fica isolada no próprio alvo', async () => {
  const applied = [];
  const boom = { key: 'x', file: 'x.jpg', apply: () => { throw new Error('material indefinido'); } };
  const r = await applyTextures(
    [mk('a', 'a.jpg', applied), boom, mk('c', 'net.jpg', applied), mk('d', 'd.jpg', applied)],
    { exists: async (f) => { if (f === 'net.jpg') throw new Error('rede'); return true; }, load: async (f) => f },
  );
  assert.deepEqual(r.loaded, ['a', 'd']);
  assert.deepEqual(r.failed.map((f) => f.key).sort(), ['c', 'x']);
});

test('sem alvos devolve vazio', async () => {
  assert.deepEqual(await applyTextures([], { exists: async () => true, load: async () => 1 }), { loaded: [], failed: [] });
});
