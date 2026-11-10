// Mecânica orbital pura (sem DOM) — testável em Node.
const DEG = Math.PI / 180;
const TWO_PI = 2 * Math.PI;

export const J2000_MS = Date.UTC(2000, 0, 1, 12);
export const MS_PER_DAY = 86400000;
export const LIGHT_MIN_PER_AU = 8.316746;

export const daysSinceJ2000 = (date) => (date.getTime() - J2000_MS) / MS_PER_DAY;
export const dateFromDays = (days) => new Date(J2000_MS + days * MS_PER_DAY);

/** Resolve a equação de Kepler M = E - e·sin(E) por Newton-Raphson. M em rad. */
export function solveKepler(M, e, tol = 1e-12) {
  const m = ((((M + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 50; i++) {
    const d = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < tol) break;
  }
  return E;
}

/** Posição heliocêntrica no plano da eclíptica (UA) após `days` dias desde J2000. */
export function position(planet, days) {
  const n = 360 / planet.period; // graus/dia
  const M = (planet.L0 - planet.varpi + n * days) * DEG;
  const E = solveKepler(M, planet.e);
  return fromAnomaly(planet, E);
}

/** Ponto da órbita dado a anomalia excêntrica E (usado também para desenhar a elipse). */
export function fromAnomaly(planet, E) {
  const x = planet.a * (Math.cos(E) - planet.e);
  const y = planet.a * Math.sqrt(1 - planet.e * planet.e) * Math.sin(E);
  const w = planet.varpi * DEG;
  return {
    x: x * Math.cos(w) - y * Math.sin(w),
    y: x * Math.sin(w) + y * Math.cos(w),
    r: Math.hypot(x, y),
  };
}

/** Amostra a elipse completa como polilinha. */
export function orbitPath(planet, samples = 180) {
  const pts = [];
  for (let i = 0; i <= samples; i++) pts.push(fromAnomaly(planet, (i / samples) * TWO_PI));
  return pts;
}
