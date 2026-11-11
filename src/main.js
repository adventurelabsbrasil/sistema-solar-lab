import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SUN, PLANETS, MOON, RINGS, AU_KM } from './data/bodies.js';
import { position, orbitPath, daysSinceJ2000, dateFromDays, eclipticToScene, clampDays, parseUtc, LIGHT_MIN_PER_AU } from './orbits.js';
import { makeTexture, makeStars, makeRingTexture, loadRealTextures } from './textures.js';
import { loadSky, SKY_RADIUS } from './sky.js';
import { equatorialToScene } from './sky-math.js';

const $ = (id) => document.getElementById(id);

// 1 unidade de cena = 1 milhão de km. Tudo em escala real (distâncias e raios).
const UNIT_KM = 1e6;
const AU_U = AU_KM / UNIT_KM;
const MIN_ALT = 1.002; // zoom mínimo: 0,2% do raio acima da superfície (~13 km na Terra)

// ── Estado ────────────────────────────────────────────────────────────────────
const RATES = [
  ['1 segundo / s (tempo real)', 1 / 86400],
  ['1 minuto / s', 1 / 1440],
  ['1 hora / s', 1 / 24],
  ['1 dia / s', 1],
  ['10 dias / s', 10],
  ['1 mês / s', 30.4375],
  ['1 ano / s', 365.25],
  ['10 anos / s', 3652.5],
  ['100 anos / s', 36525],
];
const state = {
  days: daysSinceJ2000(new Date()),
  rate: 1, // dias simulados por segundo real (módulo)
  dir: 1, // +1 avança, -1 retrocede
  paused: false,
  exag: 1, // ampliação dos planetas/Lua (Sol sempre 1:1)
};

// ── Cena ──────────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
// Céu: estrelas procedurais como fallback até (e se) o catálogo real carregar.
const fallbackStars = makeStars();
scene.add(fallbackStars);
let sky = null;
const skyLabels = []; // { el, dir, kind }

// Origem flutuante: `world` é deslocado a cada quadro para que o ponto focado fique em (0,0,0).
// Evita jitter de float32 a bilhões de km do Sol.
const world = new THREE.Group();
scene.add(world);

const camera = new THREE.PerspectiveCamera(50, 1, 1e-6, 1e6);
camera.position.set(0, 0.02, 0.06);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomSpeed = 1.6;
controls.minDistance = 1e-5;
controls.maxDistance = 3e4;

world.add(new THREE.PointLight(0xffffff, 3.2, 0, 0)); // luz do Sol (na origem do `world`)
scene.add(new THREE.AmbientLight(0xffffff, 0.07));

// ── Corpos ────────────────────────────────────────────────────────────────────
const labelsEl = $('labels');
const bodies = [];
const byId = {};

function makeBody(def) {
  const anchor = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = THREE.MathUtils.degToRad(def.tilt);
  const mat = def.kind === 'sun'
    ? new THREE.MeshBasicMaterial({ map: makeTexture(def) })
    : new THREE.MeshStandardMaterial({ map: makeTexture(def), roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), mat);
  tilt.add(mesh);

  let ring = null;
  const r = RINGS[def.id];
  if (r) {
    const geo = new THREE.RingGeometry(r.inner / UNIT_KM, r.outer / UNIT_KM, 192);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { // UV radial: u = fração entre borda interna e externa
      uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) - r.inner / UNIT_KM) / ((r.outer - r.inner) / UNIT_KM), 0.5);
    }
    ring = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ map: makeRingTexture(r.inner, r.outer), side: THREE.DoubleSide, transparent: true, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    tilt.add(ring);
  }
  anchor.add(tilt);
  world.add(anchor);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = def.name;
  label.addEventListener('click', () => focusOn(body));
  labelsEl.appendChild(label);

  const body = { def, anchor, tilt, mesh, ring, label, pos: new THREE.Vector3(), orbit: null };
  bodies.push(body);
  byId[def.id] = body;
  return body;
}

function makeOrbitLine(def, parent) {
  const pts = orbitPath(def, 360).map((p) => {
    const s = eclipticToScene(p);
    return new THREE.Vector3(s.x * AU_U, s.y * AU_U, s.z * AU_U); // UA → unidades de cena
  });
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: def === MOON ? 0x6b7aa8 : 0x3a4a78, transparent: true, opacity: 0.85 }),
  );
  parent.add(line);
  return line;
}

