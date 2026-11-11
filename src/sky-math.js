// Matemática do céu (pura, sem DOM) — testável em Node.
import { eclipticToScene } from './orbits.js';

const DEG = Math.PI / 180;
export const OBLIQUITY = 23.4392911 * DEG; // obliquidade da eclíptica em J2000

/** Equatorial J2000 (RA, Dec em graus) → vetor unitário na eclíptica J2000 (z = norte eclíptico). */
export function equatorialToEcliptic(raDeg, decDeg) {
  const a = raDeg * DEG, d = decDeg * DEG;
  const x = Math.cos(d) * Math.cos(a);
  const y = Math.cos(d) * Math.sin(a);
  const z = Math.sin(d);
  const c = Math.cos(OBLIQUITY), s = Math.sin(OBLIQUITY);
  return { x, y: y * c + z * s, z: -y * s + z * c };
}

/** RA/Dec → vetor unitário nos eixos da cena (y = norte eclíptico). */
export const equatorialToScene = (raDeg, decDeg) => eclipticToScene(equatorialToEcliptic(raDeg, decDeg));

/** Índice de cor B–V → temperatura efetiva em K (Ballesteros 2012). */
export const bvToTemperature = (bv) => 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));

/** Temperatura (K) → RGB 0..1, aproximação de corpo negro (Tanner Helland). */
export function temperatureToRgb(kelvin) {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100;
  const clamp = (v) => Math.min(255, Math.max(0, v)) / 255;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [clamp(r), clamp(g), clamp(b)];
}

export const bvToRgb = (bv) => temperatureToRgb(bvToTemperature(Math.min(2, Math.max(-0.4, bv))));

/** Magnitude aparente → tamanho do ponto em px e intensidade 0..1 (mais brilhante = maior). */
export function magToSprite(mag) {
  const k = Math.min(1, Math.max(0, (6.5 - mag) / 8));
  return { size: 2.2 + 6 * k ** 0.8, intensity: 0.6 + 0.4 * k ** 0.5 };
}
