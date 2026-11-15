(() => {
  const progress = document.querySelector('#scroll-progress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
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
    document.querySelector('.sun-disc').style.transform = `translate(${index * -4}%, ${index * 2}%) scale(${1 + index * .04})`;
    storyButtons.forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-selected', String(i === index)); });
    const rows = [...document.querySelectorAll('.preset')];
    rows.forEach((row, i) => row.classList.toggle('selected', i === index));
  };
  storyButtons.forEach((button, index) => button.addEventListener('click', () => setStory(index)));
  const storyStage = document.querySelector('.story-stage');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = storyStage.getBoundingClientRect();
      const range = storyStage.offsetHeight - window.innerHeight;
      const traveled = Math.min(Math.max(-rect.top, 0), range);
      const idx = Math.min(2, Math.floor((traveled / Math.max(range, 1)) * 3));
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
    tracks.forEach(row => row.querySelector('.track-state').textContent = row.classList.contains('active') ? (playing ? 'PLAYING' : 'PAUSED') : 'PLAY');
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
})();
