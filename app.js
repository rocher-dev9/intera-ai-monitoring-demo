const heartRateEl = document.getElementById("heartRate");
const respRateEl = document.getElementById("respRate");
const dataHeartRateEl = document.getElementById("dataHeartRate");
const dataRespRateEl = document.getElementById("dataRespRate");
const signalQualityEl = document.getElementById("signalQuality");
const qualityBar = document.getElementById("qualityBar");
const sensorText = document.getElementById("sensorText");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const respirationRate = { value: 15 };

function randomAround(base, variation) {
  const min = base - variation;
  const max = base + variation;
  return Math.round(Math.random() * (max - min) + min);
}

function updateVitals() {
  const heartRate = randomAround(95, 25);
  const signalQuality = randomAround(94, 2);
  const rr = respirationRate.value;

  heartRateEl.textContent = heartRate;
  dataHeartRateEl.textContent = heartRate;
  heartRateEl.classList.toggle("high", heartRate > 100);
  dataHeartRateEl.classList.toggle("high", heartRate > 100);

  respRateEl.textContent = rr;
  dataRespRateEl.textContent = rr;
  respRateEl.classList.toggle("high", rr > 20);
  dataRespRateEl.classList.toggle("high", rr > 20);

  signalQualityEl.textContent = signalQuality;
  qualityBar.style.width = `${signalQuality}%`;

  // Let the demo show the high respiration state after the normal baseline.
  respirationRate.value = Math.min(rr + 1, 22);
}

setInterval(updateVitals, 1400);

const EDGE_DURATION_MS = 3000;
const CLOUD_DURATION_MS = 7000;

function createProcessor(name, duration, target) {
  const nodes = [...document.querySelectorAll(`#${name}Network .node`)];
  return {
    nodes,
    duration,
    target,
    status: document.getElementById(`${name}Status`),
    load: document.getElementById(`${name}LoadFill`),
    progress: document.getElementById(`${name}LoadProgress`),
  };
}

const edgeProcessor = createProcessor("edge", EDGE_DURATION_MS, 90);
const cloudProcessor = createProcessor("cloud", CLOUD_DURATION_MS, 95);

function resetProcessor(processor) {
  processor.load.style.width = "0%";
  processor.progress.setAttribute("aria-valuenow", "0");
  processor.status.textContent = "Processing";
  processor.nodes.forEach(node => node.classList.remove("active"));
}

function renderProcessor(processor, elapsed) {
  const cycleElapsed = elapsed % processor.duration;
  const progress = cycleElapsed / processor.duration;
  const value = Math.round(progress * processor.target);
  processor.load.style.width = `${value}%`;
  processor.progress.setAttribute("aria-valuenow", String(value));
  processor.status.textContent = "Processing";

  const activeIndex = processor.nodes.length
    ? Math.floor(progress * processor.nodes.length) % processor.nodes.length
    : -1;
  processor.nodes.forEach((node, index) => node.classList.toggle("active", index === activeIndex));
}

function animateProcessor(processor) {
  const startedAt = performance.now();
  function frame(now) {
    renderProcessor(processor, Math.max(0, now - startedAt));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "Exit fullscreen";
  } else {
    await document.exitFullscreen();
    fullscreenBtn.textContent = "Fullscreen";
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) fullscreenBtn.textContent = "Fullscreen";
});

updateVitals();
sensorText.textContent = "Signal acquired";
resetProcessor(edgeProcessor);
resetProcessor(cloudProcessor);
animateProcessor(edgeProcessor);
animateProcessor(cloudProcessor);

function redirectLegacyEagle() {
  if (location.hash === "#eagle") location.replace("eagle.html");
}

window.addEventListener("hashchange", redirectLegacyEagle);
redirectLegacyEagle();
