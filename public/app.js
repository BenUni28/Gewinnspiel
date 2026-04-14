'use strict';

const CATS = {
  reise: 'Reise', bargeld: 'Bargeld', auto: 'Auto', handy: 'Technik',
  gutschein: 'Gutschein', sport: 'Sport', mode: 'Mode',
  haus: 'Haus', beauty: 'Beauty', lebensmittel: 'Lebensmittel',
};

// Category header images (Unsplash, free to use)
const CAT_IMAGES = {
  reise:       'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=480&h=180&fit=crop&auto=format&q=75',
  bargeld:     'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=480&h=180&fit=crop&auto=format&q=75',
  auto:        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=480&h=180&fit=crop&auto=format&q=75',
  handy:       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=180&fit=crop&auto=format&q=75',
  gutschein:   'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=480&h=180&fit=crop&auto=format&q=75',
  sport:       'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=480&h=180&fit=crop&auto=format&q=75',
  mode:        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=480&h=180&fit=crop&auto=format&q=75',
  haus:        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=480&h=180&fit=crop&auto=format&q=75',
  beauty:      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=480&h=180&fit=crop&auto=format&q=75',
  lebensmittel:'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=480&h=180&fit=crop&auto=format&q=75',
};

const today = new Date(); today.setHours(0, 0, 0, 0);
const daysLeft = d => Math.ceil((new Date(d) - today) / 86400000);
const fmtDate  = d => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtVal   = v => v != null ? Number(v).toLocaleString('de-DE') + ' €' : '– (kostenfrei)';

function daysLabel(days) {
  if (days === 1) return 'Noch 1 Tag';
  if (days <= 7)  return `Noch ${days} Tage`;
  return 'bis ' + fmtDate(new Date(today.getTime() + days * 86400000).toISOString().split('T')[0]);
}

// ── Favorites card ─────────────────────────────────────────────────────────
function makeFavCard(c) {
  const days   = daysLeft(c.deadline);
  const urgent = days <= 7;
  const clock  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const hasUrl = c.url && c.url !== '#';
  const img    = CAT_IMAGES[c.cat] || CAT_IMAGES['gutschein'];

  const el = document.createElement('div');
  el.className = 'fav-card';
  el.innerHTML = `
    <span class="fav-badge">★ Favorit</span>
    <div class="card-img-wrap">
      <img class="card-img" src="${img}" alt="${CATS[c.cat] || c.cat}" loading="lazy" />
    </div>
    <div class="fav-top">
      <div class="fav-head">
        <div class="fav-cat">${CATS[c.cat] || c.cat}</div>
        <div class="fav-title">${c.title}</div>
      </div>
    </div>
    <div class="fav-body">
      <div class="fav-row">
        <span class="fav-value">${fmtVal(c.value_eur)}</span>
        <span class="fav-days${urgent ? ' urgent' : ''}">${clock}${daysLabel(days)}</span>
      </div>
      <div class="fav-sponsor">${c.sponsor}</div>
    </div>
    ${hasUrl
      ? `<a class="btn-fav" href="${c.url}" target="_blank" rel="noopener noreferrer">Jetzt teilnehmen →</a>`
      : `<button class="btn-fav">Jetzt teilnehmen →</button>`}
  `;
  return el;
}

// ── State ──────────────────────────────────────────────────────────────────
let activeCat = 'alle', searchQ = '', totalActive = 0;

// ── API ────────────────────────────────────────────────────────────────────
async function fetchContests() {
  const p = new URLSearchParams();
  if (activeCat !== 'alle') p.set('cat', activeCat);
  if (searchQ) p.set('q', searchQ);
  const res = await fetch('/api/contests?' + p);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ── Card ───────────────────────────────────────────────────────────────────
function makeCard(c) {
  const days   = daysLeft(c.deadline);
  const urgent = days <= 7;
  const clock  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const img    = CAT_IMAGES[c.cat] || CAT_IMAGES['gutschein'];

  const el  = document.createElement('article');
  el.className = 'card' + (c.is_real ? ' is-real' : '');

  const hasUrl = c.url && c.url !== '#';
  const btn    = hasUrl
    ? `<a class="btn-go" href="${c.url}" target="_blank" rel="noopener noreferrer">Jetzt teilnehmen →</a>`
    : `<button class="btn-go">Jetzt teilnehmen →</button>`;

  el.innerHTML = `
    <div class="card-img-wrap">
      <img class="card-img" src="${img}" alt="${CATS[c.cat] || c.cat}" loading="lazy" />
    </div>
    <div class="card-top">
      <div class="card-head">
        <div class="card-cat">${CATS[c.cat] || c.cat}</div>
        <div class="card-title">${c.title}</div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-desc">${c.description}</div>
      <div class="card-row">
        <span class="card-value">${fmtVal(c.value_eur)}</span>
        <span class="card-days${urgent ? ' urgent' : ''}">${clock}${daysLabel(days)}</span>
      </div>
      <div class="card-sponsor">${c.sponsor}</div>
    </div>
    ${btn}
  `;

  if (!hasUrl) {
    el.querySelector('.btn-go').addEventListener('click', e => {
      const b = e.currentTarget;
      b.textContent = 'Weiterleitung…';
      setTimeout(() => { b.textContent = 'Jetzt teilnehmen →'; }, 1400);
    });
  }

  return el;
}

// ── Render Favorites ───────────────────────────────────────────────────────
async function renderFavorites() {
  const grid    = document.getElementById('favorites-grid');
  const section = document.getElementById('favorites-section');
  if (!grid) return;

  const res = await fetch('/api/contests');
  if (!res.ok) return;
  const all = await res.json();

  // Favoriten: manuell im Admin-Panel markiert (is_favorite = 1)
  const favs = all.filter(c => c.is_favorite);

  if (favs.length === 0) {
    section.classList.add('hidden');
    return;
  }

  grid.innerHTML = '';
  favs.forEach(c => grid.appendChild(makeFavCard(c)));
}

// ── Render ─────────────────────────────────────────────────────────────────
async function render() {
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');

  grid.innerHTML = '<p style="color:var(--muted);padding:60px 0;text-align:center;grid-column:1/-1">Laden…</p>';
  empty.classList.add('hidden');

  let list;
  try {
    list = await fetchContests();
  } catch {
    grid.innerHTML = '<p style="color:var(--red);padding:60px 0;text-align:center;grid-column:1/-1">Fehler beim Laden.</p>';
    return;
  }

  if (activeCat === 'alle' && !searchQ) {
    totalActive = list.length;
    const badge = document.getElementById('active-count-badge');
    if (badge) badge.textContent = totalActive + ' aktiv';
  }

  grid.innerHTML = '';
  if (list.length === 0) {
    empty.classList.remove('hidden');
  } else {
    list.forEach(c => grid.appendChild(makeCard(c)));
  }
}

// ── Events ─────────────────────────────────────────────────────────────────
document.querySelectorAll('.cat').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    render();
  });
});

let timer;
document.getElementById('search').addEventListener('input', e => {
  clearTimeout(timer);
  timer = setTimeout(() => { searchQ = e.target.value.trim(); render(); }, 180);
});

renderFavorites();
render();
