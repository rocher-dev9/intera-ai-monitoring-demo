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
