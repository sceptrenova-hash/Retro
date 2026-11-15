(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersLess = () => reduced.matches;
  const progress = document.querySelector('#page-progress');
  let frameQueued = false;
  const updateScroll = () => {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
      const heroArt = document.querySelector('.campaign-art');
      if (heroArt && !prefersLess()) heroArt.style.setProperty('--hero-y', `${Math.min(scrollY * .035, 24)}px`);
      frameQueued = false;
    });
  };
  addEventListener('scroll', updateScroll, {passive:true});
  addEventListener('resize', updateScroll, {passive:true});
  updateScroll();

  const reveals = document.querySelectorAll('.hero-copy, .hero-stage, .manifesto-line, .ritual-heading, .ritual-step, .preview-station, .sound-story, .sound-console, .film-heading, .film-frame, .end-content');
  if ('IntersectionObserver' in window && !prefersLess()) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    reveals.forEach((element, index) => {
      element.classList.add('js-reveal');
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
    reduced.addEventListener?.('change', event => {
      if (event.matches) reveals.forEach(element => element.classList.add('is-in'));
    });
  }

  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const navTargets = navLinks.map(link => [link, document.querySelector(link.getAttribute('href'))]).filter(([, target]) => target);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const hit = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!hit) return;
      navTargets.forEach(([link, target]) => {
        if (target === hit.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-28% 0px -62% 0px', threshold:[0,.15,.35]});
    navTargets.forEach(([,target]) => navObserver.observe(target));
  }

  // The on-page Mac preview is deliberately a concept, with a tiny demo timer.
  const panels = [...document.querySelectorAll('.screen-panel')];
  const railButtons = [...document.querySelectorAll('.rail-button')];
  const stepCards = [...document.querySelectorAll('.ritual-step')];
  const viewTitle = document.querySelector('#view-title');
  const labels = {pace:'CHOOSE YOUR PACE', focus:'YOUR FOCUS STRETCH', reset:'SESSION RECAP'};
  let selectedMinutes = 25;
  let countdown = 20;
  let timerId = null;
  const focusCount = document.querySelector('#focus-count');
  const startDemo = document.querySelector('#demo-start');
  const resetDemo = document.querySelector('#demo-reset');
  const format = seconds => `${Math.floor(seconds / 60).toString().padStart(2,'0')}:${(seconds % 60).toString().padStart(2,'0')}`;
  const updateDemoTime = () => { if (focusCount) focusCount.textContent = format(countdown); };
  const stopCountdown = () => { if (timerId) clearInterval(timerId); timerId = null; };

  function showScene(scene) {
    const index = ['pace','focus','reset'].indexOf(scene);
    if (index < 0) return;
    stopCountdown();
    panels.forEach(panel => {
      const active = panel.dataset.panel === scene;
      panel.hidden = !active;
      if (active) { panel.classList.remove('panel-reenter'); void panel.offsetWidth; panel.classList.add('panel-reenter'); }
    });
    railButtons.forEach(button => {
      const active = button.dataset.go === scene;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    stepCards.forEach((card, i) => {
      const active = i === index;
      card.classList.toggle('is-current', active);
      card.querySelector('.step-trigger')?.setAttribute('aria-pressed', String(active));
    });
    if (viewTitle) viewTitle.textContent = labels[scene];
    if (startDemo) startDemo.innerHTML = '<span>▶</span> Start 20-second preview';
    countdown = 20;
    updateDemoTime();
  }
  railButtons.forEach(button => button.addEventListener('click', () => showScene(button.dataset.go)));
  document.querySelectorAll('.reset-again').forEach(button => button.addEventListener('click', () => showScene('pace')));
  stepCards.forEach(card => card.querySelector('.step-trigger')?.addEventListener('click', () => showScene(card.dataset.scene)));
  document.querySelectorAll('.pace-option').forEach(button => button.addEventListener('click', () => {
    selectedMinutes = Number(button.dataset.minutes) || 25;
    document.querySelectorAll('.pace-option').forEach(option => {
      const active = option === button;
      option.classList.toggle('selected', active);
      option.setAttribute('aria-pressed', String(active));
    });
    const footerValue = document.querySelector('[data-panel="pace"] .screen-footer span:last-child');
    if (footerValue) footerValue.textContent = `${selectedMinutes} / ${selectedMinutes === 15 ? '03' : selectedMinutes === 50 ? '10' : '05'}`;
    document.querySelector('#recap-duration')?.replaceChildren(String(selectedMinutes));
  }));
  document.querySelectorAll('[data-go="pace"], [data-go="focus"], [data-go="reset"]').forEach(button => {
    if (!button.classList.contains('rail-button') && !button.classList.contains('reset-again')) button.addEventListener('click', () => showScene(button.dataset.go));
  });
  stepCards.forEach(card => card.addEventListener('mouseenter', () => {
    if (matchMedia('(hover:hover)').matches) showScene(card.dataset.scene);
  }));
  if ('IntersectionObserver' in window && innerWidth > 760 && !prefersLess()) {
    let lastScene = '';
    const sceneObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible && visible.target.dataset.scene !== lastScene) {
        lastScene = visible.target.dataset.scene;
        showScene(lastScene);
      }
    }, {rootMargin:'-35% 0px -40% 0px', threshold:[0,.35,.65]});
    stepCards.forEach(card => sceneObserver.observe(card));
  }
  startDemo?.addEventListener('click', () => {
    if (timerId) {
      stopCountdown();
      startDemo.innerHTML = '<span>▶</span> Resume preview';
      return;
    }
    if (countdown <= 0) countdown = 20;
    startDemo.innerHTML = '<span>Ⅱ</span> Pause preview';
    timerId = setInterval(() => {
      countdown -= 1;
      updateDemoTime();
      if (countdown <= 0) {
        stopCountdown();
        startDemo.innerHTML = '<span>✓</span> Preview complete';
        window.setTimeout(() => showScene('reset'), 450);
      }
    }, 1000);
  });
  resetDemo?.addEventListener('click', () => {
    stopCountdown(); countdown = 20; updateDemoTime();
    if (startDemo) startDemo.innerHTML = '<span>▶</span> Start 20-second preview';
  });

  // Audio is local to this page and always starts only after an explicit tap.
  const audio = document.querySelector('#deck-audio');
  const audioToggle = document.querySelector('#audio-toggle');
  const audioStatus = document.querySelector('#audio-status');
  const playerBar = document.querySelector('.player-bar');
  const trackRows = [...document.querySelectorAll('.track-row')];
  const cassetteName = document.querySelector('#cassette-name');
  const demoTrack = document.querySelector('#demo-track-name');
  const setAudioUI = playing => {
    if (!audioToggle || !playerBar || !audioStatus) return;
    playerBar.classList.toggle('is-playing', playing);
    audioToggle.textContent = playing ? 'Ⅱ' : '▶';
    audioStatus.textContent = playing ? 'NOW PLAYING' : 'TAP TO LISTEN';
    const current = trackRows.find(track => track.classList.contains('active'));
    if (current) audioToggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${current.dataset.name} preview`);
    trackRows.forEach(track => {
      const active = track.classList.contains('active');
      track.setAttribute('aria-pressed', String(active));
      track.querySelector('.track-play').textContent = active && playing ? 'PLAYING' : 'PLAY';
    });
  };
  audioToggle?.addEventListener('click', async () => {
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setAudioUI(true); }
      catch { audioStatus.textContent = 'PREVIEW COULD NOT PLAY'; }
    } else { audio.pause(); setAudioUI(false); }
  });
  trackRows.forEach(track => track.addEventListener('click', async () => {
    trackRows.forEach(other => other.classList.toggle('active', other === track));
    if (cassetteName) cassetteName.textContent = `SIDE A · ${track.dataset.name.toUpperCase()}`;
    if (demoTrack) demoTrack.textContent = track.dataset.name;
    if (!audio) return;
    const source = `assets/audio/${track.dataset.track}.wav`;
    if (!audio.src.endsWith(source)) audio.src = source;
    try { await audio.play(); setAudioUI(true); }
    catch { setAudioUI(false); if (audioStatus) audioStatus.textContent = 'TAP TO LISTEN'; }
  }));
  audio?.addEventListener('play', () => setAudioUI(true));
  audio?.addEventListener('pause', () => setAudioUI(false));
  audio?.addEventListener('error', () => { setAudioUI(false); if (audioStatus) audioStatus.textContent = 'PREVIEW UNAVAILABLE'; });

  const walkthrough = document.querySelector('#walkthrough');
  walkthrough?.addEventListener('error', () => {
    const caption = document.querySelector('.film-caption span:last-child');
    if (caption) caption.textContent = 'The video could not load. The preview above remains illustrative, not a running-app capture.';
  });
})();
