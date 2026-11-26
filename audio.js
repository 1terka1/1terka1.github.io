const soundButton = document.querySelector('[data-sound]');
const song = document.querySelector('[data-birthday-song]');
const AudioEngine = window.AudioContext || window.webkitAudioContext;
const soundKey = 'birthday-sound';

let preference = null;
try { preference = sessionStorage.getItem(soundKey); } catch {}
let musicPaused = false;
let enabled = false;
let audio;
let stopEffect;

function updateSoundButton() {
  const waves = enabled ? '<path d="M16 8a5 5 0 0 1 0 8m2.5-11a9 9 0 0 1 0 14"/>' : '<path d="m16 9 5 6m0-6-5 6"/>';
  soundButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9h4L12 5v14l-4.5-4h-4z"/>' + waves + '</svg>' +
    (enabled ? 'Выключить звук' : 'Включить звук');
  soundButton.setAttribute('aria-pressed', String(enabled));
}

function setEnabled(value) {
  enabled = value;
  updateSoundButton();
}

function remember(value) {
  preference = value;
  try { sessionStorage.setItem(soundKey, value); } catch {}
}

function playSong() {
  return song.play().then(() => {
    if (!musicPaused && preference !== 'off') setEnabled(true);
  }).catch(() => {});
}

export function allowSound() {
  if (preference === 'off') return;
  if (!musicPaused) playSong();
  if (!AudioEngine) return;

  try {
    audio ??= new AudioEngine();
    audio.resume().then(() => {
      if (preference !== 'off' && audio.state === 'running') setEnabled(true);
    }).catch(() => {});
  } catch {}
}

export function pauseMusic(paused) {
  musicPaused = paused;
  if (paused) song.pause();
  else if (preference !== 'off') playSong();
}

export function initSound({ paused = false } = {}) {
  musicPaused = paused;
  updateSoundButton();
  soundButton.addEventListener('click', () => {
    if (enabled) {
      remember('off');
      song.pause();
      stopEffect?.();
      setEnabled(false);
    } else {
      remember('on');
      allowSound();
    }
  });

  document.addEventListener('click', event => {
    if (!enabled && !musicPaused && !event.target.closest('[data-sound], a[href]')) allowSound();
  });
  if (!musicPaused && preference !== 'off') playSong();
}

export function prepareEffect(file) {
  const bytes = fetch(file).then(response => response.ok ? response.arrayBuffer() : null).catch(() => null);

  return async () => {
    if (!enabled) return;
    const data = await bytes;
    const buffer = data && audio ? await audio.decodeAudioData(data).catch(() => null) : null;
    if (!enabled) return;
    stopEffect?.();

    if (!buffer || audio.state !== 'running') {
      const effect = new Audio(file);
      effect.volume = .65;
      stopEffect = () => effect.pause();
      effect.play().catch(() => {});
      return;
    }

    const source = audio.createBufferSource();
    const volume = audio.createGain();
    volume.gain.value = .65;
    source.buffer = buffer;
    source.connect(volume).connect(audio.destination);
    const stop = () => source.stop();
    stopEffect = stop;
    source.onended = () => {
      source.disconnect();
      volume.disconnect();
      if (stopEffect === stop) stopEffect = null;
    };
    source.start();
  };
}
