(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('#progress-bar');
  let scrollQueued = false;
  function updateProgress() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
      scrollQueued = false;
    });
  }
  addEventListener('scroll', updateProgress, {passive:true});
  addEventListener('resize', updateProgress, {passive:true});
  updateProgress();

  const sections = [...document.querySelectorAll('.nav nav a')].map(a => [a, document.querySelector(a.getAttribute('href'))]).filter(([,s]) => s);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) sections.forEach(([link, section]) => link.setAttribute('aria-current', section === visible.target ? 'location' : 'false'));
    }, {rootMargin:'-24% 0px -66% 0px', threshold:[0,.15,.35]});
    sections.forEach(([,section]) => navObserver.observe(section));
  }

  const storySteps = [...document.querySelectorAll('.story-step')];
  const tabs = [...document.querySelectorAll('.demo-tab')];
  const demoWindow = document.querySelector('#demo-window');
  const presetList = document.querySelector('#preset-list');
  const timer = document.querySelector('#demo-timer');
  const recap = document.querySelector('#demo-recap');
  const demoTitle = document.querySelector('#demo-title');
  const demoTime = document.querySelector('#demo-time');
  const viewText = {
    pace: {title:'CHOOSE YOUR PACE', time:'15 MIN'},
    focus: {title:'YOUR FOCUS STRETCH', time:'25 MIN'},
    reset: {title:'A MOMENT TO RESET', time:'25 MIN'}
  };
  function showView(view) {
    demoWindow.dataset.view = view;
    demoTitle.textContent = viewText[view].title;
    demoTime.textContent = viewText[view].time;
    presetList.hidden = view !== 'pace';
    timer.hidden = view !== 'focus';
    recap.hidden = view !== 'reset';
    tabs.forEach(tab => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    storySteps.forEach(step => {
      const active = Number(step.dataset.step) === ['pace','focus','reset'].indexOf(view);
      step.classList.toggle('is-active', active);
      step.querySelector('.step-select').setAttribute('aria-pressed', String(active));
    });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => showView(tab.dataset.view)));
  storySteps.forEach(step => step.querySelector('.step-select').addEventListener('click', () => showView(['pace','focus','reset'][Number(step.dataset.step)])));
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus();
    showView(tabs[next].dataset.view);
  }));
  const presets = [...document.querySelectorAll('.preset')];
  presets.forEach(button => button.addEventListener('click', () => {
    presets.forEach(p => { const active = p === button; p.classList.toggle('is-selected', active); p.setAttribute('aria-pressed', String(active)); });
    demoTime.textContent = `${button.dataset.minutes} MIN`;
  }));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const stepObserver = new IntersectionObserver(entries => {
      const active = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (active) showView(['pace','focus','reset'][Number(active.target.dataset.step)]);
    }, {rootMargin:'-38% 0px -40% 0px', threshold:[0,.35,.65]});
    storySteps.forEach(step => stepObserver.observe(step));
  }

  const audio = document.querySelector('#deck-audio');
  const toggle = document.querySelector('#audio-toggle');
  const status = document.querySelector('#audio-status');
  const player = document.querySelector('.audio-player');
  const tracks = [...document.querySelectorAll('.track')];
  const cassetteTrack = document.querySelector('#cassette-track');
  function reflectAudio(playing) {
    player.classList.toggle('playing', playing);
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    status.textContent = playing ? 'NOW PLAYING' : 'TAP TO PREVIEW';
    const current = tracks.find(track => track.classList.contains('is-active'));
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${current.dataset.name} preview`);
    tracks.forEach(track => {
      track.querySelector('.track-action').textContent = track.classList.contains('is-active') ? (playing ? 'PLAYING' : 'PAUSED') : 'PLAY';
      track.setAttribute('aria-pressed', String(track.classList.contains('is-active')));
    });
  }
  toggle.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); reflectAudio(true); }
      catch { status.textContent = 'PREVIEW COULD NOT PLAY'; }
    } else { audio.pause(); reflectAudio(false); }
  });
  tracks.forEach(track => track.addEventListener('click', async () => {
    tracks.forEach(other => { const active = other === track; other.classList.toggle('is-active', active); other.setAttribute('aria-pressed', String(active)); });
    cassetteTrack.textContent = track.dataset.name.toUpperCase();
    const source = `assets/audio/${track.dataset.track}.wav`;
    if (!audio.src.endsWith(source)) audio.src = source;
    try { await audio.play(); reflectAudio(true); }
    catch { reflectAudio(false); status.textContent = 'TAP TO PREVIEW'; }
  }));
  audio.addEventListener('play', () => reflectAudio(true));
  audio.addEventListener('pause', () => reflectAudio(false));
  audio.addEventListener('error', () => { reflectAudio(false); status.textContent = 'PREVIEW UNAVAILABLE'; });
})();
