// Mecânica orbital pura (sem DOM) — testável em Node.
// Referencial: eclíptica J2000, eixo z = norte eclíptico, origem no corpo central.
const DEG = Math.PI / 180;
const TWO_PI = 2 * Math.PI;

export const J2000_MS = Date.UTC(2000, 0, 1, 12);
export const MS_PER_DAY = 86400000;
export const LIGHT_MIN_PER_AU = 8.316746;

export const daysSinceJ2000 = (date) => (date.getTime() - J2000_MS) / MS_PER_DAY;
export const dateFromDays = (days) => new Date(J2000_MS + days * MS_PER_DAY);

// Intervalo navegável: anos 0001–9999 (únicos que o ISO-8601 de 4 dígitos e o <input datetime-local> representam).
export const MIN_DAYS = daysSinceJ2000(new Date('0001-01-01T00:00:00Z'));
export const MAX_DAYS = daysSinceJ2000(new Date('9999-12-31T23:59:59Z'));
export const clampDays = (d) => Math.min(MAX_DAYS, Math.max(MIN_DAYS, d));

/** 'YYYY-MM-DD' | 'YYYY-MM-DDTHH:MM' | 'YYYY-MM-DDTHH:MM:SS' (UTC) → ms, ou NaN se inválido. */
export function parseUtc(text) {
  const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::(\d{2}))?)?$/.exec(text ?? '');
  if (!m) return NaN;
  return Date.parse(`${m[1]}T${m[2] ?? '00:00'}:${m[3] ?? '00'}Z`);
}

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

/** Posição (UA, eclíptica) após `days` dias desde J2000, em relação ao corpo central. */
export function position(body, days) {
  const L = body.L0 + (360 / body.period) * days;
  const varpi = body.varpi + (body.dVarpi || 0) * days;
  const M = (L - varpi) * DEG;
  return fromAnomaly(body, solveKepler(M, body.e), days);
}

/** Ponto da órbita dada a anomalia excêntrica E (também usado para desenhar a elipse). */
export function fromAnomaly(body, E, days = 0) {
  const Om = (body.Omega || 0) + (body.dOmega || 0) * days;
  const varpi = body.varpi + (body.dVarpi || 0) * days;
  const w = (varpi - Om) * DEG; // argumento do periélio
  const O = Om * DEG;
  const I = (body.I || 0) * DEG;

  const xp = body.a * (Math.cos(E) - body.e);
  const yp = body.a * Math.sqrt(1 - body.e * body.e) * Math.sin(E);

  const cw = Math.cos(w), sw = Math.sin(w);
  const cO = Math.cos(O), sO = Math.sin(O);
  const cI = Math.cos(I), sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: sw * sI * xp + cw * sI * yp,
    r: Math.hypot(xp, yp),
  };
}

/** Amostra a elipse completa (na orientação do instante `days`) como polilinha. */
export function orbitPath(body, samples = 360, days = 0) {
  const pts = [];
  for (let i = 0; i < samples; i++) pts.push(fromAnomaly(body, (i / samples) * TWO_PI, days));
  return pts;
}

/** Eclíptica (z = norte) → eixos do Three.js (y = cima). */
export const eclipticToScene = ({ x, y, z }) => ({ x, y: z, z: -y });
