(() => {
  const progress = document.querySelector('#progress-bar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = false;
  function updateScroll() {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
      raf = false;
    });
  }
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const appear = [...document.querySelectorAll('.manifesto-grid,.ritual-intro,.film-head,.sound-header,.detail-grid,.beta-section>img,.beta-section>.kicker,.beta-section>h2,.beta-section>.beta-copy,.beta-note,.ritual-card')];
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    appear.forEach(el => observer.observe(el));
  } else appear.forEach(el => el.classList.add('in'));

  const heroImage = document.querySelector('.hero-image');
  let parallaxQueued = false;
  addEventListener('scroll', () => {
    if (reduceMotion || parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, innerHeight);
      heroImage.style.transform = `scale(${1.02 + y / innerHeight * .045}) translateY(${y * .08}px)`;
      parallaxQueued = false;
    });
  }, { passive: true });

  const links = [...document.querySelectorAll('.nav nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (active) links.forEach(link => link.setAttribute('aria-current', link.hash === `#${active.target.id}` ? 'location' : 'false'));
    }, { rootMargin: '-25% 0px -65% 0px', threshold: [0,.2,.5] });
    sections.forEach(section => navObserver.observe(section));
  }

  const audio = document.querySelector('#deck-audio');
  const toggle = document.querySelector('#audio-toggle');
  const status = document.querySelector('#audio-status');
  const tracks = [...document.querySelectorAll('.track')];
  const label = document.querySelector('#track-name');
  const description = document.querySelector('#track-description');
  const player = document.querySelector('.player');
  function reflectAudio(playing) {
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${label.textContent} preview`);
    player.classList.toggle('playing', playing);
    status.textContent = playing ? 'NOW PLAYING' : 'TAP TO PREVIEW';
    tracks.forEach(row => {
      const active = row.classList.contains('active');
      row.querySelector('.track-play').textContent = active ? (playing ? 'PLAYING' : 'PAUSED') : 'PLAY';
      row.setAttribute('aria-pressed', String(active));
    });
  }
  toggle.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); reflectAudio(true); }
      catch { status.textContent = 'PREVIEW COULD NOT PLAY'; }
    } else { audio.pause(); reflectAudio(false); }
  });
  tracks.forEach(row => row.addEventListener('click', async () => {
    tracks.forEach(item => item.classList.toggle('active', item === row));
    label.textContent = row.dataset.name;
    description.textContent = row.dataset.description;
    toggle.setAttribute('aria-label', `Play ${row.dataset.name} preview`);
    const nextSrc = `assets/audio/${row.dataset.track}.wav`;
    if (!audio.src.endsWith(nextSrc)) audio.src = nextSrc;
    try { await audio.play(); reflectAudio(true); }
    catch { reflectAudio(false); status.textContent = 'TAP TO PREVIEW'; }
  }));
  audio.addEventListener('play', () => reflectAudio(true));
  audio.addEventListener('pause', () => reflectAudio(false));
  audio.addEventListener('error', () => { reflectAudio(false); status.textContent = 'PREVIEW UNAVAILABLE'; });
})();
