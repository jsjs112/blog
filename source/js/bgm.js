(() => {
  const FLAG = '__FLOWISLE_BGM_INIT__';
  const AUDIO_KEY = '__FLOWISLE_BGM_AUDIO__';
  const AUDIO_ID = 'flowisle-bgm-audio';
  const SRC = '/music/local/THT%20-%20葬花.mp3';
  const TARGET_VOLUME = 0.35;

  if (window[FLAG]) return;
  window[FLAG] = true;

  const tryPlay = (audio) => {
    if (!audio) return Promise.resolve(false);
    try {
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        return p.then(() => true).catch(() => false);
      }
      return Promise.resolve(true);
    } catch (_) {
      return Promise.resolve(false);
    }
  };

  const ensureAudio = () => {
    let audio = document.getElementById(AUDIO_ID);
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = AUDIO_ID;
      audio.src = SRC;
      audio.loop = true;
      audio.preload = 'auto';
      audio.autoplay = true;
      audio.playsInline = true;
      audio.muted = true;
      audio.volume = 0;
      audio.setAttribute('autoplay', 'autoplay');
      audio.setAttribute('muted', 'muted');
      audio.setAttribute('playsinline', 'playsinline');
      audio.setAttribute('webkit-playsinline', 'webkit-playsinline');
      audio.setAttribute('aria-hidden', 'true');
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }
    window[AUDIO_KEY] = audio;
    return audio;
  };

  const unmuteIfPlaying = (audio) => {
    if (!audio) return;
    if (!audio.paused) {
      audio.muted = false;
      audio.removeAttribute('muted');
      audio.volume = TARGET_VOLUME;
    }
  };

  const boot = async () => {
    const audio = ensureAudio();
    const ok = await tryPlay(audio);
    if (ok) {
      setTimeout(() => unmuteIfPlaying(audio), 80);
    }
  };

  boot();
  window.addEventListener('DOMContentLoaded', boot, { once: true });
  window.addEventListener('load', boot, { once: true });
  window.addEventListener('pageshow', boot);
  document.addEventListener('pjax:complete', boot);

  document.addEventListener('visibilitychange', () => {
    const audio = window[AUDIO_KEY];
    if (!audio) return;
    if (document.hidden) {
      audio.pause();
    } else {
      boot();
    }
  });
})();
