'use strict';

const CATS = {
  reise: 'Reise', bargeld: 'Bargeld', auto: 'Auto', handy: 'Technik',
  gutschein: 'Gutschein', sport: 'Sport', mode: 'Mode',
  haus: 'Haus', beauty: 'Beauty', lebensmittel: 'Lebensmittel',
};

// real: true  → gefunden auf gewinnspiele-markt.de (April 2026), url verlinkt echte Seite
const CONTESTS = [
  // ── ECHTE, AKTUELLE GEWINNSPIELE (April 2026) ──────────────────────────────
  {
    id: 'r1', real: true,
    title: 'COSMOPOLITAN × WECK – Einmachgläser & Kochbücher',
    cat: 'haus', value: null, icon: '🫙',
    deadline: '2026-04-25',
    sponsor: 'COSMOPOLITAN',
    desc: '2 WECK-Sets mit passendem Kochbuch gewinnen. Einfach das Formular ausfüllen – kostenlos und ohne Anmeldung.',
    url: 'https://www.cosmopolitan.de/gewinnspiele/mit-weck-in-die-saison-starten',
  },
  {
    id: 'r2', real: true,
    title: 'Ravensburger Kreativ-Sets für die ganze Familie',
    cat: 'haus', value: null, icon: '🎨',
    deadline: '2026-04-22',
    sponsor: 'Eltern.de',
    desc: '2 kreative Ravensburger-Produkte für Kinder und Erwachsene. Kostenloses Eltern-Club-Konto nötig.',
    url: 'https://www.eltern.de/familie-urlaub/gewinnspiele/mit-ravensburger-kreativ-gewinnen-14069928.html',
  },
  {
    id: 'r3', real: true,
    title: '3 × 2 Kinotickets – Paris Murder Mystery',
    cat: 'gutschein', value: null, icon: '🎬',
    deadline: '2026-04-16',
    sponsor: 'FÜR SIE Magazin',
    desc: '3 × 2 Kinotickets zum Filmstart von „Paris Murder Mystery" plus je einen exklusiven Schal gewinnen.',
    url: 'https://www.fuersie.de/gewinnspiele/gewinne-3-x-2-tickets-zum-kinostart-von-paris-murder-mystery-sowie-3-halstuecher-19592.html',
  },
  {
    id: 'r4', real: true,
    title: 'SHEGLAM Sweetheart Beauty-Collection',
    cat: 'beauty', value: null, icon: '💄',
    deadline: '2026-04-22',
    sponsor: 'GRAZIA × SHEGLAM',
    desc: 'Die komplette SHEGLAM Sweetheart Collection gewinnen – Make-up und Pflege für strahlende Looks.',
    url: 'https://www.grazia-magazin.de/gewinne/sheglam-sweetheart-collection-zu-gewinnen-61806.html',
  },
  {
    id: 'r5', real: true,
    title: '2 E-Bikes von Riese & Müller (Wert: 8.000 €)',
    cat: 'sport', value: 8000, icon: '⚡',
    deadline: '2026-04-30',
    sponsor: 'Runners World',
    desc: 'Zwei hochwertige E-Bikes von Riese & Müller im Gesamtwert von über 8.000 € zu gewinnen.',
    url: 'https://www.runnersworld.de',
  },
  {
    id: 'r6', real: true,
    title: 'Picknick-Korb + 10 Brixie Lokomotiv-Sets',
    cat: 'haus', value: null, icon: '🧺',
    deadline: '2026-04-14',
    sponsor: 'HOYER',
    desc: 'Einen gefüllten Picknick-Korb und 10 Brixie Lokomotiv-Bausätze gewinnen. Teilnahme via Instagram.',
    url: 'https://www.instagram.com/hoyer.de/p/DWjZyXoAbRk/',
  },

  // ── DEMO-GEWINNSPIELE ───────────────────────────────────────────────────────
  { id: 1,  title: 'VW Golf 8 GTI',                        cat: 'auto',        value: 39900, icon: '🚗', deadline: '2026-06-15', sponsor: 'Volkswagen',        desc: 'Probefahrt buchen und automatisch am Gewinnspiel teilnehmen.',                         url: '#' },
  { id: 2,  title: '7 Tage Mallorca für 2 Personen',        cat: 'reise',       value: 3200,  icon: '✈️', deadline: '2026-05-20', sponsor: 'TUI',               desc: 'All-Inclusive Urlaub inkl. Flug für 2 Personen auf den Balearen.',                    url: '#' },
  { id: 3,  title: '10.000 € Bargeld',                     cat: 'bargeld',     value: 10000, icon: '💰', deadline: '2026-05-01', sponsor: 'Postcode Lotterie', desc: 'Registrieren und an der großen Jahresverlosung teilnehmen.',                          url: '#' },
  { id: 4,  title: 'iPhone 16 Pro Max 256 GB',              cat: 'handy',       value: 1329,  icon: '📱', deadline: '2026-05-30', sponsor: 'MediaMarkt',        desc: 'Das neueste Apple Flaggschiff in Titanium Black – App herunterladen und gewinnen.', url: '#' },
  { id: 5,  title: 'Rhein-Flusskreuzfahrt für 2',           cat: 'reise',       value: 4200,  icon: '🛳️', deadline: '2026-06-01', sponsor: 'A-ROSA',            desc: '7 Nächte Vollpension auf dem Rhein inkl. Ausflügen.',                                 url: '#' },
  { id: 6,  title: '500 € Amazon-Gutschein',                cat: 'gutschein',   value: 500,   icon: '🎁', deadline: '2026-05-15', sponsor: 'Amazon.de',         desc: 'Einlösbar für Millionen Produkte – einfach Formular ausfüllen.',                      url: '#' },
  { id: 7,  title: 'E-Bike CUBE Reaction Pro',              cat: 'sport',       value: 4799,  icon: '🚲', deadline: '2026-05-31', sponsor: 'CUBE Bikes',        desc: 'Hochwertiges E-Bike für Touren und den Alltag. Newsletter abonnieren.',              url: '#' },
  { id: 8,  title: 'Samsung Galaxy S25 Ultra',              cat: 'handy',       value: 1299,  icon: '📲', deadline: '2026-06-10', sponsor: 'Samsung',           desc: '200-MP-Kamera, S Pen, 12 GB RAM – via App am Gewinnspiel teilnehmen.',              url: '#' },
  { id: 9,  title: 'Dyson Airwrap Complete Long',            cat: 'beauty',      value: 599,   icon: '💅', deadline: '2026-05-25', sponsor: 'Douglas',           desc: 'Das beliebteste Multistyling-Tool ohne extreme Hitze.',                               url: '#' },
  { id: 10, title: 'Nike Laufpaket 300 €',                  cat: 'sport',       value: 300,   icon: '👟', deadline: '2026-05-10', sponsor: 'Nike',              desc: 'Schuhe, Bekleidung und Zubehör für deine nächste Herausforderung.',                  url: '#' },
  { id: 11, title: 'Weber Spirit E-310 Gasgrill-Bundle',     cat: 'haus',        value: 799,   icon: '🔥', deadline: '2026-07-31', sponsor: 'Hornbach',          desc: 'Klassischer Gasgrill im Premium-Set mit Abdeckhaube und Zubehör.',                   url: '#' },
  { id: 12, title: 'Wellness-Wochenende Bayerischer Hof',   cat: 'reise',       value: 1800,  icon: '🛎️', deadline: '2026-06-28', sponsor: 'Bayerischer Hof',   desc: '2 Nächte 5-Sterne-Hotel München inkl. Spa, Frühstück und Gourmet-Dinner.',          url: '#' },
  { id: 13, title: '1.000 € Bargeld',                       cat: 'bargeld',     value: 1000,  icon: '💶', deadline: '2026-05-31', sponsor: 'Lotto24',           desc: 'Sofort auf dein Konto. Formular ausfüllen – keine Anmeldung nötig.',                 url: '#' },
  { id: 14, title: 'Hochzeitskleid von Pronovias',           cat: 'mode',        value: 3500,  icon: '👗', deadline: '2026-06-14', sponsor: 'Pronovias',         desc: 'Exklusives Brautkleid nach Wahl. Formular ausfüllen und Foto einsenden.',           url: '#' },
];

