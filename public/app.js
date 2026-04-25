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
  handy:       'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=480&h=180&fit=crop&auto=format&q=75',
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

// ── Profile (localStorage) ──────────────────────────────────────────────────
const PROFILE_KEY = 'gw_profile';

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; }
  catch { return {}; }
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

function buildBookmarklet(p) {
  const esc = s => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const code = `(function(){var d={vorname:'${esc(p.vorname)}',nachname:'${esc(p.nachname)}',email:'${esc(p.email)}',ort:'${esc(p.ort)}',plz:'${esc(p.plz)}',geb:'${esc(p.geburtsdatum)}'};var filled=[],missed=[];function tryFill(sel,val,label){if(!val)return;var el=null;for(var s of sel){el=document.querySelector(s);if(el)break;}if(el){el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));filled.push(label);}else{missed.push(label);}}tryFill(['input[type=email]','input[name*=email i]','input[id*=email i]','input[placeholder*=mail i]'],d.email,'E-Mail');tryFill(['input[name*=vorname i]','input[name*=firstname i]','input[name*=fname i]','input[placeholder*=Vorname i]','input[autocomplete=given-name]'],d.vorname,'Vorname');tryFill(['input[name*=nachname i]','input[name*=lastname i]','input[name*=lname i]','input[placeholder*=Nachname i]','input[autocomplete=family-name]'],d.nachname,'Nachname');tryFill(['input[name*=ort i]','input[name*=city i]','input[name*=stadt i]','input[placeholder*=Ort i]','input[placeholder*=Stadt i]','input[autocomplete=address-level2]'],d.ort,'Wohnort');tryFill(['input[name*=plz i]','input[name*=zip i]','input[name*=postal i]','input[placeholder*=PLZ i]','input[autocomplete=postal-code]'],d.plz,'PLZ');tryFill(['input[name*=geburts i]','input[name*=bday i]','input[name*=dob i]','input[type=date]','input[autocomplete=bday]'],d.geb,'Geburtsdatum');var box=document.createElement('div');box.style='position:fixed;top:16px;right:16px;z-index:2147483647;background:#07070f;border:1px solid rgba(99,179,237,0.45);border-radius:12px;padding:16px 20px;color:#f0f0f5;font-family:sans-serif;font-size:13px;max-width:280px;box-shadow:0 8px 32px rgba(0,0,0,.6)';box.innerHTML='<strong style=color:#63b3ed>Gewinnspiele AutoFill<\\/strong><br>';if(filled.length)box.innerHTML+='<span style=color:#68d391>✓ '+filled.join(', ')+'<\\/span><br>';if(missed.length)box.innerHTML+='<span style=color:#fc8181>✗ Nicht gefunden: '+missed.join(', ')+'<\\/span><br>';if(!filled.length&&!missed.length)box.innerHTML+='<span style=color:#fc8181>Keine passenden Felder gefunden<\\/span><br>';box.innerHTML+='<small style=color:rgba(240,240,245,0.4)>Schließt in 8 Sek.<\\/small>';var x=document.createElement('button');x.textContent='×';x.style='position:absolute;top:6px;right:10px;background:none;border:none;color:#f0f0f5;font-size:18px;cursor:pointer';x.onclick=function(){box.remove()};box.appendChild(x);document.body.appendChild(box);setTimeout(function(){box.remove()},8000);})();`;
  return 'javascript:' + encodeURIComponent(code);
}

// ── Participations (localStorage) ──────────────────────────────────────────
const LS_KEY = 'gw_participations';

