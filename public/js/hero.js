'use strict';

const PRIZES = [
  {
    src:   '/images/auto.png',
    label: 'Mercedes AMG',
    sub:   'Sports & Auto',
  },
  {
    src:   '/images/bike.png',
    label: 'Premium E-Bike',
    sub:   'Bikes & Mobility',
  },
  {
    src:   '/images/reise.png',
    label: 'Traumreise',
    sub:   'Travel & Vacation',
  },
  {
    src:   '/images/smartwatch.png',
    label: 'Apple Watch',
    sub:   'Wearables & Tech',
  },
  {
    src:   '/images/kopfhoerer.png',
    label: 'Studio Kopfhörer',
    sub:   'Audio & Sound',
  },
];

const PAUSE_MS  = 2000;
const TRAVEL_MS = 2400;

const N       = PRIZES.length;
const SEGMENT = (Math.PI * 2) / N;

const easeInOutCubic = t =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const getRadiusX = () => Math.min(280, window.innerWidth * 0.24);

function computeSlide(index, rotation) {
  const worldAngle = index * SEGMENT - rotation;
  const sin   = Math.sin(worldAngle);
  const cos   = Math.cos(worldAngle);
  const depth = (cos + 1) / 2;
  return {
    x:       sin * getRadiusX(),
    yArc:    -8 + (1 - depth) * 16,
    scale:   0.32 + depth * 0.68,
    opacity: 0.10 + depth * 0.90,
    blur:    (1 - depth) * 6,
    zIndex:  Math.round(depth * 100),
  };
}

function init() {
  const container = document.getElementById('hero-carousel');
  if (!container) return;

  const stage  = container.querySelector('.carousel-stage');
  const labelEl = container.querySelector('.carousel-label');
  const subEl   = container.querySelector('.carousel-sub');
  const dots    = container.querySelectorAll('.carousel-dot');

  // Build slide elements
  const slides = PRIZES.map(p => {
    const wrap = document.createElement('div');
    wrap.className = 'carousel-slide';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'carousel-img-wrap';
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.label;
    img.draggable = false;
    imgWrap.appendChild(img);
    wrap.appendChild(imgWrap);
    stage.appendChild(wrap);
    return wrap;
  });

  const state = {
    rotation:   0,
    phase:      'pause',
    phaseStart: performance.now(),
    travelFrom: 0,
    travelTo:   0,
    lastActive: -1,
  };

  function tick(now) {
    const elapsed = now - state.phaseStart;

    if (state.phase === 'pause') {
      if (elapsed >= PAUSE_MS) {
        state.phase      = 'travel';
        state.phaseStart = now;
        state.travelFrom = state.rotation;
        state.travelTo   = state.rotation + SEGMENT;
      }
    } else {
      const t = Math.min(1, elapsed / TRAVEL_MS);
      state.rotation = state.travelFrom + (state.travelTo - state.travelFrom) * easeInOutCubic(t);
      if (t >= 1) {
        state.rotation   = state.travelTo;
        state.phase      = 'pause';
        state.phaseStart = now;
      }
    }

    // Apply transforms
    slides.forEach((el, i) => {
      const s = computeSlide(i, state.rotation);
      el.style.transform = `translate(-50%, -50%) translate3d(${s.x}px, ${s.yArc}px, 0) scale(${s.scale})`;
      el.style.opacity   = s.opacity;
      el.style.filter    = `blur(${s.blur.toFixed(2)}px)`;
      el.style.zIndex    = s.zIndex;
    });

    // Active item
    const norm = ((state.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx  = Math.round(norm / SEGMENT) % N;
    if (idx !== state.lastActive) {
      state.lastActive = idx;
      if (labelEl) labelEl.textContent = PRIZES[idx].label;
      if (subEl)   subEl.textContent   = PRIZES[idx].sub;
      dots.forEach((d, di) => d.classList.toggle('active', di === idx));
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', init);
