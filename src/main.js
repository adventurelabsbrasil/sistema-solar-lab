import { PLANETS, SUN } from './data/planets.js';
import { position, orbitPath, daysSinceJ2000, dateFromDays, LIGHT_MIN_PER_AU } from './orbits.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);

const state = {
  days: daysSinceJ2000(new Date()),
  speed: 10 ** 1.5, // dias simulados por segundo real
  paused: false,
  scale: 'sqrt',
  selected: null,
};

const MAX_AU = 31;
let W = 0, H = 0, dpr = 1;

function resize() {
  dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Converte UA (x,y) para pixels, aplicando a escala radial escolhida.
function project({ x, y, r }) {
  const half = Math.min(W, H) / 2 - 30;
  const k = r === 0 ? 0 : state.scale === 'sqrt' ? Math.sqrt(r / MAX_AU) / (r / MAX_AU) : 1;
  const f = (half / MAX_AU) * (state.scale === 'sqrt' ? k : 1);
  return { px: W / 2 + x * f, py: H / 2 - y * f };
}

const paths = PLANETS.map((p) => orbitPath(p));
const screenPos = new Map();

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.lineWidth = 1;
  PLANETS.forEach((p, i) => {
    ctx.strokeStyle = p === state.selected ? '#5d7bd6' : '#1c2540';
    ctx.beginPath();
    paths[i].forEach((pt, j) => {
      const { px, py } = project(pt);
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.stroke();
  });

  ctx.fillStyle = SUN.color;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '11px system-ui';
  for (const p of PLANETS) {
    const pos = position(p, state.days);
    const { px, py } = project(pos);
    screenPos.set(p, { px, py, r: pos.r });
    const size = 3 + Math.log10(p.radius / 2000) * 3;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    if (p === state.selected) {
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, size + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#9fb0d0';
    ctx.fillText(p.name, px + size + 4, py + 4);
  }
}

function updateInfo() {
  const p = state.selected;
  if (!p) return;
  const r = screenPos.get(p)?.r ?? 0;
  $('info').innerHTML =
    `<b>${p.name}</b><br>` +
    `Distância ao Sol agora: ${r.toFixed(3)} UA (${(r * LIGHT_MIN_PER_AU).toFixed(1)} min-luz)<br>` +
    `Semi-eixo maior: ${p.a.toFixed(3)} UA · excentricidade: ${p.e.toFixed(4)}<br>` +
    `Periélio ${(p.a * (1 - p.e)).toFixed(3)} UA · afélio ${(p.a * (1 + p.e)).toFixed(3)} UA<br>` +
    `Período: ${p.period.toLocaleString('pt-BR')} dias (${(p.period / 365.256).toFixed(2)} anos)<br>` +
    `Raio: ${p.radius.toLocaleString('pt-BR')} km`;
}

function updateUi() {
  $('date').textContent = dateFromDays(state.days).toISOString().slice(0, 10);
  const s = state.speed;
  $('speedLabel').textContent = s < 1 ? `${s.toFixed(2)} d/s` : s < 365 ? `${s.toFixed(0)} d/s` : `${(s / 365.256).toFixed(1)} anos/s`;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (!state.paused) state.days += state.speed * dt;
  draw();
  updateUi();
  updateInfo();
  requestAnimationFrame(frame);
}

$('play').addEventListener('click', () => {
  state.paused = !state.paused;
  $('play').textContent = state.paused ? 'Continuar' : 'Pausar';
});
$('now').addEventListener('click', () => { state.days = daysSinceJ2000(new Date()); });
$('speed').addEventListener('input', (e) => { state.speed = 10 ** Number(e.target.value); });
$('scale').addEventListener('change', (e) => { state.scale = e.target.value; });
canvas.addEventListener('click', (e) => {
  let best = null, bestD = 18;
  for (const [p, { px, py }] of screenPos) {
    const d = Math.hypot(px - e.clientX, py - e.clientY);
    if (d < bestD) { best = p; bestD = d; }
  }
  state.selected = best;
  if (!best) $('info').textContent = 'Clique num planeta para ver os dados.';
});

requestAnimationFrame(frame);
