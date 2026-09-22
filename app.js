const heartRateEl = document.getElementById("heartRate");
const respRateEl = document.getElementById("respRate");
const signalQualityEl = document.getElementById("signalQuality");
const qualityBar = document.getElementById("qualityBar");
const sensorText = document.getElementById("sensorText");

const edgeNodes = [...document.querySelectorAll("#edgeNetwork .node")];
const cloudNodes = [...document.querySelectorAll("#cloudNetwork .node")];
const edgeResult = document.getElementById("edgeResult");
const cloudResult = document.getElementById("cloudResult");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let respirationRate = 15;

function randomAround(base, variation) {
  const min = base - variation;
  const max = base + variation;
  return Math.round(Math.random() * (max - min) + min);
}

function updateVitals() {
  const hr = randomAround(95, 25);
  const rr = respirationRate;
  const sq = randomAround(94, 2);

  heartRateEl.textContent = hr;
  heartRateEl.classList.toggle("high", hr > 100);
  respRateEl.textContent = rr;
  respRateEl.classList.toggle("high", rr > 20);
  // Increase gradually, then hold at 22 rpm to demonstrate the red state.
  respirationRate = Math.min(rr + 1, 22);
  signalQualityEl.textContent = sq;
  qualityBar.style.width = `${sq}%`;
}

setInterval(updateVitals, 1400);

// Simulated processing durations. Cloud takes exactly 528 times as long.
const EDGE_PROCESSING_MS = 300;
const CLOUD_PROCESSING_MS = EDGE_PROCESSING_MS * 528;
const EDGE_NODE_INTERVAL_MS = 110 * 3;
const CLOUD_NODE_INTERVAL_MS = 420;

function createProcessor(name, nodes, result, duration, nodeInterval) {
  return {
    nodes, result, duration, nodeInterval,
    progress: document.getElementById(`${name}Progress`),
    fill: document.getElementById(`${name}ProgressFill`),
    percent: document.getElementById(`${name}Percent`),
    status: document.getElementById(`${name}Status`),
    elapsed: document.getElementById(`${name}Elapsed`),
    // The illustrative node sequence completes even when inference is faster.
    visualDuration: Math.max(duration, nodes.length * nodeInterval),
  };
}

const edgeProcessor = createProcessor("edge", edgeNodes, edgeResult, EDGE_PROCESSING_MS, EDGE_NODE_INTERVAL_MS);
const cloudProcessor = createProcessor("cloud", cloudNodes, cloudResult, CLOUD_PROCESSING_MS, CLOUD_NODE_INTERVAL_MS);

function resetProcessor(processor) {
  processor.progress.setAttribute("aria-valuenow", "0");
  processor.fill.style.width = "0%";
  processor.percent.textContent = "0%";
  processor.status.textContent = "Waiting for signal";
  processor.elapsed.textContent = "0.00 s";
  processor.result.textContent = "…";
  processor.result.classList.remove("visible");
  processor.nodes.forEach(node => node.classList.remove("active"));
}

function renderProcessor(processor, elapsed) {
  const processingElapsed = Math.min(elapsed, processor.duration);
  const percent = Math.floor(processingElapsed / processor.duration * 100);
  const complete = elapsed >= processor.duration;
  processor.fill.style.width = `${percent}%`;
  processor.progress.setAttribute("aria-valuenow", String(percent));
  processor.percent.textContent = `${percent}%`;
  processor.status.textContent = complete ? "Complete" : "Processing";
  processor.elapsed.textContent = `${(processingElapsed / 1000).toFixed(2)} s`;
  if (complete) {
    processor.result.textContent = "95";
    processor.result.classList.add("visible");
  }

  const activeIndex = elapsed < processor.visualDuration
    ? Math.floor(elapsed / processor.nodeInterval) % processor.nodes.length
    : -1;
  processor.nodes.forEach((node, index) => node.classList.toggle("active", index === activeIndex));
}

function animateProcessor(processor, startedAt) {
  return new Promise(resolve => {
    function frame(now) {
      const elapsed = Math.max(0, now - startedAt);
      renderProcessor(processor, elapsed);
      if (elapsed < processor.visualDuration) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

async function runDemoLoop() {
  while (true) {
    sensorText.textContent = "Acquiring signal...";
    resetProcessor(edgeProcessor);
    resetProcessor(cloudProcessor);
    await sleep(1200);

    sensorText.textContent = "Signal acquired";
    const startedAt = performance.now();
    await Promise.all([
      animateProcessor(edgeProcessor, startedAt),
      animateProcessor(cloudProcessor, startedAt),
    ]);
    await sleep(3600);
    sensorText.textContent = "Target detected";
    await sleep(1000);
  }
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
  if (!document.fullscreenElement) {
    fullscreenBtn.textContent = "Fullscreen";
  }
});

updateVitals();
runDemoLoop();

// Preserve links to the previous Eagle placeholder.
function redirectLegacyEagle() {
  if (location.hash === "#eagle") location.replace("eagle.html");
}
window.addEventListener("hashchange", redirectLegacyEagle);
redirectLegacyEagle();