function loadParticipations() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function saveParticipation(c) {
  const list = loadParticipations();
  if (list.some(p => p.id === c.id)) return;
  list.push({ id: c.id, title: c.title, cat: c.cat, deadline: c.deadline,
              sponsor: c.sponsor, url: c.url || '#', draw_date: c.draw_date || null,
              joinedAt: new Date().toISOString() });
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function removeParticipation(id) {
  const list = loadParticipations().filter(p => p.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  renderParticipations();
  const btn = document.querySelector(`.part-btn[data-id="${id}"]`);
  if (btn) setPartBtnState(btn, false);
  updatePartBadge();
}

function hasParticipated(id) {
  return loadParticipations().some(p => p.id === id);
}

function setPartBtnState(btn, joined) {
  btn.textContent = joined ? 'Teilgenommen ✓' : '+ Teilgenommen';
  btn.classList.toggle('joined', joined);
}

function updatePartBadge() {
  const n    = loadParticipations().length;
  const link = document.getElementById('part-header-link');
  const cnt  = document.getElementById('part-header-count');
  if (!link || !cnt) return;
  cnt.textContent = n;
  link.classList.toggle('hidden', n === 0);
}

// ── Deadline notifications ─────────────────────────────────────────────────
const NOTIF_KEY = 'gw_notified';

async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  updateNotifBtn();
  if (result === 'granted') checkDeadlineNotifications();
  return result === 'granted';
}

function checkDeadlineNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const list    = loadParticipations();
  const todayStr = new Date().toISOString().split('T')[0];
  let notified;
  try { notified = JSON.parse(localStorage.getItem(NOTIF_KEY)) || {}; }
  catch { notified = {}; }

  list.forEach(p => {
    const d = daysLeft(p.deadline);
    if (d < 0 || d > 3) return;
    const key = `${p.id}_${todayStr}`;
    if (notified[key]) return;
    const label = d === 0 ? 'läuft heute ab!'
                : d === 1 ? 'läuft morgen ab!'
                : `läuft in ${d} Tagen ab!`;
    new Notification('🏆 Gewinnspiel ' + label, { body: p.title, tag: String(p.id) });
    notified[key] = true;
  });

  // clean entries older than 7 days
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  Object.keys(notified).forEach(k => { if ((k.split('_')[1] || '') < cutoff) delete notified[k]; });
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notified));
}

function updateNotifBtn() {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;
  const state = !('Notification' in window)      ? 'unsupported'
              : Notification.permission === 'granted' ? 'granted'
              : Notification.permission === 'denied'  ? 'denied'
              : 'default';
  btn.dataset.state = state;
  btn.title = state === 'granted'     ? 'Erinnerungen aktiv'
            : state === 'denied'      ? 'Benachrichtigungen blockiert (Browser-Einstellungen)'
            : state === 'unsupported' ? 'Benachrichtigungen werden nicht unterstützt'
            : 'Erinnerungen aktivieren';
}

// ── Sponsor logo badge ─────────────────────────────────────────────────────
function addSponsorLogo(container, url, sponsor) {
  if (!url || url === '#') return;
  let hostname;
  try { hostname = new URL(url).hostname.replace(/^www\./, ''); } catch { return; }

  const wrap = document.createElement('div');
  wrap.className = 'sponsor-logo-wrap';
  const img = document.createElement('img');
  img.src = 'https://logo.clearbit.com/' + hostname;
  img.alt = sponsor;
  img.className = 'sponsor-logo';
  img.loading = 'lazy';
  img.addEventListener('error', () => wrap.remove());
  wrap.appendChild(img);
  container.appendChild(wrap);
}

// ── Shared participation button ────────────────────────────────────────────
function makePartBtn(c) {
  const btn = document.createElement('button');
  btn.className = 'part-btn';
  btn.dataset.id = c.id;
  setPartBtnState(btn, hasParticipated(c.id));
  btn.addEventListener('click', () => {
    if (hasParticipated(c.id)) {
      removeParticipation(c.id);
    } else {
      saveParticipation(c);
      setPartBtnState(btn, true);
      renderParticipations();
      updatePartBadge();
    }
  });
  return btn;
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

  addSponsorLogo(el.querySelector('.card-img-wrap'), c.url, c.sponsor);
  el.appendChild(makePartBtn(c));
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
  el.id = 'card-' + c.id;

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

  addSponsorLogo(el.querySelector('.card-img-wrap'), c.url, c.sponsor);
  el.appendChild(makePartBtn(c));
  return el;
}

