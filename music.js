/**
 * Dunnett Companion — Persistent Birthday Song
 *
 * Keeps the song playing across page navigation using a "virtual clock":
 *   startEpoch = the wall-clock ms at which elapsed=0 began.
 *   elapsed    = (Date.now() - startEpoch) / 1000
 *
 * When you pause at position T:  startEpoch = Date.now() - T*1000  (frozen)
 * When you resume from position T: startEpoch = Date.now() - T*1000 (live again)
 * When you navigate while playing: startEpoch is unchanged, so the new page
 *   computes the correct position automatically.
 */
(function () {
  const KEY_PLAYING   = 'dunnett_music_playing';
  const KEY_EPOCH     = 'dunnett_music_epoch';
  const SONG_PATH     = 'birthday-song.mp3';

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getElapsed() {
    const epoch = parseInt(localStorage.getItem(KEY_EPOCH) || '0');
    return epoch ? (Date.now() - epoch) / 1000 : 0;
  }

  function setEpochForPosition(posSeconds) {
    localStorage.setItem(KEY_EPOCH, (Date.now() - posSeconds * 1000).toString());
  }

  // ── Public API (used by index.html) ──────────────────────────────────────

  /** Call this when the song starts playing from scratch (pos = 0). */
  window.dunnettMusicStart = function () {
    localStorage.setItem(KEY_PLAYING, '1');
    setEpochForPosition(0);
  };

  /** Call this when the audio element is paused. Pass current position. */
  window.dunnettMusicPause = function (posSeconds) {
    localStorage.removeItem(KEY_PLAYING);
    setEpochForPosition(posSeconds); // freeze the clock at current position
  };

  /** Call this when the audio resumes from a paused position. */
  window.dunnettMusicResume = function (posSeconds) {
    localStorage.setItem(KEY_PLAYING, '1');
    setEpochForPosition(posSeconds);
  };

  /** Call this when the song ends naturally. */
  window.dunnettMusicEnded = function () {
    localStorage.removeItem(KEY_PLAYING);
    localStorage.removeItem(KEY_EPOCH);
    updateNavBtn(false);
  };

  // ── On non-index pages: create hidden audio and auto-resume ──────────────

  const isIndex = /^\/?(?:index\.html)?$/.test(
    window.location.pathname.split('/').pop() || ''
  );

  if (!isIndex) {
    document.addEventListener('DOMContentLoaded', function () {
      setupPersistentPlayer();
    });
  }

  // On index.html: just wire up the nav button to the existing audio element
  if (isIndex) {
    document.addEventListener('DOMContentLoaded', function () {
      var existingAudio = document.getElementById('birthday-song');
      if (existingAudio) {
        injectNavBtn(existingAudio);
      }
    });
  }

  // ── Persistent player (non-index pages) ──────────────────────────────────

  function setupPersistentPlayer() {
    var wasPlaying = localStorage.getItem(KEY_PLAYING) === '1';
    var elapsed    = getElapsed();

    var audio = new Audio(SONG_PATH);
    audio.preload = 'metadata';
    window._dunnettAudio = audio;

    audio.addEventListener('loadedmetadata', function () {
      // Clamp elapsed to song duration
      var seekTo = Math.min(elapsed, audio.duration - 0.5);
      if (seekTo < 0) seekTo = 0;

      if (wasPlaying && seekTo < audio.duration - 0.1) {
        audio.currentTime = seekTo;
        audio.play().then(function () {
          updateNavBtn(true);
        }).catch(function () {
          // Autoplay blocked — show paused state; user can click to start
          updateNavBtn(false);
        });
      } else if (!wasPlaying && elapsed > 0 && elapsed < audio.duration) {
        // Song has been started before but is paused
        audio.currentTime = seekTo;
        updateNavBtn(false);
      } else if (elapsed >= audio.duration) {
        // Song already finished
        localStorage.removeItem(KEY_PLAYING);
        localStorage.removeItem(KEY_EPOCH);
      }
    });

    audio.addEventListener('ended', function () {
      window.dunnettMusicEnded();
    });

    injectNavBtn(audio);
  }

  // ── Nav button ────────────────────────────────────────────────────────────

  var _navBtn = null;

  function injectNavBtn(audio) {
    var nav = document.querySelector('.nav-links');
    if (!nav) return;

    var btn = document.createElement('button');
    btn.className = 'music-nav-btn';
    btn.title     = 'Toggle birthday song';
    btn.setAttribute('aria-label', 'Toggle birthday song');

    var playing = !audio.paused && !audio.ended;
    // On index.html the audio might not be playing yet
    if (isIndex) playing = false;
    // On other pages, reflect actual state after load
    btn.innerHTML = playing ? '&#9835;' : '&#9834;';
    btn.classList.toggle('muted', !playing);

    btn.addEventListener('click', function () {
      if (audio.paused || audio.ended) {
        // Resume
        audio.play().then(function () {
          localStorage.setItem(KEY_PLAYING, '1');
          setEpochForPosition(audio.currentTime);
          btn.innerHTML = '&#9835;';
          btn.classList.remove('muted');
        }).catch(function () {});
      } else {
        // Pause
        window.dunnettMusicPause(audio.currentTime);
        audio.pause();
        btn.innerHTML = '&#9834;';
        btn.classList.add('muted');
      }
    });

    nav.appendChild(btn);
    _navBtn = btn;

    // Keep button in sync with audio state changes
    audio.addEventListener('play',  function () { updateNavBtn(true); });
    audio.addEventListener('pause', function () { updateNavBtn(false); });
    audio.addEventListener('ended', function () { updateNavBtn(false); });
  }

  function updateNavBtn(isPlaying) {
    if (!_navBtn) return;
    _navBtn.innerHTML = isPlaying ? '&#9835;' : '&#9834;';
    _navBtn.classList.toggle('muted', !isPlaying);
  }

})();
