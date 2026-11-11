import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equatorialToEcliptic, equatorialToScene, bvToTemperature, bvToRgb, magToSprite, OBLIQUITY } from '../src/sky-math.js';

const close = (a, b, eps = 1e-9, msg) => assert.ok(Math.abs(a - b) < eps, `${msg ?? ''} ${a} ≉ ${b}`);

test('ponto vernal (RA 0, Dec 0) é o eixo x da eclíptica', () => {
  const v = equatorialToEcliptic(0, 0);
  close(v.x, 1); close(v.y, 0); close(v.z, 0);
});

test('polo norte celeste fica a 23,44° do polo da eclíptica', () => {
  const v = equatorialToEcliptic(0, 90);
  close(v.z, Math.cos(OBLIQUITY)); close(v.y, Math.sin(OBLIQUITY));
});

test('solstício de verão (RA 90°, Dec +23,44°) cai exatamente na eclíptica (z=0, y=1)', () => {
  const v = equatorialToEcliptic(90, 23.4392911);
  close(v.y, 1); close(v.z, 0, 1e-9);
});

test('vetores são unitários', () => {
  for (const [ra, dec] of [[101.287, -16.716], [213.915, 19.182], [37.95, 89.26]]) {
    const v = equatorialToEcliptic(ra, dec);
    close(Math.hypot(v.x, v.y, v.z), 1);
  }
});

test('Sirius (RA 101,287° Dec −16,716°) tem latitude eclíptica ≈ −39,6°', () => {
  const v = equatorialToEcliptic(101.287, -16.716);
  close((Math.asin(v.z) * 180) / Math.PI, -39.6, 0.2);
});

test('equatorialToScene: norte eclíptico vira +y', () => {
  const v = equatorialToScene(0, 90);
  close(v.y, Math.cos(OBLIQUITY));
});

test('B–V: Sol (0,65) ≈ 5800 K; Betelgeuse (1,85) mais fria; Rigel (−0,03) mais quente', () => {
  close(bvToTemperature(0.65), 5800, 250);
  assert.ok(bvToTemperature(1.85) < 3800);
  assert.ok(bvToTemperature(-0.03) > 10000);
});

test('cor: estrela quente é azulada, fria é avermelhada', () => {
  const [r1, , b1] = bvToRgb(-0.2);
  const [r2, , b2] = bvToRgb(1.8);
  assert.ok(b1 > r1, 'quente: b > r');
  assert.ok(r2 > b2, 'fria: r > b');
  for (const c of [...bvToRgb(0.6), ...bvToRgb(-0.4), ...bvToRgb(2)]) assert.ok(c >= 0 && c <= 1);
});

test('brilho: mais brilhante = maior e mais intenso; limites respeitados', () => {
  const sirius = magToSprite(-1.44), faint = magToSprite(6.5);
  assert.ok(sirius.size > faint.size && sirius.intensity > faint.intensity);
  assert.ok(faint.size >= 2 && sirius.intensity <= 1);
});