makeBody(SUN);
PLANETS.forEach((p) => { makeBody(p).orbit = makeOrbitLine(p, world); });
makeBody(MOON).orbit = makeOrbitLine(MOON, world);

const scaleOf = (b) => (b.def === SUN ? 1 : state.exag);
const radiusU = (b) => (b.def.radius / UNIT_KM) * scaleOf(b);

function updateBodies() {
  for (const b of bodies) {
    const d = b.def;
    if (d === SUN) b.pos.set(0, 0, 0);
    else if (d === MOON) {
      const s = eclipticToScene(position(d, state.days));
      b.pos.set(s.x, s.y, s.z).multiplyScalar(AU_U).add(byId.terra.pos);
    } else {
      const s = eclipticToScene(position(d, state.days));
      b.pos.set(s.x, s.y, s.z).multiplyScalar(AU_U);
    }
    b.anchor.position.copy(b.pos);
    b.mesh.scale.setScalar(radiusU(b));
    if (b.ring) b.ring.scale.setScalar(scaleOf(b));
    b.mesh.rotation.y = ((state.days * 24) / d.rotHours) * Math.PI * 2;
    if (d === MOON) {
      b.orbit.position.copy(byId.terra.pos);
      const arr = b.orbit.geometry.attributes.position; // nó e perigeu da Lua precessionam: redesenha a elipse no instante atual
      orbitPath(d, arr.count, state.days).forEach((p, i) => {
        const s = eclipticToScene(p);
        arr.setXYZ(i, s.x * AU_U, s.y * AU_U, s.z * AU_U);
      });
      arr.needsUpdate = true;
      b.orbit.geometry.computeBoundingSphere();
    }
    else if (b.orbit) b.orbit.position.set(0, 0, 0);
  }
}

// ── Foco / voo ────────────────────────────────────────────────────────────────
const view = { body: byId.terra, center: new THREE.Vector3() };
let transition = null;
const ease = (t) => t * t * (3 - 2 * t);

function focusOn(body, distance) {
  const toDist = distance ?? Math.max(radiusU(body) * 4, 1e-4);
  controls.minDistance = 1e-6;
  transition = {
    t0: performance.now(),
    dur: 2400,
    from: view.center.clone(),
    fromDist: camera.position.length(),
    toDist,
    minDist: radiusU(body) * MIN_ALT,
  };
  view.body = body;
  for (const b of bodies) b.label.classList.toggle('focus', b === body);
}

function overview() {
  focusOn(byId.sol, 9000);
}

function applyView() {
  const target = view.body.pos;
  let dist = camera.position.length();
  if (transition) {
    const p = Math.min((performance.now() - transition.t0) / transition.dur, 1);
    const k = ease(p);
    view.center.lerpVectors(transition.from, target, k);
    dist = transition.fromDist * (transition.toDist / transition.fromDist) ** k; // interpolação geométrica
    camera.position.setLength(dist);
    if (p >= 1) {
      controls.minDistance = transition.minDist;
      transition = null;
    }
  } else {
    view.center.copy(target);
  }
  world.position.copy(view.center).negate();
}

// ── UI ────────────────────────────────────────────────────────────────────────
const goto = $('goto');
const addBtn = (text, fn) => {
  const b = document.createElement('button');
  b.textContent = text;
  b.addEventListener('click', fn);
  goto.appendChild(b);
};
addBtn('Visão geral', overview);
for (const b of bodies) addBtn(b.def.name, () => focusOn(b));

RATES.forEach(([text, v]) => {
  const o = document.createElement('option');
  o.value = String(v);
  o.textContent = text;
  if (v === 1) o.selected = true;
  $('rate').appendChild(o);
});
$('rate').addEventListener('change', (e) => { state.rate = Number(e.target.value); });

