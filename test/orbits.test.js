import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { solveKepler, meanMotion, position, orbitPath, daysSinceJ2000, dateFromDays, eclipticToScene, parseUtc, clampDays, MIN_DAYS, MAX_DAYS } from '../src/orbits.js';
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
    const T = 360 / meanMotion(p); // período efetivo do modelo
    const a = position(p, 1234);
    const b = position(p, 1234 + T);
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

test('elementos da Lua batem com Simon et al. 1994 e a ficha da NASA (fixture)', () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/lua-elementos.json', import.meta.url), 'utf8'));
  const s = fx.simon_b1_j2000, n = fx.nasa_factsheet;
  const perDay = (arcsecCy) => arcsecCy / 3600 / 36525;
  assert.deepEqual([MOON.L0, MOON.Ldot], [s.lambda[0], s.lambda[1] / 3600]);
  assert.deepEqual([MOON.varpi, MOON.dVarpi], [s.varpi[0], perDay(s.varpi[1])]);
  assert.deepEqual([MOON.Omega, MOON.dOmega], [s.Omega[0], perDay(s.Omega[1])]);
  assert.deepEqual(
    [MOON.a * AU_KM, MOON.e, MOON.I, MOON.period, MOON.radius, MOON.rotHours, MOON.tilt],
    [n.semimajor_axis_1e6_km * 1e6, n.orbit_eccentricity, n.inclination_to_ecliptic_deg, n.revolution_period_days,
      n.volumetric_mean_radius_km, n.sidereal_rotation_period_hrs, n.obliquity_to_orbit_deg],
  );
  assert.ok(Math.abs(MOON.a * AU_KM - 384400) < 1e-6);
  const T = 360 / meanMotion(MOON);
  assert.ok(Math.abs(T - MOON.period) / T < 5e-5, `período ${T}`);
});

test('Lua acompanha o JPL Horizons (DE441) nos anos 1000, 2000 e 3000', () => {
  // Kepler com elementos médios ignora evecção, variação etc. (~1° de erro típico); o que o teste pega é
  // deriva secular, p. ex. taxas do nó/perigeu no equinócio da data em vez de J2000 (0,8° de latitude em ±1000 anos).
  const fx = JSON.parse(readFileSync(new URL('./fixtures/horizons-lua.json', import.meta.url), 'utf8'));
  for (const [epoch, rows] of Object.entries(fx.series)) {
    let sep = 0, dLat = 0, dR = 0;
    for (const [jd, x, y, z] of rows) {
      const p = position(MOON, jd - 2451545);
      const P = [p.x * AU_KM, p.y * AU_KM, p.z * AU_KM];
      const r = Math.hypot(...P), rh = Math.hypot(x, y, z);
      sep += Math.acos(Math.min(1, (P[0] * x + P[1] * y + P[2] * z) / (r * rh))) / DEG;
      dLat += Math.abs(Math.asin(P[2] / r) - Math.asin(z / rh)) / DEG;
      dR += r - rh;
    }
    const n = rows.length;
    assert.ok(sep / n < 1.0, `JD ${epoch}: separação média ${sep / n}°`);
    assert.ok(dLat / n < 0.2, `JD ${epoch}: erro médio de latitude ${dLat / n}°`);
    assert.ok(Math.abs(dR / n) < 300, `JD ${epoch}: viés de distância ${dR / n} km`);
  }
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

test('parseUtc aceita data, minutos e segundos; rejeita lixo', () => {
  assert.equal(parseUtc('2030-06-01'), Date.UTC(2030, 5, 1));
  assert.equal(parseUtc('2030-06-01T12:30'), Date.UTC(2030, 5, 1, 12, 30));
  assert.equal(parseUtc('2030-06-01T12:30:45'), Date.UTC(2030, 5, 1, 12, 30, 45));
  for (const bad of ['', 'abc', '2030-13-01', '+010213-01-01T00:00', null, undefined]) {
    assert.ok(Number.isNaN(parseUtc(bad)), String(bad));
  }
});

test('intervalo navegável = anos 0001–9999, sempre com ISO de 4 dígitos', () => {
  assert.ok(dateFromDays(MIN_DAYS).toISOString().startsWith('0001-01-01'));
  assert.ok(dateFromDays(MAX_DAYS).toISOString().startsWith('9999-12-31'));
  assert.equal(clampDays(-1e9), MIN_DAYS);
  assert.equal(clampDays(1e9), MAX_DAYS);
  assert.equal(clampDays(123), 123);
  assert.match(dateFromDays(clampDays(1e9)).toISOString(), /^\d{4}-/);
});

test('elementos J2000 dos planetas batem com a Tabela 1 da JPL (fixture)', () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/jpl-table1.json', import.meta.url), 'utf8'));
  for (const p of PLANETS) {
    const [a, e, I, L, varpi, Omega] = fx.planetas[p.id].j2000;
    assert.deepEqual([p.a, p.e, p.I, p.L0, p.varpi, p.Omega], [a, e, I, L, varpi, Omega], p.id);
    assert.equal(p.Ldot, fx.planetas[p.id].Ldot_deg_por_seculo, `${p.id} Ldot`);
  }
});

test('período de exibição concorda com a taxa JPL em 0,05%', () => {
  for (const p of PLANETS) {
    const T = 360 / meanMotion(p);
    assert.ok(Math.abs(T - p.period) / T < 5e-4, `${p.id}: ${p.period} vs ${T}`);
  }
});
