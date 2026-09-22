const svgNS = 'http://www.w3.org/2000/svg';
function pointAt(angle, radius) {
  const radians = angle * Math.PI / 180;
  return { x: 180 + Math.sin(radians) * radius, y: 155 - Math.cos(radians) * radius };
}
function arcTo(angle, radius) {
  const start = pointAt(-135, radius);
  const end = pointAt(angle, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${angle + 135 > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}
function svgElement(parent, tag, attrs, text) {
  const element = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  if (text !== undefined) element.textContent = text;
  parent.appendChild(element);
  return element;
}
document.querySelectorAll('.speed-gauge').forEach(svg => {
  const isCpu = svg.dataset.tone === 'cpu';
  const timeValues = isCpu ? ['0.50s', '1.00s', '1.50s', '2.00s', '2.50s'] : ['0.00ms', '5.00ms', '10.00ms', '15.00ms', '20.00ms', '25.00ms'];
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 138, fill: '#031225', stroke: '#16354f', 'stroke-width': 1 });
  svgElement(svg, 'path', { d: arcTo(135, 125), class: 'gauge-track' });
  svgElement(svg, 'path', { d: arcTo(isCpu ? 0 : 105, 125), class: 'gauge-arc' });
  for (let i = 0; i <= 40; i++) {
    const tickAngle = -135 + i / 40 * 270;
    const outer = pointAt(tickAngle, 117);
    const inner = pointAt(tickAngle, i % 10 === 0 ? 106 : 111);
    svgElement(svg, 'line', { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, class: `dial-tick${i % 10 === 0 ? ' major' : ''}` });
  }
  timeValues.forEach((label, index) => {
    const labelStart = isCpu ? -105 : -135;
    const labelSpan = isCpu ? 210 : 240;
    const labelAngle = labelStart + index / (timeValues.length - 1) * labelSpan;
    const at = pointAt(labelAngle, 92);
    svgElement(svg, 'text', { x: at.x, y: at.y, class: 'dial-label time-label' }, label);
  });
  const rotation = svgElement(svg, 'g', { transform: 'rotate(-135 180 155)' });
  const needle = svgElement(rotation, 'g', { class: 'needle-motion' });
  needle.style.setProperty('--needle-sweep', isCpu ? '135deg' : '240deg');
  svgElement(needle, 'path', { d: 'M 176 171 L 179 42 L 182 42 L 184 171 Z', class: 'gauge-needle' });
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 9, class: 'gauge-hub' });
  svgElement(svg, 'circle', { cx: 180, cy: 155, r: 3, fill: '#bdeaff' });
  svgElement(svg, 'text', { x: 180, y: 242, class: 'dial-unit dial-unit-primary' }, isCpu ? 'SECONDS' : 'MILLISECONDS');
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
