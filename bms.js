const fullscreen = document.getElementById('fullscreenBtn');

fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    fullscreen.textContent = 'Fullscreen unavailable';
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
});

// Synchronized demo snapshots. The first pair reproduces the supplied reference;
// later pairs illustrate both cells discharging together without implying bench data.
const cellSamples = [
  { c10: { voltage: 3.6, temperature: 41.3, current: 37.6, soc: 87 }, c12: { voltage: 3.7, temperature: 43.0, current: 38.2, soc: 90 } },
  { c10: { voltage: 3.6, temperature: 41.4, current: 37.4, soc: 86.4 }, c12: { voltage: 3.7, temperature: 43.1, current: 38.0, soc: 89.4 } },
  { c10: { voltage: 3.6, temperature: 41.6, current: 37.2, soc: 85.9 }, c12: { voltage: 3.7, temperature: 43.3, current: 37.8, soc: 88.9 } },
  { c10: { voltage: 3.5, temperature: 41.7, current: 37.1, soc: 85.3 }, c12: { voltage: 3.6, temperature: 43.4, current: 37.7, soc: 88.3 } },
  { c10: { voltage: 3.5, temperature: 41.9, current: 36.9, soc: 84.8 }, c12: { voltage: 3.6, temperature: 43.6, current: 37.5, soc: 87.8 } },
];

const cellFields = Object.fromEntries(['c10', 'c12'].map(name => [name, {
  sample: document.getElementById(`${name}Sample`),
  voltage: document.getElementById(`${name}Voltage`),
  temperature: document.getElementById(`${name}Temperature`),
  current: document.getElementById(`${name}Current`),
  soc: document.getElementById(`${name}Soc`),
  battery: document.getElementById(`${name}Battery`),
  batteryLevel: document.getElementById(`${name}BatteryLevel`),
}]));
const cellSpread = document.getElementById('cellSpread');
const rotationToggle = document.getElementById('toggleCellRotation');
const CELL_SAMPLE_DURATION_MS = 4000;
let activeCellSample = 0;

function showCellSample(index) {
  const sample = cellSamples[index];
  for (const name of ['c10', 'c12']) {
    const data = sample[name];
    const fields = cellFields[name];
    fields.sample.textContent = `Sample ${String(index + 1).padStart(2, '0')} / 05`;
    fields.voltage.textContent = data.voltage.toFixed(1);
    fields.temperature.textContent = data.temperature.toFixed(1);
    fields.current.textContent = data.current.toFixed(1);
    fields.soc.textContent = `${Number.isInteger(data.soc) ? data.soc : data.soc.toFixed(1)}%`;
    fields.battery.setAttribute('aria-valuenow', data.soc.toFixed(1));
    fields.batteryLevel.style.transform = `scaleX(${data.soc / 100})`;
  }
  cellSpread.textContent = `${Math.abs(sample.c10.voltage - sample.c12.voltage).toFixed(2)} V`;
}

function advanceCellSample() {
  activeCellSample = (activeCellSample + 1) % cellSamples.length;
  showCellSample(activeCellSample);
}

showCellSample(activeCellSample);
let cellRotationTimer = setInterval(advanceCellSample, CELL_SAMPLE_DURATION_MS);

rotationToggle.addEventListener('click', () => {
  const paused = cellRotationTimer !== null;
  if (paused) {
    clearInterval(cellRotationTimer);
    cellRotationTimer = null;
  } else {
    cellRotationTimer = setInterval(advanceCellSample, CELL_SAMPLE_DURATION_MS);
  }
  rotationToggle.textContent = paused ? 'Resume rotation' : 'Pause rotation';
  rotationToggle.setAttribute('aria-pressed', String(paused));
});