// ── Sync draw_date from API into stored participations ─────────────────────
function syncDrawDates(contestList) {
  const parts = loadParticipations();
  if (parts.length === 0) return;
  const map = new Map(contestList.map(c => [c.id, c.draw_date ?? null]));
  let changed = false;
  parts.forEach(p => {
    if (map.has(p.id) && p.draw_date !== map.get(p.id)) {
      p.draw_date = map.get(p.id);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(LS_KEY, JSON.stringify(parts));
    renderParticipations();
  }
}

// ── Render Favorites ───────────────────────────────────────────────────────
async function renderFavorites() {
  const grid    = document.getElementById('favorites-grid');
  const section = document.getElementById('favorites-section');
  if (!grid) return;

  const res = await fetch('/api/contests');
  if (!res.ok) return;
  const all = await res.json();

  syncDrawDates(all);

  // Favoriten: manuell im Admin-Panel markiert (is_favorite = 1)
  const favs = all.filter(c => c.is_favorite);

  if (favs.length === 0) {
    section.classList.add('hidden');
    return;
  }

  grid.innerHTML = '';
  favs.forEach(c => grid.appendChild(makeFavCard(c)));
}

// ── Scroll to card in grid ────────────────────────────────────────────────
function scrollToCard(id) {
  const el = document.getElementById('card-' + id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('card-highlight');
  setTimeout(() => el.classList.remove('card-highlight'), 5000);
  return true;
}

// ── Render Participations ──────────────────────────────────────────────────
function renderParticipations() {
  const section = document.getElementById('part-section');
  const grid    = document.getElementById('part-grid');
  const badge   = document.getElementById('part-count-badge');
  if (!section || !grid) return;

  const list = loadParticipations();
  if (list.length === 0) { section.classList.add('hidden'); return; }

  section.classList.remove('hidden');
  if (badge) badge.textContent = list.length;

  // Upcoming soonest first, expired (days < 0) at bottom
  const sorted = list
    .map(p => ({ ...p, _days: daysLeft(p.deadline) }))
    .sort((a, b) => {
      const aExp = a._days < 0, bExp = b._days < 0;
      if (aExp !== bExp) return aExp ? 1 : -1;
      return aExp ? b._days - a._days : a._days - b._days;
    });

  grid.innerHTML = '';
  sorted.forEach(p => {
    const expired = p._days < 0;
    const urgent  = !expired && p._days <= 7;
    let dText;
    if (expired)     dText = `Auslosung war am ${fmtDate(p.deadline)}`;
    else if (urgent) dText = `Noch ${p._days} Tag${p._days === 1 ? '' : 'e'} · ${fmtDate(p.deadline)}`;
    else             dText = `bis ${fmtDate(p.deadline)}`;

    const card = document.createElement('div');
    card.className = 'part-card' + (expired ? ' expired' : '');
    const drawLine = p.draw_date
      ? `<span class="part-card-draw">Auslosung: ${p.draw_date}</span>`
      : `<span class="part-card-draw not-found">Auslosung: nicht angegeben</span>`;

    card.innerHTML = `
      <div class="part-card-main">
        <div class="part-card-title">${p.title}</div>
        <div class="part-card-meta">
          <span class="part-card-deadline${urgent ? ' urgent' : expired ? ' expired-date' : ''}">${dText}</span>
          <span class="part-card-sponsor">${p.sponsor}</span>
        </div>
        ${drawLine}
      </div>
      <button class="part-remove" data-id="${p.id}" aria-label="Entfernen">×</button>
    `;
    card.querySelector('.part-remove').addEventListener('click', () => removeParticipation(p.id));
    card.addEventListener('click', e => {
      if (e.target.closest('.part-remove')) return;
      if (!scrollToCard(p.id)) {
        // Card filtered out — reset to show all, then scroll
        activeCat = 'alle';
        searchQ = '';
        catBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === 'alle'));
        document.getElementById('search').value = '';
        render().then(() => scrollToCard(p.id));
      }
    });
    grid.appendChild(card);
  });
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
    const heroCount = document.getElementById('hero-contest-count');
    if (heroCount) heroCount.textContent = list.length;
  }

  grid.innerHTML = '';
  if (list.length === 0) {
    empty.classList.remove('hidden');
  } else {
    list.forEach(c => grid.appendChild(makeCard(c)));
  }
}