const today = new Date(); today.setHours(0, 0, 0, 0);
const daysLeft = d => Math.ceil((new Date(d) - today) / 86400000);
const isActive = c => daysLeft(c.deadline) > 0;
const fmtDate  = d => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtVal   = v => v != null ? v.toLocaleString('de-DE') + ' €' : '– (kostenfrei)';

function daysLabel(days) {
  if (days === 1) return 'Noch 1 Tag';
  if (days <= 7)  return `Noch ${days} Tage`;
  return 'bis ' + fmtDate(new Date(today.getTime() + days * 86400000).toISOString().split('T')[0]);
}

// ── State ──────────────────────────────────────────────────────────────────
let activeCat = 'alle', searchQ = '';

function filtered() {
  return CONTESTS
    .filter(isActive)
    .filter(c => activeCat === 'alle' || c.cat === activeCat)
    .filter(c => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
          || (CATS[c.cat] || '').toLowerCase().includes(q) || c.sponsor.toLowerCase().includes(q);
    })
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)); // soonest first
}

// ── Render card ────────────────────────────────────────────────────────────
function makeCard(c) {
  const days  = daysLeft(c.deadline);
  const urgent = days <= 7;
  const clockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const el = document.createElement('article');
  el.className = 'card' + (c.real ? ' is-real' : '');

  const href = c.url && c.url !== '#' ? c.url : null;
  const btnEl = href
    ? `<a class="btn-go" href="${href}" target="_blank" rel="noopener noreferrer">Jetzt teilnehmen →</a>`
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
      <div class="card-desc">${c.desc}</div>
      <div class="card-row">
        <span class="card-value">${fmtVal(c.value)}</span>
        <span class="card-days${urgent ? ' urgent' : ''}">${clockSvg}${daysLabel(days)}</span>
      </div>
      <div class="card-sponsor">${c.sponsor}</div>
    </div>
    ${btnEl}
  `;

  // Demo btn feedback
  if (!href) {
    el.querySelector('.btn-go').addEventListener('click', e => {
      e.currentTarget.textContent = 'Weiterleitung…';
      setTimeout(() => { e.currentTarget.textContent = 'Jetzt teilnehmen →'; }, 1400);
    });
  }

  return el;
}

// ── Render grid ────────────────────────────────────────────────────────────
function render() {
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const list  = filtered();

  grid.innerHTML = '';

  const badge = document.getElementById('active-count-badge');
  if (badge) badge.textContent = CONTESTS.filter(isActive).length + ' aktiv';

  if (list.length === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
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

render();
