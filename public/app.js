'use strict';

const CATS = {
  reise: 'Reise', bargeld: 'Bargeld', auto: 'Auto', handy: 'Technik',
  gutschein: 'Gutschein', sport: 'Sport', mode: 'Mode',
  haus: 'Haus', beauty: 'Beauty', lebensmittel: 'Lebensmittel',
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

  const el = document.createElement('div');
  el.className = 'fav-card';
  el.innerHTML = `
    <span class="fav-badge">★ Favorit</span>
    <div class="fav-top">
      <div class="fav-emoji">${c.icon}</div>
      <div class="fav-head">
        <div class="fav-cat">${CATS[c.cat] || c.cat}</div>
        <div class="fav-title">${c.title}</div>
      </div>
    </div>
    <div class="fav-row">
      <span class="fav-value">${fmtVal(c.value_eur)}</span>
      <span class="fav-days${urgent ? ' urgent' : ''}">${clock}${daysLabel(days)}</span>
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

  const el  = document.createElement('article');
  el.className = 'card' + (c.is_real ? ' is-real' : '');

  const hasUrl = c.url && c.url !== '#';
  const btn    = hasUrl
    ? `<a class="btn-go" href="${c.url}" target="_blank" rel="noopener noreferrer">Jetzt teilnehmen →</a>`
    : `<button class="btn-go">Jetzt teilnehmen →</button>`;

  el.innerHTML = `
    <div class="card-top">
      <div class="card-emoji">${c.icon}</div>
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

  // Fetch all real contests (no filter) for favorites
  const res = await fetch('/api/contests');
  if (!res.ok) return;
  const all = await res.json();

  // Favoriten: echt + direkte URL + sortiert nach Deadline
  const favs = all
    .filter(c => c.is_real && c.url && c.url !== '#')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

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
