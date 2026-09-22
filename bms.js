// Playback duration and response latency are separate demonstration values.
const MODELS = {
  ai: { duration: 3000, path: 'aiPath', latencies: [0.05, 0.10, 0.15, 0.20] },
  cloud: { duration: 7000, path: 'baselinePath', latencies: [500, 1000, 1500, 2000] },
};
const PLAYBACK_MS = 7000;
const xAt = ms => 62 + ms / PLAYBACK_MS * 770;
const yAt = percent => 320 - percent / 100 * 260;
const svgNS = 'http://www.w3.org/2000/svg';
const grid = document.getElementById('chartGrid');
function gridElement(tag, attrs, text) {
  const el = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  if (text !== undefined) el.textContent = text;
  grid.appendChild(el);
}
for (let value = 0; value <= 100; value += 25) {
  gridElement('line', { x1: 62, x2: 832, y1: yAt(value), y2: yAt(value) });
  gridElement('text', { x: 48, y: yAt(value) + 5, 'text-anchor': 'end' }, `${value}`);
}
for (let ms = 0; ms <= PLAYBACK_MS; ms += 1000) {
  gridElement('text', { x: xAt(ms), y: 349, 'text-anchor': 'middle' }, `${ms}`);
}
gridElement('text', { x: 62, y: 22 }, 'Outputs ready (%)');
gridElement('text', { x: 832, y: 388, 'text-anchor': 'end' }, 'Playback time (ms)');
let cycleTime = 0;
let playing = true;
let lastFrame = null;
const slider = document.getElementById('cycleTime');
const pause = document.getElementById('pauseCycle');
function modelState(model, time) {
  const elapsed = Math.min(Math.max(0, time), model.duration);
  const progress = elapsed / model.duration;
  const count = Math.min(4, Math.floor(progress * 4));
  return { elapsed, progress, count, latency: count && model.latencies ? model.latencies[count - 1] : 0 };
}
function renderModel(name, model) {
  const state = modelState(model, cycleTime);
  const x = xAt(state.elapsed);
  const y = yAt(state.progress * 100);
  document.getElementById(model.path).setAttribute('d', `M${xAt(0)},${yAt(0)} L${x},${y}`);
  document.getElementById(`${name}Count`).textContent = `${state.count} / 4`;
  document.getElementById(`${name}Output`).textContent = state.count ? '90.0% SoC' : 'Pending';
  document.getElementById(`${name}Marker`).setAttribute('transform', `translate(${x},${y})`);
  const labelWidth = name === 'ai' ? 142 : 174;
  const tagX = x + labelWidth + 16 > 860 ? -labelWidth - 12 : 12;
  document.getElementById(`${name}Tag`).setAttribute('transform', `translate(${tagX},${name === 'ai' ? -42 : y > 280 ? -80 : 12})`);
  const label = name === 'ai' ? `${state.latency.toFixed(2)} ms` : `${state.latency} ms · ${(state.latency / 1000).toFixed(1)} s`;
  document.getElementById(`${name}TagText`).textContent = label;
  document.getElementById(`${name}Latency`).textContent = state.count ? label : 'Pending';
}
function renderCycle() {
  for (const [name, model] of Object.entries(MODELS)) renderModel(name, model);
  document.getElementById('cycleTimeLabel').textContent = `${Math.round(cycleTime)} / ${PLAYBACK_MS} ms`;
  slider.value = cycleTime;
  slider.setAttribute('aria-valuetext', `${Math.round(cycleTime)} milliseconds of visual playback`);
  pause.textContent = playing ? 'Pause' : cycleTime >= PLAYBACK_MS ? 'Complete' : 'Resume';
  pause.disabled = cycleTime >= PLAYBACK_MS;
}
function frame(now) {
  if (lastFrame !== null && playing && !document.hidden) {
    cycleTime = Math.min(PLAYBACK_MS, cycleTime + now - lastFrame);
    if (cycleTime >= PLAYBACK_MS) playing = false;
    renderCycle();
  }
  lastFrame = now;
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { lastFrame = null; });
pause.addEventListener('click', () => { playing = !playing; lastFrame = null; renderCycle(); });
document.getElementById('replayCycle').addEventListener('click', () => { cycleTime = 0; playing = true; lastFrame = null; renderCycle(); });
slider.addEventListener('input', () => { cycleTime = Number(slider.value); playing = false; renderCycle(); });
const fullscreen = document.getElementById('fullscreenBtn');
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.textContent = 'Fullscreen unavailable'; }
});
document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen'; });
renderCycle();
requestAnimationFrame(frame);