// ── Events ─────────────────────────────────────────────────────────────────
const catBtns = document.querySelectorAll('.cat');
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    catBtns.forEach(b => b.classList.remove('active'));
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

// ── Profile modal ───────────────────────────────────────────────────────────
function openProfileModal() {
  const p = loadProfile();
  document.getElementById('pf-vorname').value      = p.vorname      || '';
  document.getElementById('pf-nachname').value     = p.nachname     || '';
  document.getElementById('pf-email').value        = p.email        || '';
  document.getElementById('pf-ort').value          = p.ort          || '';
  document.getElementById('pf-plz').value          = p.plz          || '';
  document.getElementById('pf-geb').value          = p.geburtsdatum || '';
  updateBookmarkletLink();
  document.getElementById('profile-modal').classList.remove('hidden');
  document.getElementById('profile-modal-backdrop').classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
  document.getElementById('profile-modal-backdrop').classList.add('hidden');
}

function saveProfileForm() {
  const p = {
    vorname:      document.getElementById('pf-vorname').value.trim(),
    nachname:     document.getElementById('pf-nachname').value.trim(),
    email:        document.getElementById('pf-email').value.trim(),
    ort:          document.getElementById('pf-ort').value.trim(),
    plz:          document.getElementById('pf-plz').value.trim(),
    geburtsdatum: document.getElementById('pf-geb').value.trim(),
  };
  saveProfile(p);
  updateBookmarkletLink();
  updateProfileBadge();
  const btn = document.getElementById('pf-save-btn');
  btn.textContent = 'Gespeichert ✓';
  setTimeout(() => { btn.textContent = 'Speichern'; }, 2000);
}

function updateBookmarkletLink() {
  const p    = loadProfile();
  const link = document.getElementById('pf-bookmarklet');
  if (!link) return;
  link.href = buildBookmarklet(p);
  const warn = document.getElementById('pf-bm-warn');
  if (warn) warn.classList.toggle('hidden', !!(p.vorname && p.email));
}

function updateProfileBadge() {
  const p = loadProfile();
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.classList.toggle('has-profile', !!(p.email));
  });
}

// ── Profile event wiring ────────────────────────────────────────────────────
document.querySelectorAll('.profile-btn').forEach(btn => btn.addEventListener('click', openProfileModal));
document.getElementById('profile-modal-close').addEventListener('click', closeProfileModal);
document.getElementById('profile-modal-backdrop').addEventListener('click', closeProfileModal);
document.getElementById('pf-save-btn').addEventListener('click', saveProfileForm);
['pf-vorname','pf-nachname','pf-email','pf-ort','pf-plz','pf-geb']
  .forEach(id => document.getElementById(id).addEventListener('input', updateBookmarkletLink));

document.getElementById('notif-btn').addEventListener('click', requestNotificationPermission);

document.getElementById('part-collapse-btn').addEventListener('click', () => {
  const section = document.getElementById('part-section');
  const isCollapsed = section.classList.contains('collapsed');

  if (isCollapsed) {
    section.classList.remove('collapsed');
    section.classList.add('expanding');
    document.querySelectorAll('#part-grid .part-card').forEach((card, i) => {
      card.style.animationDelay = (i * 70) + 'ms';
    });
    setTimeout(() => {
      section.classList.remove('expanding');
      document.querySelectorAll('#part-grid .part-card').forEach(card => {
        card.style.animationDelay = '';
      });
    }, 700);
  } else {
    section.classList.add('collapsed');
  }
});
updateNotifBtn();
checkDeadlineNotifications();

renderParticipations();
renderFavorites();
render();
updatePartBadge();
updateProfileBadge();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
