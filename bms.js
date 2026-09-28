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

const cellSamples = [
  { c10: { voltage: 3.6, temperature: 38.5, current: 40.2, soc: 64.3 }, c12: { voltage: 3.4, temperature: 38.6, current: 37.6, soc: 59.3 } },
  { c10: { voltage: 3.6, temperature: 36.5, current: 38.1, soc: 59.3 }, c12: { voltage: 3.3, temperature: 40.6, current: 37.1, soc: 54.3 } },
  { c10: { voltage: 3.5, temperature: 34.5, current: 36.5, soc: 54.3 }, c12: { voltage: 3.5, temperature: 42.6, current: 36.6, soc: 49.3 } },
  { c10: { voltage: 3.7, temperature: 34.7, current: 33.9, soc: 74.3 }, c12: { voltage: 3.4, temperature: 44.6, current: 36.1, soc: 44.3 } },
  { c10: { voltage: 3.6, temperature: 34.5, current: 36.9, soc: 94.3 }, c12: { voltage: 3.2, temperature: 46.6, current: 35.6, soc: 39.3 } },
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
    fields.soc.textContent = `${data.soc.toFixed(1)}%`;
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