const setDir = (dir) => {
  state.dir = dir;
  state.paused = false;
  syncButtons();
};
function syncButtons() {
  $('play').textContent = state.paused ? '▶' : '⏸';
  $('rev').classList.toggle('on', !state.paused && state.dir < 0);
  $('fwd').classList.toggle('on', !state.paused && state.dir > 0);
}
$('rev').addEventListener('click', () => setDir(-1));
$('fwd').addEventListener('click', () => setDir(1));
$('play').addEventListener('click', () => { state.paused = !state.paused; syncButtons(); });
$('now').addEventListener('click', () => { state.days = daysSinceJ2000(new Date()); });
$('jump').addEventListener('change', (e) => {
  const t = parseUtc(e.target.value);
  if (!Number.isNaN(t)) state.days = clampDays(daysSinceJ2000(new Date(t)));
});
$('exag').addEventListener('change', (e) => {
  state.exag = Number(e.target.value);
  if (!transition) controls.minDistance = radiusU(view.body) * MIN_ALT;
});
$('showOrbits').addEventListener('change', (e) => { for (const b of bodies) if (b.orbit) b.orbit.visible = e.target.checked; });
$('showConst').addEventListener('change', (e) => { if (sky) sky.lines.visible = e.target.checked; });
$('showLabels').addEventListener('change', (e) => { labelsEl.style.display = e.target.checked ? '' : 'none'; });
$('panel').addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') e.target.blur(); });
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) {
    e.preventDefault();
    state.paused = !state.paused;
    syncButtons();
  }
});

const nf = (n, d = 0) => n.toLocaleString('pt-BR', { maximumFractionDigits: d });
function fmtKm(km) {
  if (km < 1e7) return `${nf(km)} km`;
  const au = km / AU_KM;
  return `${nf(au, au < 10 ? 3 : 2)} UA (${nf(km / 1e6, 0)} mi km)`;
}

function updateInfo() {
  const b = view.body, d = b.def;
  const sunDistKm = b.pos.length() * UNIT_KM;
  const camKm = camera.position.length() * UNIT_KM;
  const lines = [`<b>${d.name}</b>`];
  lines.push(`Raio: ${nf(d.radius, 1)} km (${nf(d.radius / 6371, 2)}× Terra)`);
  if (d !== SUN) {
    const rel = d === MOON ? byId.terra.pos.distanceTo(b.pos) * UNIT_KM : sunDistKm;
    lines.push(`${d === MOON ? 'Distância à Terra' : 'Distância ao Sol'}: ${fmtKm(rel)}`);
    if (d !== MOON) lines.push(`Luz do Sol leva ${nf((sunDistKm / AU_KM) * LIGHT_MIN_PER_AU, 1)} min`);
    lines.push(`Órbita: ${nf(d.period, 1)} dias${d.period > 700 ? ` (${nf(d.period / 365.256, 1)} anos)` : ''} · e = ${d.e.toFixed(4)} · i = ${(Math.round(d.I * 100) / 100 + 0).toFixed(2)}°`);
    // Proporção didática: se este corpo tivesse 1 cm de raio, onde estaria o Sol?
    const sunAtM = ((d === MOON ? byId.terra.pos.distanceTo(b.pos) : b.pos.length()) * UNIT_KM / d.radius) / 100;
    lines.push(`Em escala: com ${d.name === 'Lua' ? 'a Lua' : 'este corpo'} de 1 cm de raio, ${d === MOON ? 'a Terra' : 'o Sol'} ficaria a ${nf(sunAtM, sunAtM < 10 ? 1 : 0)} m`);
  }
  lines.push(`Rotação: ${nf(d.rotHours, 1)} h · obliquidade ${d.tilt}°`);
  lines.push(`<span style="color:#7f90b3">Câmera a ${fmtKm(camKm)} do centro</span>`);
  $('info').innerHTML = lines.join('<br>');
}

// ── Loop ──────────────────────────────────────────────────────────────────────
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const tmp = new THREE.Vector3();
function updateSkyLabels() {
  const w = window.innerWidth, h = window.innerHeight;
  for (const l of skyLabels) {
    if (!l.on()) { if (l.shown) { l.el.style.display = 'none'; l.shown = false; } continue; }
    tmp.copy(l.dir).multiplyScalar(SKY_RADIUS).add(camera.position).project(camera);
    const hide = tmp.z > 1 || tmp.z < -1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05;
    if (hide) { if (l.shown) { l.el.style.display = 'none'; l.shown = false; } continue; }
    l.el.style.display = '';
    l.shown = true;
    l.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
  }
}

