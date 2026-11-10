import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveKepler, position, orbitPath, daysSinceJ2000 } from '../src/orbits.js';
import { PLANETS } from '../src/data/planets.js';

const earth = PLANETS.find((p) => p.name === 'Terra');

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
  assert.ok(Math.abs(position(earth, 0).r - 0.9833) < 0.001);
});

test('posição se repete após um período', () => {
  for (const p of PLANETS) {
    const a = position(p, 1234);
    const b = position(p, 1234 + p.period);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1e-6, p.name);
  }
});

test('distância fica entre periélio e afélio', () => {
  for (const p of PLANETS) {
    for (let d = 0; d < p.period; d += p.period / 50) {
      const { r } = position(p, d);
      assert.ok(r >= p.a * (1 - p.e) - 1e-9 && r <= p.a * (1 + p.e) + 1e-9, p.name);
    }
  }
});

test('orbitPath fecha a elipse', () => {
  const pts = orbitPath(earth, 90);
  assert.equal(pts.length, 91);
  assert.ok(Math.hypot(pts[0].x - pts[90].x, pts[0].y - pts[90].y) < 1e-9);
});

test('daysSinceJ2000 de 2000-01-01T12:00Z é 0', () => {
  assert.equal(daysSinceJ2000(new Date(Date.UTC(2000, 0, 1, 12))), 0);
});
