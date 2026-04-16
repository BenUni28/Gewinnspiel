'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const SEED = [
  // ── Echte Gewinnspiele (April 2026, Quelle: gewinnspiele-markt.de) ──────
  {
    title: 'COSMOPOLITAN × WECK – Einmachgläser & Kochbücher',
    cat: 'haus', value_eur: null, icon: '🫙', deadline: '2026-04-25',
    sponsor: 'COSMOPOLITAN',
    description: '2 WECK-Sets mit passendem Kochbuch gewinnen. Einfach das Formular ausfüllen – kostenlos und ohne Anmeldung.',
    url: 'https://www.cosmopolitan.de/gewinnspiele/mit-weck-in-die-saison-starten', is_real: 1,
  },
  {
    title: 'Ravensburger Kreativ-Sets für die ganze Familie',
    cat: 'haus', value_eur: null, icon: '🎨', deadline: '2026-04-22',
    sponsor: 'Eltern.de',
    description: '2 kreative Ravensburger-Produkte für Kinder und Erwachsene. Kostenloses Eltern-Club-Konto nötig.',
    url: 'https://www.eltern.de/familie-urlaub/gewinnspiele/mit-ravensburger-kreativ-gewinnen-14069928.html', is_real: 1,
  },
  {
    title: '3 × 2 Kinotickets – Paris Murder Mystery',
    cat: 'gutschein', value_eur: null, icon: '🎬', deadline: '2026-04-16',
    sponsor: 'FÜR SIE Magazin',
    description: '3 × 2 Kinotickets zum Filmstart von „Paris Murder Mystery" plus je einen exklusiven Schal gewinnen.',
    url: 'https://www.fuersie.de/gewinnspiele/gewinne-3-x-2-tickets-zum-kinostart-von-paris-murder-mystery-sowie-3-halstuecher-19592.html', is_real: 1,
  },
  {
    title: 'SHEGLAM Sweetheart Beauty-Collection',
    cat: 'beauty', value_eur: null, icon: '💄', deadline: '2026-04-22',
    sponsor: 'GRAZIA × SHEGLAM',
    description: 'Die komplette SHEGLAM Sweetheart Collection gewinnen – Make-up und Pflege für strahlende Looks.',
    url: 'https://www.grazia-magazin.de/gewinne/sheglam-sweetheart-collection-zu-gewinnen-61806.html', is_real: 1,
  },
  {
    title: '2 E-Bikes von Riese & Müller',
    cat: 'sport', value_eur: 8000, icon: '⚡', deadline: '2026-04-30',
    sponsor: 'Runners World',
    description: 'Zwei hochwertige E-Bikes von Riese & Müller im Gesamtwert von über 8.000 € zu gewinnen.',
    url: 'https://www.runnersworld.de', is_real: 1,
  },
  {
    title: 'Picknick-Korb + 10 Brixie Lokomotiv-Sets',
    cat: 'haus', value_eur: null, icon: '🧺', deadline: '2026-04-14',
    sponsor: 'HOYER',
    description: 'Einen gefüllten Picknick-Korb und 10 Brixie Lokomotiv-Bausätze gewinnen. Teilnahme via Instagram.',
    url: 'https://www.instagram.com/hoyer.de/p/DWjZyXoAbRk/', is_real: 1,
  },
  // ── Demo-Gewinnspiele ────────────────────────────────────────────────────
  {
    title: 'VW Golf 8 GTI', cat: 'auto', value_eur: 39900, icon: '🚗',
    deadline: '2026-06-15', sponsor: 'Volkswagen',
    description: 'Probefahrt buchen und automatisch am Gewinnspiel teilnehmen.',
    url: '#', is_real: 0,
  },
  {
    title: '7 Tage Mallorca für 2 Personen', cat: 'reise', value_eur: 3200, icon: '✈️',
    deadline: '2026-05-20', sponsor: 'TUI',
    description: 'All-Inclusive Urlaub inkl. Flug für 2 Personen auf den Balearen.',
    url: '#', is_real: 0,
  },
  {
    title: '10.000 € Bargeld', cat: 'bargeld', value_eur: 10000, icon: '💰',
    deadline: '2026-05-01', sponsor: 'Postcode Lotterie',
    description: 'Registrieren und an der großen Jahresverlosung teilnehmen.',
    url: '#', is_real: 0,
  },
  {
    title: 'iPhone 16 Pro Max 256 GB', cat: 'handy', value_eur: 1329, icon: '📱',
    deadline: '2026-05-30', sponsor: 'MediaMarkt',
    description: 'Das neueste Apple Flaggschiff – App herunterladen und gewinnen.',
    url: '#', is_real: 0,
  },
  {
    title: 'Rhein-Flusskreuzfahrt für 2', cat: 'reise', value_eur: 4200, icon: '🛳️',
    deadline: '2026-06-01', sponsor: 'A-ROSA',
    description: '7 Nächte Vollpension auf dem Rhein inkl. Ausflügen.',
    url: '#', is_real: 0,
  },
  {
    title: '500 € Amazon-Gutschein', cat: 'gutschein', value_eur: 500, icon: '🎁',
    deadline: '2026-05-15', sponsor: 'Amazon.de',
    description: 'Einlösbar für Millionen Produkte – einfach Formular ausfüllen.',
    url: '#', is_real: 0,
  },
  {
    title: 'E-Bike CUBE Reaction Pro', cat: 'sport', value_eur: 4799, icon: '🚲',
    deadline: '2026-05-31', sponsor: 'CUBE Bikes',
    description: 'Hochwertiges E-Bike für Touren und den Alltag. Newsletter abonnieren.',
    url: '#', is_real: 0,
  },
  {
    title: 'Samsung Galaxy S25 Ultra', cat: 'handy', value_eur: 1299, icon: '📲',
    deadline: '2026-06-10', sponsor: 'Samsung',
    description: '200-MP-Kamera, S Pen, 12 GB RAM – via App teilnehmen.',
    url: '#', is_real: 0,
  },
  {
    title: 'Dyson Airwrap Complete Long', cat: 'beauty', value_eur: 599, icon: '💅',
    deadline: '2026-05-25', sponsor: 'Douglas',
    description: 'Das beliebteste Multistyling-Tool ohne extreme Hitze.',
    url: '#', is_real: 0,
  },
  {
    title: 'Nike Laufpaket 300 €', cat: 'sport', value_eur: 300, icon: '👟',
    deadline: '2026-05-10', sponsor: 'Nike',
    description: 'Schuhe, Bekleidung und Zubehör für deine nächste Herausforderung.',
    url: '#', is_real: 0,
  },
  {
    title: 'Weber Spirit E-310 Gasgrill-Bundle', cat: 'haus', value_eur: 799, icon: '🔥',
    deadline: '2026-07-31', sponsor: 'Hornbach',
    description: 'Klassischer Gasgrill im Premium-Set mit Abdeckhaube und Zubehör.',
    url: '#', is_real: 0,
  },
  {
    title: 'Wellness-Wochenende Bayerischer Hof', cat: 'reise', value_eur: 1800, icon: '🛎️',
    deadline: '2026-06-28', sponsor: 'Bayerischer Hof',
    description: '2 Nächte 5-Sterne München inkl. Spa, Frühstück und Gourmet-Dinner.',
    url: '#', is_real: 0,
  },
  {
    title: '1.000 € Bargeld', cat: 'bargeld', value_eur: 1000, icon: '💶',
    deadline: '2026-05-31', sponsor: 'Lotto24',
    description: 'Sofort auf dein Konto. Formular ausfüllen – keine Anmeldung nötig.',
    url: '#', is_real: 0,
  },
  {
    title: 'Hochzeitskleid von Pronovias', cat: 'mode', value_eur: 3500, icon: '👗',
    deadline: '2026-06-14', sponsor: 'Pronovias',
    description: 'Exklusives Brautkleid nach Wahl. Formular ausfüllen und Foto einsenden.',
    url: '#', is_real: 0,
  },
  {
    title: 'Porsche Taycan Erlebnisgutschein', cat: 'auto', value_eur: 500, icon: '🏎️',
    deadline: '2026-07-01', sponsor: 'Porsche',
    description: 'Probefahrt buchen und 500 € Erlebnisgeschenkgutschein gewinnen.',
    url: '#', is_real: 0,
  },
];

