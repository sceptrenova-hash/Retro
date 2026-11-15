(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal each new part of the story once, without hiding anything from reduced-motion users.
  const revealTargets = [...document.querySelectorAll('.hero-copy,.hero-art,.manifesto-grid,.step-line,.walk-head,.video-frame,.story-steps article,.sound-header,.sound-deck,.feature,.mac-heading,.closing-content')];
  if ('IntersectionObserver' in window && !reduced) {
    revealTargets.forEach(el => el.classList.add('reveal-ready'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let scrollQueued = false;
  const updateScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const span = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, scrollY / span)})`;
      const navLinks = [...document.querySelectorAll('.topbar nav a')];
      const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
      let current = '';
      for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .46) current = section.id;
      navLinks.forEach(link => link.toggleAttribute('aria-current', link.getAttribute('href') === `#${current}`));
      scrollQueued = false;
    });
  };
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const scenes = [
    { title: 'Choose a pace', emphasis: 'that feels doable.', body: 'A quick sprint, a familiar Pomodoro, or a longer stretch. Pick a preset, make it yours, and let the clock hold the time for you.', panel: `<div class="screen-top"><span>◈ RETRO</span><span>MONDAY · 09:41</span></div><div class="preset-head">Pick your pace</div><div class="preset-list"><div class="preset selected"><span class="preset-symbol">◌</span><span><b>Sprint</b><small>15 min focus · 3 min rest</small></span><strong>15 / 3</strong></div><div class="preset"><span class="preset-symbol">◷</span><span><b>Pomodoro</b><small>25 min focus · 5 min rest</small></span><strong>25 / 5</strong></div><div class="preset"><span class="preset-symbol">◉</span><span><b>Deep</b><small>50 min focus · 10 min rest</small></span><strong>50 / 10</strong></div></div><div class="screen-bottom"><span>YOUR FOCUS, YOUR PACE</span><span>⌘ , SETTINGS</span></div>` },
    { title: 'Settle in', emphasis: 'to your own rhythm.', body: 'Choose one of four bundled soundscapes or keep things quiet. The soundtrack stays close, so you can leave the extra tabs behind.', panel: `<div class="screen-top"><span>◈ RETRO</span><span>YOUR SOUND DECK</span></div><div class="preset-head">A sound for this stretch</div><div class="demo-sound"><div class="demo-record"><span>RETRO<br>STEREO</span></div><div><small>NOW PLAYING</small><b>Lo-fi Study</b><span>Soft keys · easy crackle</span><i class="demo-wave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i></div></div><div class="preset-list compact"><div class="preset selected"><span class="preset-symbol">♫</span><span><b>Lo-fi Study</b><small>Warm keys · soft crackle</small></span><strong>PLAYING</strong></div><div class="preset"><span class="preset-symbol">♬</span><span><b>Late-night Jazz</b><small>Easy horns · blue hour</small></span><strong>OPEN</strong></div></div><div class="screen-bottom"><span>4 BUILT-IN SOUNDSCAPES</span><span>VOLUME ↗</span></div>` },
    { title: 'Take a breath', emphasis: 'before the next thing.', body: 'When a stretch ends, gentle reminders and breathing cues can help you leave the screen for a real pause. Your sessions stay on your Mac.', panel: `<div class="screen-top"><span>◈ RETRO</span><span>SESSION COMPLETE</span></div><div class="break-scene"><span class="break-spark">✳</span><small>A GOOD MOMENT TO PAUSE</small><b>You made room<br>for one thing.</b><span class="breath-orbit"><i></i></span><p>Breathe in · Hold · Breathe out</p></div><div class="break-summary"><span><b>50 min</b><small>focused</small></span><span><b>1 note</b><small>saved on this Mac</small></span><span><b>10 min</b><small>break, if you want it</small></span></div><div class="screen-bottom"><span>YOUR WORK STAYS YOURS</span><span>SESSION SAVED</span></div>` }
  ];
  const tabs = [...document.querySelectorAll('.story-tab')];
  const title = document.getElementById('story-title');
  const body = document.getElementById('story-body');
  const count = document.getElementById('story-count');
  const progressBar = document.getElementById('story-progress');
  const screen = document.getElementById('story-screen');
  const setScene = index => {
    const scene = scenes[index];
    if (!scene) return;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    title.innerHTML = `${scene.title}<br><em>${scene.emphasis}</em>`;
    body.textContent = scene.body;
    count.textContent = `0${index + 1} / 03`;
    progressBar.style.width = `${(index + 1) * 33.333}%`;
    screen.innerHTML = scene.panel;
    screen.setAttribute('aria-labelledby', `story-tab-${index}`);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setScene(i));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[target].focus();
      setScene(target);
    });
  });
  const steps = [...document.querySelectorAll('.story-step')];
  if ('IntersectionObserver' in window && steps.length) {
    let lastScene = -1;
    const stepObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > .15) {
          const index = Number(entry.target.dataset.step);
          if (index !== lastScene) { lastScene = index; setScene(index); }
        }
      }
    }, { threshold: [.15, .35, .6], rootMargin: '-18% 0px -18% 0px' });
    steps.forEach(step => stepObserver.observe(step));
  }

  const audio = document.getElementById('audio-preview');
  const playButton = document.getElementById('preview-toggle');
  const nowPlaying = document.getElementById('now-playing');
  const waveProgress = document.getElementById('wave-progress');
  const playerTime = document.getElementById('player-time');
  const tracks = [...document.querySelectorAll('.track')];
  const labels = { 'lofi-study': 'LO-FI STUDY', 'late-night-jazz': 'LATE-NIGHT JAZZ', 'soft-piano': 'SOFT FOCUS PIANO', 'rainy-cafe': 'RAINY CAFE' };
  const selectTrack = async (button) => {
    const key = button.dataset.track;
    const wasPlaying = !audio.paused;
    tracks.forEach(track => {
      const selected = track === button;
      track.classList.toggle('active', selected);
      track.setAttribute('aria-pressed', String(selected));
      track.querySelector('.track-action').textContent = selected && wasPlaying ? 'PAUSE' : selected ? 'READY' : 'PLAY';
    });
    nowPlaying.textContent = labels[key];
    audio.pause();
    audio.src = `assets/audio/${key}.wav`;
    audio.currentTime = 0;
    if (wasPlaying) {
      try { await audio.play(); } catch (_) { playButton.textContent = '▶'; }
    }
  };
  tracks.forEach(track => track.addEventListener('click', () => selectTrack(track)));
  playButton.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); } catch (_) { nowPlaying.textContent = 'PREVIEW COULDN’T START'; }
    } else audio.pause();
  });
  audio.addEventListener('play', () => {
    playButton.textContent = 'Ⅱ';
    playButton.setAttribute('aria-label', `Pause ${nowPlaying.textContent} preview`);
    tracks.find(t => t.classList.contains('active'))?.querySelector('.track-action').replaceChildren(document.createTextNode('PAUSE'));
  });
  audio.addEventListener('pause', () => {
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', `Play ${nowPlaying.textContent} preview`);
    tracks.find(t => t.classList.contains('active'))?.querySelector('.track-action').replaceChildren(document.createTextNode('READY'));
  });
  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    waveProgress.style.width = `${pct}%`;
    const mins = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
    const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    playerTime.textContent = `${mins}:${secs}`;
  });
})();