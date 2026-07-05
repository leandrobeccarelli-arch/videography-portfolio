/* ==========================================================================
   Leandro Beccarelli · Portfolio
   Video-Konfiguration und Interaktionen
   ========================================================================== */

/* --------------------------------------------------------------------------
   VIDEOS
   Die id ist der Teil nach "watch?v=" bzw. "shorts/" in der YouTube-URL.
   -------------------------------------------------------------------------- */
const WIDE_VIDEOS = [
  { id: 'ldGp9VNNmbI', title: 'SNBF 2023 · Showday', tag: 'Sandro Krattiger' },
  { id: 'WH0Vz3FKq6c', title: 'Wie fit nach 12 Jahren Krafttraining?', tag: 'Ramon Limacher' },
  { id: '0qbg4fMq2Bc', title: 'In 60 Minuten mehr erreichen', tag: 'Ramon Limacher' },
  { id: 'MWH2JhGH71g', title: 'Schulter/Arm Tag', tag: 'Ramon Limacher' },
];

const SHORT_VIDEOS = [
  { id: 'gPVQ4f9mvxU', title: 'Wenn der IT-Verantwortliche ausfällt', tag: 'HEAD IT' },
  { id: 'B-JqZrUnTew', title: 'IT-Betreuung im Unternehmen', tag: 'HEAD IT' },
  { id: 'K7HIbj06O-k', title: 'Microsoft Defender', tag: 'HEAD IT' },
  { id: 'cku4G-28oPI', title: 'IT-Onboarding und Offboarding', tag: 'HEAD IT' },
  { id: '8N5gKsFf3GI', title: 'IT-Security Mythen', tag: 'HEAD IT' },
  { id: 'DE7z6y0i1Tq', type: 'instagram', title: 'Posing Coaching', tag: 'Instagram', thumb: 'assets/insta-DE7z6y0i1Tq.jpg' },
  { id: 'C8E5nelNEVl', type: 'instagram', title: 'Gym Reel', tag: 'Instagram', thumb: 'assets/insta-C8E5nelNEVl.jpg' },
];

/* --------------------------------------------------------------------------
   Video-Karten rendern (Thumbnail zuerst, Iframe erst bei Klick)
   -------------------------------------------------------------------------- */
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

function createVideoCard(video, { vertical = false } = {}) {
  const card = document.createElement('article');
  card.className = 'video-card' + (video.featured ? ' featured' : '') + ' reveal';

  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'video-thumb';
  thumb.setAttribute('aria-label', 'Video abspielen: ' + video.title);

  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  /* Instagram-Reels nutzen lokal extrahierte Thumbnails, YouTube die ytimg-CDN
     (Shorts vertikal via oardefault, 16:9 via maxresdefault) */
  img.src = video.thumb
    ? video.thumb
    : 'https://i.ytimg.com/vi/' + video.id + (vertical ? '/oardefault.jpg' : '/maxresdefault.jpg');
  if (!video.thumb) {
    img.addEventListener('error', () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg';
      } else {
        img.remove();
      }
    });
  }

  const badge = document.createElement('span');
  badge.className = 'play-badge';
  badge.innerHTML = PLAY_ICON;

  thumb.append(img, badge);
  thumb.addEventListener('click', () => playVideo(thumb, video), { once: true });

  card.append(thumb);
  return card;
}

function playVideo(thumb, video) {
  const iframe = document.createElement('iframe');
  iframe.src = video.type === 'instagram'
    ? 'https://www.instagram.com/p/' + video.id + '/embed/'
    : 'https://www.youtube-nocookie.com/embed/' + video.id
      + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
  iframe.title = video.title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  thumb.replaceChildren(iframe);
  thumb.classList.add('is-playing');
  thumb.style.cursor = 'default';
}

/* Fisher-Yates: Shorts bei jedem Besuch in neuer Reihenfolge */
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderVideos() {
  const grid = document.getElementById('videoGrid');
  const row = document.getElementById('shortsRow');
  if (grid) {
    WIDE_VIDEOS.forEach(v => grid.appendChild(createVideoCard(v)));
    /* Bei durch 3 teilbarer Anzahl Nicht-Featured-Videos ein 3-Spalten-Raster nutzen */
    const regular = WIDE_VIDEOS.filter(v => !v.featured).length;
    if (regular >= 3 && regular % 3 === 0) grid.classList.add('cols-3');
  }
  if (row) {
    const shorts = shuffle(SHORT_VIDEOS);
    shorts.forEach(v => row.appendChild(createVideoCard(v, { vertical: true })));
    /* Zweiter, identischer Satz (gleiche Reihenfolge!) für die nahtlose Endlos-Rotation */
    shorts.forEach(v => {
      const clone = createVideoCard(v, { vertical: true });
      clone.classList.remove('reveal');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('.video-thumb').tabIndex = -1;
      row.appendChild(clone);
    });
  }
}

