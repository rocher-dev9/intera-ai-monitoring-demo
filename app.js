const heartRateEl = document.getElementById("heartRate");
const respRateEl = document.getElementById("respRate");
const dataHeartRateEl = document.getElementById("dataHeartRate");
const dataRespRateEl = document.getElementById("dataRespRate");
const signalQualityEl = document.getElementById("signalQuality");
const qualityProgress = document.getElementById("signalQualityProgress");
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
  const rr = respirationRate.value;

  heartRateEl.textContent = heartRate;
  dataHeartRateEl.textContent = heartRate;
  heartRateEl.classList.toggle("high", heartRate > 100);
  dataHeartRateEl.classList.toggle("high", heartRate > 100);

  respRateEl.textContent = rr;
  dataRespRateEl.textContent = rr;
  respRateEl.classList.toggle("high", rr > 20);
  dataRespRateEl.classList.toggle("high", rr > 20);

  // Let the demo show the high respiration state after the normal baseline.
  respirationRate.value = Math.min(rr + 1, 22);
}

setInterval(updateVitals, 1400);

const EDGE_DURATION_MS = 3000;
const CLOUD_DURATION_MS = 7000;
const signalQualitySamples = [95, 93, 96, 94, 92, 95, 94, 96, 93, 92, 95, 94];

function qualityForSample(index) {
  return signalQualitySamples[index % signalQualitySamples.length];
}

function createProcessor(name, duration) {
  const nodes = [...document.querySelectorAll(`#${name}Network .node`)];
  return {
    name,
    nodes,
    duration,
    status: document.getElementById(`${name}Status`),
    progress: document.getElementById(`${name}LoadProgress`),
    fill: document.getElementById(`${name}LoadFill`),
    value: document.getElementById(`${name}SignalQuality`),
    cycleIndex: -1,
    targetQuality: 94,
  };
}

const edgeProcessor = createProcessor("edge", EDGE_DURATION_MS);
const cloudProcessor = createProcessor("cloud", CLOUD_DURATION_MS);

function resetProcessor(processor) {
  processor.status.textContent = "Processing";
  processor.nodes.forEach(node => node.classList.remove("active"));
}

function renderProcessor(processor, elapsed) {
  const cycleIndex = Math.floor(elapsed / processor.duration);
  if (cycleIndex !== processor.cycleIndex) {
    processor.cycleIndex = cycleIndex;
    if (cycleIndex > 0) {
      const completedQuality = qualityForSample(cycleIndex - 1);
      const isExcellent = completedQuality >= 95;
      processor.value.textContent = completedQuality;
      processor.value.classList.toggle("signal-excellent", isExcellent);
      if (processor.name === "edge") {
        signalQualityEl.textContent = completedQuality;
        signalQualityEl.classList.toggle("signal-excellent", isExcellent);
      }
    }
    processor.targetQuality = qualityForSample(cycleIndex);
    const targetIsExcellent = processor.targetQuality >= 95;
    processor.fill.classList.toggle("signal-excellent", targetIsExcellent);
    if (processor.name === "edge") qualityBar.classList.toggle("signal-excellent", targetIsExcellent);
  }
  const cycleElapsed = elapsed % processor.duration;
  const progress = cycleElapsed / processor.duration;
  processor.status.textContent = "Processing";
  const displayedQuality = processor.targetQuality * progress;
  processor.fill.style.width = `${displayedQuality}%`;
  processor.progress.setAttribute("aria-valuenow", String(Math.round(displayedQuality)));
  if (processor.name === "edge") {
    qualityBar.style.width = `${displayedQuality}%`;
    qualityProgress.setAttribute("aria-valuenow", String(Math.round(displayedQuality)));
  }

  const activeIndex = processor.nodes.length
    ? Math.floor(progress * processor.nodes.length) % processor.nodes.length
    : -1;
  processor.nodes.forEach((node, index) => node.classList.toggle("active", index === activeIndex));
}

function animateProcessors() {
  const startedAt = performance.now();
  function frame(now) {
    const elapsed = Math.max(0, now - startedAt);
    renderProcessor(edgeProcessor, elapsed);
    renderProcessor(cloudProcessor, elapsed);
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
animateProcessors();

function redirectLegacyEagle() {
  if (location.hash === "#eagle") location.replace("eagle.html");
}

window.addEventListener("hashchange", redirectLegacyEagle);
redirectLegacyEagle();
