import * as THREE from 'three';
import { equatorialToScene, bvToRgb, magToSprite } from './sky-math.js';

// Céu real: catálogo HYG (estrelas até mag 6,5) + linhas das 88 constelações (d3-celestial).
// Os dados são gerados por scripts/build-sky.py. Esfera de raio R que acompanha a câmera.
export const SKY_RADIUS = 4e5;
const BASE = 'assets/sky/';

// Pontos sem teste/escrita de profundidade e desenhados primeiro (renderOrder), com blend aditivo:
// ficam sempre atrás de planetas e Sol, sem depender do depth buffer logarítmico do resto da cena.
const starMaterial = () => new THREE.ShaderMaterial({
  uniforms: { pixelRatio: { value: 1 } },
  vertexShader: `
    attribute float size; attribute vec3 color; varying vec3 vColor; uniform float pixelRatio;
    void main() { vColor = color; gl_PointSize = size * pixelRatio; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    varying vec3 vColor;
    void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, d); gl_FragColor = vec4(vColor * a, 1.0); }`,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  depthWrite: false,
});

export async function loadSky(pixelRatio = 1) {
  const [stars, cons] = await Promise.all(
    ['stars.json', 'constellations.json'].map((f) => fetch(BASE + f).then((r) => {
      if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
      return r.json();
    })),
  );

  const group = new THREE.Group();

  // Estrelas
  const n = stars.stars.length;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
  stars.stars.forEach(([ra, dec, mag, ci], i) => {
    const v = equatorialToScene(ra, dec);
    pos.set([v.x * SKY_RADIUS, v.y * SKY_RADIUS, v.z * SKY_RADIUS], i * 3);
    const [r, g, b] = bvToRgb(ci);
    const { size: s, intensity } = magToSprite(mag);
    col.set([r * intensity, g * intensity, b * intensity], i * 3);
    size[i] = s;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const material = starMaterial();
  material.uniforms.pixelRatio.value = pixelRatio;
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.renderOrder = -1000;
  group.add(points);

  // Constelações: segmentos entre estrelas consecutivas de cada polilinha
  const seg = [];
  const r = SKY_RADIUS * 0.999;
  for (const c of cons.constellations) {
    for (const line of c.lines) {
      for (let i = 0; i < line.length - 1; i++) {
        const a = equatorialToScene(...line[i]), b = equatorialToScene(...line[i + 1]);
        seg.push(a.x * r, a.y * r, a.z * r, b.x * r, b.y * r, b.z * r);
      }
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x24406e, depthTest: false, depthWrite: false }));
  lines.frustumCulled = false;
  lines.renderOrder = -999;
  group.add(lines);

  // Rótulos (direção unitária na cena + texto)
  const dir = (ra, dec) => { const v = equatorialToScene(ra, dec); return new THREE.Vector3(v.x, v.y, v.z); };
  const constellationLabels = cons.constellations.filter((c) => c.label).map((c) => ({ dir: dir(...c.label), text: c.name }));
  const starLabels = stars.named.map(([ra, dec, , name]) => ({ dir: dir(ra, dec), text: name }));

  return { group, lines, points, constellationLabels, starLabels, count: n };
}
