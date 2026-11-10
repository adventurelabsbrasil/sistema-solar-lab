import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveKepler, position, orbitPath, daysSinceJ2000, eclipticToScene } from '../src/orbits.js';
import { PLANETS, MOON, AU_KM } from '../src/data/bodies.js';

const earth = PLANETS.find((p) => p.id === 'terra');
const DEG = Math.PI / 180;

test('solveKepler satisfaz M = E - e·sin(E)', () => {
  for (const e of [0, 0.0167, 0.2056, 0.7]) {
    for (const M of [-3, -1, 0, 0.5, 2, 3.1]) {
      const E = solveKepler(M, e);
      assert.ok(Math.abs(E - e * Math.sin(E) - M) < 1e-10, `e=${e} M=${M}`);
    }
  }
});

test('órbita circular (e=0) tem r constante', () => {
  const circ = { ...earth, e: 0 };
  for (const d of [0, 100, 200, 300]) assert.ok(Math.abs(position(circ, d).r - circ.a) < 1e-9);
});

test('Terra em J2000 está perto do periélio (~0.9833 UA)', () => {
  const p = position(earth, 0);
  assert.ok(Math.abs(p.r - 0.9833) < 0.001);
  assert.ok(Math.abs(Math.hypot(p.x, p.y, p.z) - p.r) < 1e-6, 'Terra praticamente na eclíptica');
});

test('posição 3D se repete após um período (planetas)', () => {
  for (const p of PLANETS) {
    const a = position(p, 1234);
    const b = position(p, 1234 + p.period);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1e-6, p.name);
  }
});

test('distância fica entre periélio e afélio', () => {
  for (const p of [...PLANETS, MOON]) {
    for (let d = 0; d < p.period; d += p.period / 50) {
      const { r } = position(p, d);
      assert.ok(r >= p.a * (1 - p.e) - 1e-9 && r <= p.a * (1 + p.e) + 1e-9, p.name);
    }
  }
});

test('|z| nunca excede r·sin(I) — inclinação respeitada', () => {
  for (const p of PLANETS) {
    for (let d = 0; d < p.period; d += p.period / 60) {
      const pos = position(p, d);
      const dist = Math.hypot(pos.x, pos.y, pos.z);
      assert.ok(Math.abs(pos.z) <= dist * Math.sin(Math.abs(p.I) * DEG) + 1e-9, p.name);
    }
  }
});

test('Lua: distância geocêntrica entre ~356 mil e ~407 mil km em 20 anos', () => {
  let min = Infinity, max = 0;
  for (let d = 0; d < 365.25 * 20; d += 0.25) {
    const km = position(MOON, d).r * AU_KM;
    min = Math.min(min, km);
    max = Math.max(max, km);
  }
  assert.ok(min > 355000 && min < 364000, `min ${min}`);
  assert.ok(max > 404000 && max < 407000, `max ${max}`);
});

test('Lua: plano orbital inclinado ~5° (máx |z|/r ≈ sin 5.145°)', () => {
  let maxRatio = 0;
  for (let d = 0; d < 400; d += 0.1) {
    const p = position(MOON, d);
    maxRatio = Math.max(maxRatio, Math.abs(p.z) / Math.hypot(p.x, p.y, p.z));
  }
  assert.ok(Math.abs(maxRatio - Math.sin(5.145 * DEG)) < 0.002, `ratio ${maxRatio}`);
});

test('orbitPath fecha a elipse e tem N pontos distintos', () => {
  const pts = orbitPath(earth, 90);
  assert.equal(pts.length, 90);
  const first = pts[0], last = pts[89];
  const step = Math.hypot(first.x - last.x, first.y - last.y, first.z - last.z);
  assert.ok(step < 0.12, 'último ponto próximo ao primeiro');
});

test('eclipticToScene: norte eclíptico vira +y; (x,y,z)→(x,z,-y)', () => {
  assert.deepEqual(eclipticToScene({ x: 1, y: 2, z: 3 }), { x: 1, y: 3, z: -2 });
});

test('daysSinceJ2000 de 2000-01-01T12:00Z é 0', () => {
  assert.equal(daysSinceJ2000(new Date(Date.UTC(2000, 0, 1, 12))), 0);
});
