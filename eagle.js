const svgNS = 'http://www.w3.org/2000/svg';
const scaleStops = [
  { value: 0.1, position: 0 },
  { value: 1, position: 0.20 },
  { value: 10, position: 0.35 },
  { value: 100, position: 0.50 },
  { value: 1000, position: 1.00 },
];
function angleFor(value) {
  const lower = scaleStops.findLastIndex(stop => stop.value <= value);
  if (lower < 0) return -135 + scaleStops[0].position * 270;
  if (lower === scaleStops.length - 1) return 135;
  const from = scaleStops[lower];
  const to = scaleStops[lower + 1];
  const fraction = Math.log(value / from.value) / Math.log(to.value / from.value);
  return -135 + (from.position + fraction * (to.position - from.position)) * 270;
}
function pointAt(angle, radius) {
  const radians = angle * Math.PI / 180;
  return { x: 180 + Math.sin(radians) * radius, y: 155 - Math.cos(radians) * radius };
}
function arcBetween(startAngle, endAngle, radius) {
  const start = pointAt(startAngle, radius);
  const end = pointAt(endAngle, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}
function svgElement(parent, tag, attrs, text) {
  const element = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  if (text !== undefined) element.textContent = text;
  parent.appendChild(element);
  return element;
}
document.querySelectorAll('.speed-gauge').forEach(svg => {
  const target = Number(svg.dataset.value);
  const startAngle = angleFor(scaleStops[0].value);
  const targetAngle = angleFor(target);
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 138, fill: '#031225', stroke: '#16354f', 'stroke-width': 1 });
  svgElement(svg, 'path', { d: arcBetween(-135, 135, 125), class: 'gauge-track' });
  svgElement(svg, 'path', { d: arcBetween(startAngle, targetAngle, 125), class: 'gauge-arc' });
  for (let decade = 0; decade < scaleStops.length - 1; decade++) {
    for (let multiplier = 2; multiplier <= 9; multiplier++) {
      const angle = angleFor(scaleStops[decade].value * multiplier);
      const outer = pointAt(angle, 117);
      const inner = pointAt(angle, 111);
      svgElement(svg, 'line', { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, class: 'dial-tick' });
    }
  }
  scaleStops.forEach(({ value }) => {
    const angle = angleFor(value);
    const outer = pointAt(angle, 117);
    const inner = pointAt(angle, 106);
    svgElement(svg, 'line', { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, class: 'dial-tick major' });
  });
  const rotation = svgElement(svg, 'g', { transform: `rotate(${startAngle} 180 155)` });
  const needle = svgElement(rotation, 'g', { class: 'needle-motion' });
  needle.style.setProperty('--needle-sweep', `${targetAngle - startAngle}deg`);
  svgElement(needle, 'path', { d: 'M 176 171 L 179 42 L 182 42 L 184 171 Z', class: 'gauge-needle' });
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 9, class: 'gauge-hub' });
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 3, fill: '#bdeaff' });
  scaleStops.forEach(({ value }) => {
    const at = pointAt(angleFor(value), 92);
    svgElement(svg, 'text', { x: at.x, y: at.y, class: 'dial-label speed-label' }, `${value}×`);
  });
  svgElement(svg, 'text', { x: 180, y: 220, class: 'dial-value' }, `${target}×`);
  svgElement(svg, 'text', { x: 180, y: 242, class: 'dial-unit dial-unit-primary' }, 'RELATIVE SPEED');
});
const motionButton = document.getElementById('motionToggle');
motionButton.addEventListener('click', () => {
  const paused = document.body.classList.toggle('needles-paused');
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume needles' : 'Pause needles';
});
const fullscreen = document.getElementById('fullscreenBtn');
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.textContent = 'Fullscreen unavailable'; }
});
document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen'; });
