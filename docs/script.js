(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('#progress');
  let scrollQueued = false;
  const updateProgress = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
      scrollQueued = false;
    });
  };
  addEventListener('scroll', updateProgress, {passive:true});
  addEventListener('resize', updateProgress, {passive:true});
  updateProgress();

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveals.unobserve(entry.target);
    }), {rootMargin:'0px 0px -8% 0px', threshold:.08});
    document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));

    const stage = document.querySelector('#story-stage');
    const beats = [...document.querySelectorAll('.story-beat')];
    const stageCount = document.querySelector('#stage-count');
    if (stage && beats.length) {
      const setStage = index => {
        stage.dataset.stage = String(index);
        if (stageCount) stageCount.textContent = `0${index + 1} — 0${beats.length}`;
        beats.forEach((beat, beatIndex) => {
          beat.classList.toggle('is-active', beatIndex === index);
          if (beatIndex === index) beat.setAttribute('aria-current','step');
          else beat.removeAttribute('aria-current');
        });
      };
      const beatObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setStage(Number(visible.target.dataset.beat) || 0);
      }, {rootMargin:'-42% 0px -42% 0px', threshold:[0,.1,.3,.6]});
      beats.forEach(beat => beatObserver.observe(beat));
      setStage(0);

      // A single scroll progress value choreographs the scene: fragments loosen,
      // gather around the timer, then resolve into the soundtrack record.
      const storyLayout = document.querySelector('.story-layout');
      let motionQueued = false;
      const updateStoryMotion = () => {
        if (motionQueued) return;
        motionQueued = true;
        requestAnimationFrame(() => {
          if (storyLayout) {
            const rect = storyLayout.getBoundingClientRect();
            const travel = Math.max(1, rect.height - innerHeight * .52);
            const p = Math.max(0, Math.min(1, (innerHeight * .48 - rect.top) / travel));
            const eased = p * p * (3 - 2 * p);
            stage.style.setProperty('--story-p', eased.toFixed(4));
            const set = (name,value) => stage.style.setProperty(name,value);
            set('--photo-transform',`scale(${(1.04 + eased * .16).toFixed(3)}) translate3d(${((.5-eased)*2).toFixed(2)}%,${((.5-eased)*-1).toFixed(2)}%,0)`);
            set('--photo-filter',`saturate(${(.52 + eased * .32).toFixed(3)}) brightness(${(.62 - eased * .12).toFixed(3)})`);
            set('--frame-transform',`rotateX(${((.5-eased)*2).toFixed(2)}deg)`);
            set('--noise-a-transform',`translate3d(${(-eased*110).toFixed(1)}px,${(-eased*80).toFixed(1)}px,0) rotate(${-9-eased*18}deg) scale(${1-eased*.22})`);
            set('--noise-b-transform',`translate3d(${(eased*105).toFixed(1)}px,${(-eased*46).toFixed(1)}px,0) rotate(${7+eased*22}deg) scale(${1-eased*.2})`);
            set('--noise-c-transform',`translate3d(${(-eased*42).toFixed(1)}px,${(eased*110).toFixed(1)}px,0) rotate(${4-eased*15}deg) scale(${1-eased*.25})`);
            set('--stamp-transform',`translate3d(${(eased*86).toFixed(1)}px,${(eased*55).toFixed(1)}px,0) rotate(${12+eased*28}deg) scale(${1-eased*.48})`);
            set('--noise-a-opacity',String(Math.max(0,1-eased*1.25)));
            set('--noise-b-opacity',String(Math.max(0,1-eased*1.2)));
            set('--noise-c-opacity',String(Math.max(0,1-eased*1.3)));
            set('--stamp-opacity',String(Math.max(0,1-eased*1.35)));
            const focus = Math.max(0,1-Math.abs(eased-.5)*2);
            set('--focus-transform',`translate3d(${((.5-eased)*72).toFixed(1)}px,${((.5-eased)*34).toFixed(1)}px,0) rotate(${((.5-eased)*-8).toFixed(2)}deg) scale(${(.88+focus*.16).toFixed(3)})`);
            set('--orbit-transform',`rotate(${-44+eased*30}deg) scale(${(.84+focus*.18).toFixed(3)})`);
            set('--orbit-size',`${56+focus*24}%`);
            set('--orbit-height',`${66+focus*32}%`);
            set('--orbit-opacity',String(.38+focus*.62));
            set('--note-transform',`translate3d(${((.5-eased)*50).toFixed(1)}px,${((.5-eased)*-28).toFixed(1)}px,0) rotate(${10-eased*10}deg)`);
            set('--disc-transform',`translate3d(${((.5-eased)*110).toFixed(1)}px,${((.5-eased)*32).toFixed(1)}px,0) rotate(${(.5-eased)*18}deg) scale(${(.8+eased*.2).toFixed(3)})`);
            set('--return-transform',`translate3d(${((.5-eased)*-82).toFixed(1)}px,${((.5-eased)*42).toFixed(1)}px,0)`);
            set('--caption-transform',`translate3d(${((.5-eased)*48).toFixed(1)}px,${((.5-eased)*-20).toFixed(1)}px,0) rotate(${-4-eased*7}deg)`);
            set('--flare-left',`${10+eased*76}%`);
            set('--flare-top',`${77-eased*58}%`);
            set('--flare-scale',String(.65+eased*.6));
            set('--flare-opacity',String(.22+eased*.78));
          }
          motionQueued = false;
        });
      };
      addEventListener('scroll', updateStoryMotion, {passive:true});
      addEventListener('resize', updateStoryMotion, {passive:true});
      updateStoryMotion();
    }
  }

  const anchors = [...document.querySelectorAll('.nav-links a')]
    .map(link => [link, document.querySelector(link.getAttribute('href'))])
    .filter(([,section]) => section);
  if ('IntersectionObserver' in window && anchors.length) {
    const navObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      anchors.forEach(([link,section]) => {
        if (section === active.target) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-35% 0px -58% 0px', threshold:[0,.15,.35]});
    anchors.forEach(([,section]) => navObserver.observe(section));
  }

  const tabs = [...document.querySelectorAll('.demo-tab')];
  const panels = [...document.querySelectorAll('.demo-panel')];
  const showPanel = name => {
    tabs.forEach(tab => {
      const selected = tab.dataset.panel === name;
      tab.classList.toggle('is-selected', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.id === `panel-${name}`;
      panel.hidden = !selected;
    });
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.panel));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      showPanel(tabs[next].dataset.panel);
    });
  });

  const timerValue = document.querySelector('#timer-value');
  const timerMode = document.querySelector('#timer-mode');
  const timerStatus = document.querySelector('#timer-status');
  const timerStart = document.querySelector('#timer-start');
  const timerReset = document.querySelector('#timer-reset');
  const clockProgress = document.querySelector('#clock-progress');
  const presets = [...document.querySelectorAll('.preset')];
  const rhythmButtons = document.querySelectorAll('.preset');
  let selectedMinutes = 25;
  let secondsLeft = 20;
  let timerInterval = null;
  let demoStarted = false;
  let demoCompleted = false;
  const formatTime = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  const renderTimer = () => {
    if (timerValue) timerValue.textContent = demoStarted ? formatTime(secondsLeft) : `${String(selectedMinutes).padStart(2,'0')}:00`;
    if (timerMode) timerMode.textContent = presets.find(button => Number(button.dataset.min) === selectedMinutes)?.dataset.name || 'FOCUS';
    if (clockProgress) clockProgress.style.strokeDashoffset = String(572 * (1 - secondsLeft / 20));
  };
  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  };
  const resetTimer = () => {
    stopTimer();
    secondsLeft = 20;
    demoStarted = false;
    demoCompleted = false;
    if (timerStart) { timerStart.innerHTML = 'START 20-SECOND DEMO <span>↗</span>'; timerStart.disabled = false; }
    if (timerStatus) timerStatus.textContent = 'COMPRESSED TIME / BROWSER ONLY';
    renderTimer();
  };
  rhythmButtons.forEach(button => button.addEventListener('click', () => {
    selectedMinutes = Number(button.dataset.min) || 25;
    presets.forEach(item => item.classList.toggle('is-current', item === button));
    resetTimer();
  }));
  timerStart?.addEventListener('click', () => {
    if (timerInterval) {
      stopTimer();
      timerStart.innerHTML = 'RESUME SITE DEMO <span>↗</span>';
      if (timerStatus) timerStatus.textContent = 'PAUSED / WEBSITE PREVIEW';
      renderTimer();
      return;
    }
    if (demoCompleted || secondsLeft <= 0) resetTimer();
    demoStarted = true;
    timerStart.innerHTML = 'PAUSE DEMO <span>Ⅱ</span>';
    if (timerStatus) timerStatus.textContent = '20-SECOND PREVIEW / NOT A MAC SESSION';
    timerInterval = setInterval(() => {
      secondsLeft = Math.max(0,secondsLeft - 1);
      renderTimer();
      if (secondsLeft === 0) {
        stopTimer();
        demoCompleted = true;
        timerStart.innerHTML = 'DEMO COMPLETE <span>✓</span>';
        timerStart.disabled = true;
        if (timerStatus) timerStatus.textContent = 'NICE WORK / THE PREVIEW RAN IN THIS BROWSER';
      }
    },1000);
  });
  timerReset?.addEventListener('click',resetTimer);
  renderTimer();

  const audio = document.querySelector('#track-preview');
  const player = document.querySelector('#sound-player');
  const toggle = document.querySelector('#player-toggle');
  const status = document.querySelector('#audio-status');
  const live = document.querySelector('#player-live');
  const trackTitle = document.querySelector('#track-title');
  const playerTrackName = document.querySelector('#player-track-name');
  const trackSubtitle = document.querySelector('#track-subtitle');
  const trackTime = document.querySelector('#player-time');
  const tracks = [...document.querySelectorAll('.track-option')];
  let activeTrack = 'lofi-study';
  const renderAudio = playing => {
    const selected = tracks.find(track => track.dataset.track === activeTrack);
    const title = selected?.dataset.title || 'Retro soundtrack';
    const credit = selected?.dataset.credit || '';
    player?.classList.toggle('is-playing',playing);
    if (toggle) {
      toggle.textContent = playing ? 'Ⅱ' : '▶';
      toggle.setAttribute('aria-label',`${playing ? 'Pause' : 'Play'} ${title}`);
    }
    if (trackTitle) trackTitle.textContent = title;
    if (playerTrackName) playerTrackName.textContent = title;
    if (trackSubtitle) trackSubtitle.textContent = credit;
    if (live) live.innerHTML = `<i></i> ${playing ? 'PLAYING' : 'READY'}`;
    if (status) status.textContent = playing ? 'PLAYING THE BUNDLED TRACK SAMPLE' : 'TAP PLAY TO LISTEN';
    if (trackTime) trackTime.textContent = playing ? 'NOW PLAYING' : 'OFFLINE SAMPLE';
    tracks.forEach(track => {
      const selectedNow = track.dataset.track === activeTrack;
      track.classList.toggle('is-current',selectedNow);
      track.setAttribute('aria-pressed',String(selectedNow));
    });
  };
  const setTrack = async slug => {
    const chosen = tracks.find(track => track.dataset.track === slug);
    if (!chosen || !audio) return;
    const shouldContinue = !audio.paused;
    activeTrack = slug;
    const source = `assets/audio/${slug}.mp3`;
    if (!audio.src.endsWith(source)) {
      audio.src = source;
      audio.load();
    }
    renderAudio(false);
    if (shouldContinue) {
      try { await audio.play(); renderAudio(true); }
      catch { renderAudio(false); if (status) status.textContent = 'THIS TRACK COULD NOT PLAY IN THIS BROWSER.'; }
    }
  };
  const toggleAudio = async () => {
    if (!audio) return;
    if (audio.paused) {
      if (!audio.src) {
        audio.src = `assets/audio/${activeTrack}.mp3`;
        audio.load();
      }
      try { await audio.play(); renderAudio(true); }
      catch { renderAudio(false); if (status) status.textContent = 'THIS TRACK COULD NOT PLAY IN THIS BROWSER.'; }
    } else {
      audio.pause();
      renderAudio(false);
    }
  };
  tracks.forEach(track => track.addEventListener('click',() => { void setTrack(track.dataset.track); }));
  toggle?.addEventListener('click',toggleAudio);
  audio?.addEventListener('play',() => renderAudio(true));
  audio?.addEventListener('pause',() => renderAudio(false));
  audio?.addEventListener('ended',() => { renderAudio(false); if (status) status.textContent = 'TRACK SAMPLE FINISHED'; });
  audio?.addEventListener('error',() => { renderAudio(false); if (status) status.textContent = 'TRACK SAMPLE UNAVAILABLE RIGHT NOW.'; });
  renderAudio(false);

  const heroArt = document.querySelector('[data-parallax]');
  if (heroArt && !reduceMotion.matches && matchMedia('(pointer:fine)').matches) {
    heroArt.addEventListener('pointermove',event => {
      const box = heroArt.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      heroArt.style.setProperty('--tilt-x',`${(-y*2).toFixed(2)}deg`);
      heroArt.style.setProperty('--tilt-y',`${(x*2).toFixed(2)}deg`);
    });
    heroArt.addEventListener('pointerleave',() => {
      heroArt.style.setProperty('--tilt-x','0deg');
      heroArt.style.setProperty('--tilt-y','0deg');
    });
  }
})();