/**
 * Create and initialise a SQLite database.
 * @param {string} dbPath  - file path or ':memory:'
 * @param {object} opts
 * @param {string|null} opts.queueFile - path to contests-queue.json (null = skip)
 * @param {Array}       opts.seed      - seed rows (defaults to SEED constant)
 */
function createDb(dbPath, { queueFile = null, seed = SEED } = {}) {
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS contests (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      cat         TEXT    NOT NULL,
      value_eur   REAL,
      icon        TEXT    NOT NULL DEFAULT '🎁',
      deadline    TEXT    NOT NULL,
      sponsor     TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      url         TEXT    NOT NULL DEFAULT '#',
      is_real     INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    )
  `);

  // Add is_favorite to existing DBs created before this column existed
  try {
    db.exec('ALTER TABLE contests ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0');
  } catch (_) { /* column already exists */ }

  const INSERT_STMT = db.prepare(`
    INSERT INTO contests (title, cat, value_eur, icon, deadline, sponsor, description, url, is_real, is_favorite)
    VALUES (@title, @cat, @value_eur, @icon, @deadline, @sponsor, @description, @url, @is_real, @is_favorite)
  `);
  const titleExists = db.prepare('SELECT COUNT(*) AS n FROM contests WHERE title = ?');

  // ── Initial seed (only when DB is empty) ───────────────────────────────
  const count = db.prepare('SELECT COUNT(*) AS n FROM contests').get().n;
  if (count === 0 && seed.length > 0) {
    // Apply safe defaults so partial rows (e.g. in tests) don't throw
    db.transaction(rows => rows.forEach(r => INSERT_STMT.run({
      icon: '🎁', description: '', url: '#', value_eur: null, is_favorite: 0, ...r,
    })))(seed);
  }

  // ── Auto-deactivate expired contests ───────────────────────────────────
  db.prepare(
    "UPDATE contests SET active = 0 WHERE active = 1 AND deadline < strftime('%Y-%m-%d','now')"
  ).run();

  // ── Deactivate all demo entries (is_real = 0) ──────────────────────────
  db.prepare(
    'UPDATE contests SET active = 0, is_favorite = 0 WHERE is_real = 0 AND active = 1'
  ).run();

  // ── Import queue ───────────────────────────────────────────────────────
  // Domains blocked because they aggregate third-party contests rather than
  // linking directly to the contest organiser's own website.
  const BLOCKED_URL_PREFIXES = [
    'https://www.einfach-sparsam.de',
  ];

  if (queueFile && fs.existsSync(queueFile)) {
    try {
      const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      if (Array.isArray(queue) && queue.length > 0) {
        let added = 0;
        db.transaction(() => {
          for (const item of queue) {
            if (!item.title || !item.cat || !item.deadline) continue;
            if (titleExists.get(item.title).n > 0) continue;
            if (item.url && BLOCKED_URL_PREFIXES.some(p => item.url.startsWith(p))) continue;
            INSERT_STMT.run({
              title:       item.title,
              cat:         item.cat,
              value_eur:   item.value_eur ?? null,
              icon:        item.icon || '🎁',
              deadline:    item.deadline,
              sponsor:     item.sponsor || '',
              description: item.description || '',
              url:         item.url || '#',
              is_real:     item.is_real ? 1 : 0,
              is_favorite: item.is_favorite ? 1 : 0,
            });
            added++;
          }
        })();
        if (added > 0) console.log(`Imported ${added} new contest(s) from queue.`);
      }
    } catch (e) {
      console.error('Queue import error:', e.message);
    }
  }

  return db;
}

// ── Production singleton ────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = createDb(path.join(DATA_DIR, 'contests.db'), {
  queueFile: path.join(__dirname, '..', 'contests-queue.json'),
});

module.exports = db;
module.exports.createDb = createDb;