function updateLabels() {
  updateSkyLabels();
  if (labelsEl.style.display === 'none') return;
  const w = window.innerWidth, h = window.innerHeight;
  const moonVisible = view.body === byId.terra || view.body === byId.lua;
  for (const b of bodies) {
    tmp.copy(b.pos).add(world.position).project(camera);
    const hide = tmp.z > 1 || tmp.z < -1 || (b.def === MOON && !moonVisible);
    b.label.style.display = hide ? 'none' : '';
    if (!hide) b.label.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w + 8}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translateY(-50%)`;
  }
}

let last = performance.now();
let frameNo = 0;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (!state.paused) {
    state.days = clampDays(state.days + state.dir * state.rate * dt);
  }
  updateBodies();
  applyView();
  controls.update();
  (sky?.group ?? fallbackStars).position.copy(camera.position);
  renderer.render(scene, camera);
  updateLabels();

  if (frameNo++ % 6 === 0) {
    $('date').textContent = dateFromDays(state.days).toISOString().replace('T', ' ').slice(0, 19);
    updateInfo();
  }
  if (frameNo % 30 === 0 && document.activeElement !== $('jump')) {
    $('jump').value = dateFromDays(state.days).toISOString().slice(0, 16);
  }
  requestAnimationFrame(frame);
}

syncButtons();
updateBodies();
view.center.copy(byId.terra.pos);
focusOn(byId.terra, 0.03);

// Links compartilháveis: ?foco=saturno&data=2030-01-01T12:00&dist=0.5 (dist em milhões de km)
const qs = new URLSearchParams(location.search);
if (qs.get('data')) {
  const t = parseUtc(qs.get('data'));
  if (!Number.isNaN(t)) state.days = clampDays(daysSinceJ2000(new Date(t)));
}
if (qs.get('look')) { // ?look=RA,Dec (graus, J2000): aponta a câmera para essa região do céu
  const [ra, dec] = qs.get('look').split(',').map(Number);
  if (Number.isFinite(ra) && Number.isFinite(dec)) {
    const d = equatorialToScene(ra, dec);
    camera.position.set(-d.x, -d.y, -d.z).setLength(camera.position.length());
  }
}
if (qs.get('rate')) { state.paused = qs.get('rate') === '0'; syncButtons(); }
if (qs.get('foco') === 'geral') overview();
else if (byId[qs.get('foco')]) {
  focusOn(byId[qs.get('foco')], qs.get('dist') ? Number(qs.get('dist')) : undefined);
  if (qs.get('instant')) transition.dur = 1;
}
requestAnimationFrame(frame);

const credits = [];
loadSky(renderer.getPixelRatio())
  .then((s) => {
    sky = s;
    scene.remove(fallbackStars);
    scene.add(s.group);
    s.lines.visible = $('showConst').checked;
    const addLabels = (list, cls, on) => list.forEach(({ dir, text }) => {
      const el = document.createElement('div');
      el.className = cls;
      el.textContent = text;
      el.style.display = 'none';
      labelsEl.appendChild(el);
      skyLabels.push({ el, dir, on, shown: false });
    });
    addLabels(s.constellationLabels, 'clabel', () => $('showConst').checked);
    addLabels(s.starLabels, 'slabel', () => $('showStarNames').checked);
    credits.push(`céu real: ${s.count.toLocaleString('pt-BR')} estrelas (HYG v4.1, CC BY-SA 4.0) + constelações (d3-celestial, BSD)`);
    $('credits').textContent = credits.join(' · ');
  })
  .catch((e) => console.warn('Céu real indisponível, usando estrelas procedurais:', e.message));

loadRealTextures(bodies, renderer.capabilities.getMaxAnisotropy())
  .then((found) => {
    credits.push(found.length ? `texturas reais: ${found.length} (Solar System Scope, CC BY 4.0 — dados NASA)` : 'texturas procedurais (veja assets/textures/README.md para usar as reais)');
    $('credits').textContent = credits.join(' · ');
  })
  .catch((e) => console.warn('Texturas reais não carregadas:', e.message));

// Gancho de depuração/teste (smoke headless).
window.__lab = { state, focusOn, byId, camera, overview, get sky() { return sky; } };