/* --------------------------------------------------------------------------
   Scroll-Reveal
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Header-Zustand beim Scrollen
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  const update = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Horizontale Scroller (Shorts, Filmstrip) mit Pfeiltasten bedienbar
   -------------------------------------------------------------------------- */
function initScrollerKeyboard(row) {
  if (!row) return;

  /* Snap-Punkte ausserhalb des Scrollbereichs lassen Chrome programmatische
     Smooth-Scrolls auf Position 0 zurückschnappen. Darum wird das Snapping
     während der Tastaturnavigation deaktiviert und erst bei der nächsten
     Pointer-Interaktion wiederhergestellt. */
  const restoreSnap = () => { row.style.scrollSnapType = ''; };
  row.addEventListener('pointerdown', restoreSnap);
  row.addEventListener('touchstart', restoreSnap, { passive: true });

  row.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const items = Array.from(row.children);
    if (!items.length) return;
    row.style.scrollSnapType = 'none';
    const offsets = items.map(c => c.offsetLeft - items[0].offsetLeft);
    const maxScroll = row.scrollWidth - row.clientWidth;
    const current = row.scrollLeft;
    let target;
    if (e.key === 'ArrowRight') {
      target = offsets.find(o => o > current + 4);
      if (target === undefined) target = maxScroll;
    } else {
      target = offsets.slice().reverse().find(o => o < current - 4);
      if (target === undefined) target = 0;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left: Math.min(target, maxScroll), behavior: reduce ? 'auto' : 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   Endlos-Rotation der Shorts.
   Pausiert bei Hover, Touch, Tastaturfokus, ausserhalb des Viewports,
   bei prefers-reduced-motion und sobald ein Video abspielt.
   -------------------------------------------------------------------------- */
function initShortsAutoLoop(row) {
  if (!row) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SPEED = 35; /* Pixel pro Sekunde */
  let paused = false;
  let inView = false;
  let resumeTimer = null;
  let pos = 0;
  let lastTime = null;

  const pause = () => {
    clearTimeout(resumeTimer);
    paused = true;
  };
  const resume = (delay) => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = false; }, delay);
  };

  row.addEventListener('pointerenter', pause);
  row.addEventListener('pointerleave', () => resume(600));
  row.addEventListener('touchstart', pause, { passive: true });
  row.addEventListener('touchend', () => resume(2500), { passive: true });
  row.addEventListener('focusin', pause);
  row.addEventListener('focusout', () => resume(600));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }).observe(row);
  } else {
    inView = true;
  }

  const gapPx = () => parseFloat(getComputedStyle(row).columnGap) || 0;
  let target = null;

  const step = (t) => {
    if (lastTime === null) lastTime = t;
    const dt = Math.min((t - lastTime) / 1000, 0.1);
    lastTime = t;
    const playing = !!row.querySelector('.is-playing');
    const period = (row.scrollWidth + gapPx()) / 2;

    if (target !== null) {
      /* Pfeil-Navigation: sanft zum Ziel gleiten */
      if (reduce.matches) {
        pos = target;
      } else {
        pos += (target - pos) * Math.min(1, dt * 6);
      }
      if (Math.abs(target - pos) < 0.8) {
        pos = target;
        target = null;
      }
      if (playing) {
        /* Während ein Video läuft nicht wrappen, sonst würde das laufende
           Embed beim Satz-Sprung optisch verschwinden */
        const max = row.scrollWidth - row.clientWidth;
        pos = Math.min(Math.max(pos, 0), max);
        if (target !== null) target = Math.min(Math.max(target, 0), max);
      } else {
        if (pos >= period) { pos -= period; if (target !== null) target -= period; }
        if (pos < 0) { pos += period; if (target !== null) target += period; }
      }
      row.scrollLeft = pos;
    } else if (inView && !paused && !reduce.matches && !playing) {
      /* Manuelle Verschiebung (Wheel, Swipe) übernehmen statt überschreiben */
      if (Math.abs(row.scrollLeft - pos) > 1.5) pos = row.scrollLeft;
      pos += SPEED * dt;
      /* Beide Sätze sind identisch: nach einer Satzbreite nahtlos zurückspringen */
      if (pos >= period) pos -= period;
      row.scrollLeft = pos;
    } else {
      pos = row.scrollLeft;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  /* Pfeile: eine Kartenbreite vor oder zurück, Loop inklusive */
  const stepWidth = () => {
    const first = row.children[0];
    return first ? first.offsetWidth + gapPx() : 320;
  };
  const nudge = (dir) => {
    pause();
    resume(4000);
    if (target === null) target = pos;
    target += dir * stepWidth();
  };
  const prev = document.getElementById('shortsPrev');
  const next = document.getElementById('shortsNext');
  if (prev) prev.addEventListener('click', () => nudge(-1));
  if (next) next.addEventListener('click', () => nudge(1));
}

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();
renderVideos();
initReveal();
initHeader();
initScrollerKeyboard(document.getElementById('shortsRow'));
initScrollerKeyboard(document.getElementById('filmstrip'));
initShortsAutoLoop(document.getElementById('shortsRow'));
