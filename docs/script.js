(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('#progress');
  let queued = false;
  const updateProgress = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
      queued = false;
    });
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    reduceMotion.addEventListener?.('change', event => {
      if (event.matches) {
        document.documentElement.classList.remove('js-motion');
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
      }
    });
  }

  const navPairs = [...document.querySelectorAll('.nav-links a')]
    .map(link => [link, document.querySelector(link.getAttribute('href'))])
    .filter(([, target]) => target);
  if ('IntersectionObserver' in window && navPairs.length) {
    const navObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      navPairs.forEach(([link, target]) => {
        if (target === active.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -62% 0px', threshold: [0, .15, .35] });
    navPairs.forEach(([, target]) => navObserver.observe(target));
  }

  const tabs = [...document.querySelectorAll('.demo-tab')];
  const panels = [...document.querySelectorAll('.demo-panel')];
  const showPanel = name => {
    tabs.forEach(tab => {
      const selected = tab.dataset.view === name;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.dataset.panel === name;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.view));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      showPanel(tabs[next].dataset.view);
    });
  });

  const timerValue = document.querySelector('#timer-value');
  const timerMode = document.querySelector('#timer-mode');
  const timerNote = document.querySelector('#timer-note');
  const startButton = document.querySelector('#start-demo');
  const resetButton = document.querySelector('#reset-demo');
  const presetButtons = [...document.querySelectorAll('.preset-option')];
  const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  let selectedMinutes = 25;
  let demoSeconds = 20;
  let demoInterval = null;
  let completed = false;
  const renderTimer = () => {
    if (timerValue) timerValue.textContent = demoInterval || completed ? format(demoSeconds) : `${String(selectedMinutes).padStart(2, '0')}:00`;
    if (timerMode) timerMode.textContent = presetButtons.find(button => Number(button.dataset.min) === selectedMinutes)?.querySelector('b')?.textContent.toUpperCase() || 'FOCUS';
  };
  const stopDemo = () => {
    if (demoInterval) clearInterval(demoInterval);
    demoInterval = null;
  };
  const resetTimer = () => {
    stopDemo();
    demoSeconds = 20;
    completed = false;
    if (startButton) { startButton.innerHTML = '<span>▶</span> Start 20-second site demo'; startButton.disabled = false; }
    if (timerNote) timerNote.textContent = 'SITE DEMO · COMPRESSED TIME';
    renderTimer();
  };
  presetButtons.forEach(button => button.addEventListener('click', () => {
    stopDemo();
    selectedMinutes = Number(button.dataset.min) || 25;
    presetButtons.forEach(item => item.classList.toggle('selected', item === button));
    const footer = document.querySelector('.demo-footer span:last-child');
    if (footer) footer.textContent = `${selectedMinutes} / ${String(Number(button.dataset.break) || 5).padStart(2, '0')} MIN RHYTHM`;
    resetTimer();
  }));
  startButton?.addEventListener('click', () => {
    if (demoInterval) {
      stopDemo();
      startButton.innerHTML = '<span>▶</span> Resume site demo';
      if (timerNote) timerNote.textContent = 'PAUSED · WEBSITE PREVIEW';
      return;
    }
    if (completed || demoSeconds <= 0) resetTimer();
    startButton.innerHTML = '<span>Ⅱ</span> Pause site demo';
    if (timerNote) timerNote.textContent = '20-SECOND PREVIEW · NOT A REAL MAC SESSION';
    demoInterval = setInterval(() => {
      demoSeconds -= 1;
      renderTimer();
      if (demoSeconds <= 0) {
        stopDemo();
        completed = true;
        startButton.innerHTML = '<span>✓</span> Demo complete';
        if (timerNote) timerNote.textContent = 'NICE WORK · THIS PREVIEW RUNS IN YOUR BROWSER';
        renderTimer();
      }
    }, 1000);
  });
  resetButton?.addEventListener('click', resetTimer);
  renderTimer();

  const audio = document.querySelector('#track-preview');
  const playButton = document.querySelector('#audio-play');
  const deckToggle = document.querySelector('#deck-toggle');
  const status = document.querySelector('#audio-status');
  const deckStatus = document.querySelector('#deck-status');
  const player = document.querySelector('.sound-player');
  const tracks = [...document.querySelectorAll('.track-choice, .deck-track')];
  let activeTrack = 'lofi-study';
  const trackDetails = {
    'lofi-study': { title: 'Lo-fi Study', desc: 'warm keys · soft crackle' },
    'late-night-jazz': { title: 'Late-night Jazz', desc: 'easy horns · blue hour' },
    'soft-piano': { title: 'Soft Focus Piano', desc: 'slow notes · open space' },
    'rainy-cafe': { title: 'Rainy Cafe', desc: 'window rain · cafe hum' }
  };
  const renderAudio = playing => {
    const details = trackDetails[activeTrack];
    const name = details?.title || 'Retro soundtrack';
    if (player) player.classList.toggle('is-playing', playing);
    if (playButton) playButton.innerHTML = playing ? '<span>Ⅱ</span> Pause sound sample' : '<span>▶</span> Play sound sample';
    if (deckToggle) {
      deckToggle.textContent = playing ? 'Ⅱ' : '▶';
      deckToggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${name}`);
    }
    if (status) status.textContent = playing ? 'PLAYING THE INCLUDED SOUND SAMPLE' : 'A short preview from the included soundtrack.';
    if (deckStatus) deckStatus.textContent = playing ? 'NOW PLAYING' : 'TAP TO LISTEN';
    tracks.forEach(track => {
      const active = track.dataset.track === activeTrack;
      track.classList.toggle('active', active);
      if (track.hasAttribute('aria-pressed')) track.setAttribute('aria-pressed', String(active));
    });
  };
  const setTrack = async slug => {
    if (!trackDetails[slug] || !audio) return;
    const wasPlaying = !audio.paused;
    activeTrack = slug;
    const detail = trackDetails[slug];
    const audioPath = `assets/audio/${slug}.wav`;
    if (!audio.src.endsWith(audioPath)) audio.src = audioPath;
    document.querySelectorAll('#selected-track, #deck-track-name').forEach(el => { el.textContent = detail.title; });
    document.querySelectorAll('#track-description, #deck-track-desc').forEach(el => { el.textContent = detail.desc; });
    renderAudio(false);
    if (wasPlaying) {
      try { await audio.play(); renderAudio(true); }
      catch { renderAudio(false); if (status) status.textContent = 'SOUND SAMPLE COULD NOT PLAY IN THIS BROWSER.'; }
    }
  };
  const toggleAudio = async () => {
    if (!audio) return;
    if (audio.paused) {
      if (!audio.src) audio.src = `assets/audio/${activeTrack}.wav`;
      try { await audio.play(); renderAudio(true); }
      catch { renderAudio(false); if (status) status.textContent = 'SOUND SAMPLE COULD NOT PLAY IN THIS BROWSER.'; }
    } else {
      audio.pause();
      renderAudio(false);
    }
  };
  playButton?.addEventListener('click', toggleAudio);
  deckToggle?.addEventListener('click', toggleAudio);
  tracks.forEach(track => track.addEventListener('click', () => { void setTrack(track.dataset.track); }));
  audio?.addEventListener('play', () => renderAudio(true));
  audio?.addEventListener('pause', () => renderAudio(false));
  audio?.addEventListener('ended', () => { renderAudio(false); if (deckStatus) deckStatus.textContent = 'SAMPLE ENDED'; });
  audio?.addEventListener('error', () => {
    renderAudio(false);
    if (status) status.textContent = 'SOUND SAMPLE UNAVAILABLE RIGHT NOW.';
    if (deckStatus) deckStatus.textContent = 'SAMPLE UNAVAILABLE';
  });
})();
