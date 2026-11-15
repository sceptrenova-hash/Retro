(() => {
  const progress = document.querySelector('#scroll-progress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pageTicking = false;
  const updateProgress = () => {
    if (pageTicking) return;
    pageTicking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      pageTicking = false;
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.14 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  const stories = [
    { count: '01 / 03', title: 'Choose a pace<br><em>that feels doable.</em>', body: 'A quick sprint, a familiar Pomodoro, or a longer stretch. Pick a preset, make it yours, and let the clock hold the time for you.', label: 'Pick your pace', active: 0 },
    { count: '02 / 03', title: 'Name the next<br><em>small step.</em>', body: 'Add a short session note to keep the task in view. When the timer ends, it stays with your completed session.', label: 'One thing to focus on', active: 1 },
    { count: '03 / 03', title: 'When it’s time,<br><em>take a breath.</em>', body: 'Gentle focus and break reminders are optional. Turn them on when they help; leave them off when quiet is better.', label: 'Leave a little space', active: 2 }
  ];
  const storyButtons = [...document.querySelectorAll('.story-tab')];
  const setStory = index => {
    const s = stories[index];
    document.querySelector('#story-count').textContent = s.count;
    document.querySelector('#story-title').innerHTML = s.title;
    document.querySelector('#story-body').textContent = s.body;
    document.querySelector('.preset-head').textContent = s.label;
    document.querySelector('#story-progress').style.width = `${(index + 1) * 33.333}%`;
    storyButtons.forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    document.querySelector('#story-screen').setAttribute('aria-labelledby', `story-tab-${index}`);
    const rows = [...document.querySelectorAll('.preset')];
    rows.forEach((row, i) => row.classList.toggle('selected', i === index));
  };
  storyButtons.forEach((button, index) => {
    button.addEventListener('click', () => setStory(index));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % storyButtons.length
        : event.key === 'ArrowLeft' ? (index + storyButtons.length - 1) % storyButtons.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? storyButtons.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      setStory(next);
      storyButtons[next].focus();
    });
  });
  const storyStage = document.querySelector('.story-stage');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = storyStage.getBoundingClientRect();
      const range = storyStage.offsetHeight - window.innerHeight;
      const traveled = Math.min(Math.max(-rect.top, 0), range);
      const overall = Math.min(Math.max(traveled / Math.max(range, 1), 0), 1);
      const position = overall * 3;
      const idx = Math.min(2, Math.floor(position));
      const local = Math.min(position - idx, 1);
      storyStage.style.setProperty('--story-progress', overall.toFixed(3));
      storyStage.style.setProperty('--story-local', local.toFixed(3));
      const sun = document.querySelector('.sun-disc');
      sun.style.transform = `translate(${(idx + local) * -4}%, ${(idx + local) * 2}%) scale(${1 + (idx + local) * .04})`;
      setStory(idx);
      ticking = false;
    });
  }, { passive: true });

  const audio = document.querySelector('#deck-audio');
  const toggle = document.querySelector('#audio-toggle');
  const label = document.querySelector('#audio-label');
  const waveform = document.querySelector('.waveform');
  const tracks = [...document.querySelectorAll('.track-row')];
  const names = { 'lofi-study': 'LO-FI STUDY', 'late-night-jazz': 'LATE-NIGHT JAZZ', 'soft-piano': 'SOFT FOCUS PIANO', 'rainy-cafe': 'RAINY CAFE' };
  const setPlaying = playing => {
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-label', playing ? 'Pause soundtrack preview' : 'Play soundtrack preview');
    waveform.classList.toggle('playing', playing);
    label.textContent = `${names[tracks.find(t => t.classList.contains('active'))?.dataset.track] || 'SOUND DECK'} · ${playing ? 'LOOPING' : 'PAUSED'}`;
    tracks.forEach(row => {
      row.querySelector('.track-state').textContent = row.classList.contains('active') ? (playing ? 'PLAYING' : 'PAUSED') : 'PLAY';
      row.setAttribute('aria-pressed', String(row.classList.contains('active')));
    });
  };
  toggle.addEventListener('click', async () => {
    if (audio.paused) { try { await audio.play(); setPlaying(true); } catch { label.textContent = 'TAP TO PLAY SOUND'; } }
    else { audio.pause(); setPlaying(false); }
  });
  tracks.forEach(row => row.addEventListener('click', async () => {
    const file = row.dataset.track;
    tracks.forEach(t => t.classList.toggle('active', t === row));
    if (!audio.src.endsWith(`${file}.wav`)) audio.src = `assets/audio/${file}.wav`;
    try { await audio.play(); setPlaying(true); } catch { setPlaying(false); label.textContent = 'TAP PLAY TO PREVIEW'; }
  }));
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('error', () => {
    setPlaying(false);
    label.textContent = 'PREVIEW UNAVAILABLE · TRY ANOTHER TRACK';
  });

  const navLinks = [...document.querySelectorAll('.topbar nav a')];
  const navTargets = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .15, .35, .6] });
    navTargets.forEach(target => navObserver.observe(target));
  }
})();
