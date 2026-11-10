// Elementos orbitais médios (época J2000) — Standish, JPL "Keplerian Elements for
// Approximate Positions of the Major Planets" (1800–2050). Aproximação coplanar.
//   a       semi-eixo maior (UA)
//   e       excentricidade
//   L0      longitude média em J2000 (graus)
//   varpi   longitude do periélio (graus)
//   period  período sideral (dias)
//   radius  raio médio (km)
export const PLANETS = [
  { name: 'Mercúrio', a: 0.38709927, e: 0.20563593, L0: 252.2503235, varpi: 77.45779628, period: 87.969, radius: 2439.7, color: '#b5b5b5' },
  { name: 'Vênus', a: 0.72333566, e: 0.00677672, L0: 181.9790995, varpi: 131.60246718, period: 224.701, radius: 6051.8, color: '#e8c98a' },
  { name: 'Terra', a: 1.00000261, e: 0.01671123, L0: 100.46457166, varpi: 102.93768193, period: 365.256, radius: 6371.0, color: '#4f9dff' },
  { name: 'Marte', a: 1.52371034, e: 0.0933941, L0: -4.55343205, varpi: -23.94362959, period: 686.98, radius: 3389.5, color: '#d9603b' },
  { name: 'Júpiter', a: 5.202887, e: 0.04838624, L0: 34.39644051, varpi: 14.72847983, period: 4332.589, radius: 69911, color: '#d8b48a' },
  { name: 'Saturno', a: 9.53667594, e: 0.05386179, L0: 49.95424423, varpi: 92.59887831, period: 10759.22, radius: 58232, color: '#ead6a6' },
  { name: 'Urano', a: 19.18916464, e: 0.04725744, L0: 313.23810451, varpi: 170.9542763, period: 30685.4, radius: 25362, color: '#8fe3e8' },
  { name: 'Netuno', a: 30.06992276, e: 0.00859048, L0: -55.12002969, varpi: 44.96476227, period: 60189, radius: 24622, color: '#4b6bff' },
];

export const SUN = { name: 'Sol', radius: 695700, color: '#ffd45e' };
