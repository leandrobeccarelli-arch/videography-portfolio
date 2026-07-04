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
  { id: 'DE7z6y0i1Tq', type: 'instagram', title: 'Posing Coaching', tag: 'Instagram' },
];

/* --------------------------------------------------------------------------
   Video-Karten rendern (Thumbnail zuerst, Iframe erst bei Klick)
   -------------------------------------------------------------------------- */
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
const INSTA_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';

function createVideoCard(video, { vertical = false } = {}) {
  const card = document.createElement('article');
  card.className = 'video-card' + (video.featured ? ' featured' : '') + ' reveal';

  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'video-thumb';
  thumb.setAttribute('aria-label', 'Video abspielen: ' + video.title);

  if (video.type === 'instagram') {
    /* Instagram liefert anonym kein Thumbnail, darum eine gebrandete Kachel */
    thumb.classList.add('insta-thumb');
    const glyph = document.createElement('span');
    glyph.className = 'insta-glyph';
    glyph.innerHTML = INSTA_ICON;
    const label = document.createElement('span');
    label.className = 'insta-label';
    label.textContent = 'Reel ansehen';
    thumb.append(glyph, label);
  } else {
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    /* Shorts haben ein vertikales Thumbnail (oardefault), 16:9 das grosse maxresdefault */
    img.src = 'https://i.ytimg.com/vi/' + video.id + (vertical ? '/oardefault.jpg' : '/maxresdefault.jpg');
    img.addEventListener('error', () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg';
      } else {
        img.remove();
      }
    });

    const badge = document.createElement('span');
    badge.className = 'play-badge';
    badge.innerHTML = PLAY_ICON;

    thumb.append(img, badge);
  }

  thumb.addEventListener('click', () => playVideo(thumb, video), { once: true });

  const meta = document.createElement('div');
  meta.className = 'video-meta';
  meta.innerHTML = '<h3></h3><span></span>';
  meta.querySelector('h3').textContent = video.title;
  meta.querySelector('span').textContent = video.tag;

  card.append(thumb, meta);
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
  thumb.classList.remove('insta-thumb');
  thumb.style.cursor = 'default';
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
  if (row) SHORT_VIDEOS.forEach(v => row.appendChild(createVideoCard(v, { vertical: true })));
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
   Laufender Timecode im Hero (24 fps), reagiert auf prefers-reduced-motion
   -------------------------------------------------------------------------- */
function initTimecode() {
  const el = document.getElementById('timecode');
  if (!el) return;

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const start = performance.now();
  const pad = n => String(n).padStart(2, '0');
  let timer = null;

  const tick = () => {
    const elapsed = (performance.now() - start) / 1000;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = Math.floor(elapsed % 60);
    const f = Math.floor((elapsed % 1) * 24);
    el.textContent = 'TC ' + pad(h) + ':' + pad(m) + ':' + pad(s) + ':' + pad(f);
  };

  const update = () => {
    if (media.matches) {
      clearInterval(timer);
      timer = null;
    } else if (!timer) {
      timer = setInterval(tick, 42);
    }
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', update);
  }
  update();
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
initTimecode();
