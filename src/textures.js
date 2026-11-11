import * as THREE from 'three';
import { applyTextures } from './texture-loader.js';

// Texturas procedurais (sem assets): só o suficiente para a rotação ser visível.
// Gerador pseudoaleatório determinístico (mulberry32) — mesma textura a cada carga.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shade = (hex, amt) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return `#${c.getHexString()}`;
};

export function makeTexture(def) {
  const W = 1024, H = 512;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const rand = rng([...def.id].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7));

  g.fillStyle = def.color;
  g.fillRect(0, 0, W, H);

  const blotches = (n, rMin, rMax, colorFn, alpha) => {
    for (let i = 0; i < n; i++) {
      g.globalAlpha = alpha;
      g.fillStyle = colorFn();
      g.beginPath();
      g.ellipse(rand() * W, rand() * H, rMin + rand() * (rMax - rMin), (rMin + rand() * (rMax - rMin)) * 0.7, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  };

  switch (def.kind) {
    case 'bands': {
      for (let y = 0; y < H; ) {
        const h = 6 + rand() * 26;
        g.fillStyle = shade(def.color, (rand() - 0.5) * 0.16);
        g.fillRect(0, y, W, h);
        y += h;
      }
      break;
    }
    case 'clouds':
      blotches(90, 20, 90, () => shade(def.color, (rand() - 0.5) * 0.1), 0.25);
      break;
    case 'earth':
      blotches(26, 30, 110, () => (rand() > 0.35 ? '#3c8a47' : '#b9a16a'), 0.95); // continentes
      blotches(50, 15, 60, () => '#ffffff', 0.35); // nuvens
      g.fillStyle = '#f2f6fb';
      g.fillRect(0, 0, W, 22);
      g.fillRect(0, H - 30, W, 30); // gelo polar
      break;
    case 'sun':
      blotches(160, 8, 40, () => shade(def.color, (rand() - 0.5) * 0.25), 0.4);
      break;
    default: // rock
      blotches(160, 4, 32, () => shade(def.color, (rand() - 0.5) * 0.28), 0.5);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeStars(count = 4000, radius = 4e5) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const rand = rng(1234);
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([radius * s * Math.cos(th), radius * u, radius * s * Math.sin(th)], i * 3);
    const b = 0.45 + rand() * 0.55, warm = rand();
    col.set([b, b * (0.9 + warm * 0.1), b * (0.8 + (1 - warm) * 0.2)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, depthWrite: false, fog: false }),
  );
}

// Textura radial dos anéis de Saturno (u = 0 borda interna → 1 externa).
// Limites aproximados (km): C 74.658–92.000 · B 92.000–117.580 · Cassini ~117.580–122.170 · A 122.170–136.775 · F ~140.180.
export function makeRingTexture(inner, outer) {
  const W = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = 1;
  const g = cv.getContext('2d');
  const u = (km) => ((km - inner) / (outer - inner)) * W;
  const seg = (a, b, alpha, shadeAmt = 0) => {
    g.fillStyle = `rgba(${215 + shadeAmt}, ${195 + shadeAmt}, ${150 + shadeAmt}, ${alpha})`;
    g.fillRect(u(a), 0, u(b) - u(a), 1);
  };
  const rand = rng(99);
  seg(74500, 74658, 0.06);
  for (let km = 74658; km < 92000; km += 600) seg(km, km + 600, 0.2 + rand() * 0.12);
  for (let km = 92000; km < 117580; km += 500) seg(km, km + 500, 0.78 + rand() * 0.2, 10);
  seg(117580, 122170, 0.05);
  for (let km = 122170; km < 136775; km += 500) seg(km, km + 500, 0.55 + rand() * 0.15, 5);
  g.clearRect(u(133400), 0, u(133700) - u(133400), 1); // divisão de Encke
  seg(140100, 140220, 0.4); // anel F
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Texturas reais (opcionais): se o arquivo existir em assets/textures/, substitui a procedural.
// Nomes seguem o pacote "Solar System Scope" (CC BY 4.0, baseado em dados da NASA) — ver assets/textures/README.md.
const TEX_BASE = 'assets/textures/';
export const TEXTURE_FILES = {
  sol: '2k_sun.jpg', mercurio: '2k_mercury.jpg', venus: '2k_venus_atmosphere.jpg', terra: '2k_earth_daymap.jpg',
  lua: '2k_moon.jpg', marte: '2k_mars.jpg', jupiter: '2k_jupiter.jpg', saturno: '2k_saturn.jpg',
  urano: '2k_uranus.jpg', netuno: '2k_neptune.jpg',
};
export const RING_FILE = '2k_saturn_ring_alpha.png';

export async function loadRealTextures(bodies, maxAnisotropy = 4) {
  const loader = new THREE.TextureLoader();
  const exists = async (f) => { try { return (await fetch(TEX_BASE + f, { method: 'HEAD' })).ok; } catch { return false; } };
  const load = async (f) => {
    const tex = await loader.loadAsync(TEX_BASE + f);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    return tex;
  };
  const targets = [];
  for (const b of bodies) {
    const f = TEXTURE_FILES[b.def.id];
    if (f) targets.push({ key: b.def.id, file: f, apply: (tex) => { b.mesh.material.map = tex; b.mesh.material.needsUpdate = true; } });
    if (b.ring) targets.push({ key: `${b.def.id}-aneis`, file: RING_FILE, apply: (tex) => { b.ring.material.map = tex; b.ring.material.needsUpdate = true; } });
  }
  return applyTextures(targets, { exists, load });
}
