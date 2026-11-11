// Elementos orbitais médios (época J2000) — Standish, JPL "Keplerian Elements for
// Approximate Positions of the Major Planets" (1800–2050), Tabela 1. Só a taxa da longitude média
// (Ldot) é usada; as demais taxas seculares são ignoradas.
//   a        semi-eixo maior (UA)         e      excentricidade
//   I        inclinação à eclíptica (°)   Omega  longitude do nó ascendente (°)
//   L0       longitude média J2000 (°)    varpi  longitude do periélio (°)
//   period   período sideral (dias, só exibição)   Ldot  taxa da longitude média (°/século) usada na propagação
//   dVarpi/dOmega  precessão (°/dia, opcional; só a Lua)
//   radius   raio médio (km)              rotHours  período de rotação (h)
//   tilt     obliquidade do eixo (°; >90 = rotação retrógrada)
export const AU_KM = 149597870.7;

export const SUN = {
  id: 'sol', name: 'Sol', radius: 695700, color: '#ffcf5a', kind: 'sun',
  rotHours: 609.12, tilt: 7.25,
};

export const PLANETS = [
  { id: 'mercurio', Ldot: 149472.67411175, name: 'Mercúrio', a: 0.38709927, e: 0.20563593, I: 7.00497902, Omega: 48.33076593, L0: 252.2503235, varpi: 77.45779628, period: 87.969, radius: 2439.7, color: '#a8a39c', kind: 'rock', rotHours: 1407.6, tilt: 0.03 },
  { id: 'venus', Ldot: 58517.81538729, name: 'Vênus', a: 0.72333566, e: 0.00677672, I: 3.39467605, Omega: 76.67984255, L0: 181.9790995, varpi: 131.60246718, period: 224.701, radius: 6051.8, color: '#e3c78f', kind: 'clouds', rotHours: 5832.5, tilt: 177.36 },
  { id: 'terra', Ldot: 35999.37244981, name: 'Terra', a: 1.00000261, e: 0.01671123, I: -0.00001531, Omega: 0.0, L0: 100.46457166, varpi: 102.93768193, period: 365.256, radius: 6371.0, color: '#2f6fd6', kind: 'earth', rotHours: 23.934, tilt: 23.44 },
  { id: 'marte', Ldot: 19140.30268499, name: 'Marte', a: 1.52371034, e: 0.0933941, I: 1.84969142, Omega: 49.55953891, L0: -4.55343205, varpi: -23.94362959, period: 686.98, radius: 3389.5, color: '#c4623a', kind: 'rock', rotHours: 24.623, tilt: 25.19 },
  { id: 'jupiter', Ldot: 3034.74612775, name: 'Júpiter', a: 5.202887, e: 0.04838624, I: 1.30439695, Omega: 100.47390909, L0: 34.39644051, varpi: 14.72847983, period: 4332.589, radius: 69911, color: '#c9a77c', kind: 'bands', rotHours: 9.925, tilt: 3.13 },
  { id: 'saturno', Ldot: 1222.49362201, name: 'Saturno', a: 9.53667594, e: 0.05386179, I: 2.48599187, Omega: 113.66242448, L0: 49.95424423, varpi: 92.59887831, period: 10759.22, radius: 58232, color: '#e2cf9c', kind: 'bands', rotHours: 10.656, tilt: 26.73 },
  { id: 'urano', Ldot: 428.48202785, name: 'Urano', a: 19.18916464, e: 0.04725744, I: 0.77263783, Omega: 74.01692503, L0: 313.23810451, varpi: 170.9542763, period: 30685.4, radius: 25362, color: '#8fdde3', kind: 'clouds', rotHours: 17.24, tilt: 97.77 },
  { id: 'netuno', Ldot: 218.45945325, name: 'Netuno', a: 30.06992276, e: 0.00859048, I: 1.77004347, Omega: 131.78422574, L0: -55.12002969, varpi: 44.96476227, period: 60189, radius: 24622, color: '#3f5fe0', kind: 'bands', rotHours: 16.11, tilt: 28.32 },
];

// Lua: elementos geocêntricos. Longitude média, perigeu e nó (com as taxas) de Simon et al. 1994,
// A&A 282, 663, §3.4 (b.1) — eclíptica e equinócio J2000, como o resto do modelo; só termos lineares.
// a, e, I, raio, rotação e obliquidade da NASA Moon Fact Sheet (o ⟨a⟩ osculador de Simon subestima a
// distância média em ~1 000 km). Nó regride ~18,6 anos, perigeu avança ~8,85 anos.
const ARCSEC_CY_TO_DEG_DAY = 1 / 3600 / 36525;
export const MOON = {
  id: 'lua', name: 'Lua', parent: 'terra',
  a: 384400 / AU_KM, e: 0.0549, I: 5.145, Omega: 125.04455501, L0: 218.31664563, varpi: 83.35324312,
  Ldot: 1732559343.4847 / 3600, period: 27.3217,
  dVarpi: 14643420.2669 * ARCSEC_CY_TO_DEG_DAY, dOmega: -6967919.3631 * ARCSEC_CY_TO_DEG_DAY,
  radius: 1737.4, color: '#b9b6b0', kind: 'rock', rotHours: 655.72, tilt: 6.68,
};

// Anéis de Saturno (km do centro do planeta): borda interna do anel D até a externa do anel A/F.
export const RINGS = { saturno: { inner: 74500, outer: 140220, color: '#cdb98f' } };
