# Gewinnspiele – Projektkontext für Claude

## Was ist das Projekt?

Ein täglich aktualisiertes Verzeichnis laufender Gewinnspiele aus Deutschland.
Benutzer können Gewinnspiele nach Kategorie filtern, suchen und direkt teilnehmen.
Die Seite ist kostenlos, werbefrei und ohne Registrierung nutzbar.

**Produktiv-URL:** Wird auf Railway deployed (automatisch bei Push auf `main`).
**GitHub:** https://github.com/BenUni28/Gewinnspiel
**Git-User:** BEN

---

## Tech-Stack

| Schicht     | Technologie                                      |
|-------------|--------------------------------------------------|
| Backend     | Node.js 20+, Express 4, better-sqlite3           |
| Sicherheit  | Helmet (CSP), express-rate-limit, trust proxy 1  |
| Datenbank   | SQLite (`data/contests.db`)                      |
| Frontend    | Vanilla JS + CSS (kein Framework), Space Grotesk |
| Deployment  | Railway (auto-deploy bei Push), Docker optional  |

---

## Dateistruktur

```
/
├── CLAUDE.md                  ← diese Datei
├── contests-queue.json        ← Warteschlange für neue Gewinnspiele (Agent schreibt hier)
├── link-check-report.md       ← Letzter Bericht des Agenten
├── public/
│   ├── index.html             ← SPA-Einstieg (Space Grotesk Font, Hero-Heading)
│   ├── style.css              ← Alle Stile (Dark Theme, CSS-Variablen)
│   ├── app.js                 ← Frontend-Logik (Karten, Favoriten, Filter)
│   └── admin.html             ← Admin-Panel (passwortgeschützt)
├── server/
│   ├── index.js               ← Express-App, CSP, Rate-Limiting, trust proxy
│   ├── db.js                  ← SQLite-Setup, Seed, Queue-Import beim Start
│   └── routes/
│       ├── contests.js        ← GET /api/contests (Filter: cat, q, active)
│       └── admin.js           ← Admin-API (Passwort aus .env: ADMIN_PASSWORD)
└── data/
    └── contests.db            ← SQLite-Datenbank (nicht im Git)
```

---

## Wichtige Konventionen

### Kategorien (cat-Werte)
```
reise | bargeld | auto | handy | gutschein | sport | mode | haus | beauty | lebensmittel
```
In der UI heißt `handy` → **Technik** (Mapping in `app.js` → `CATS`).

### Karten-Design
- Jede Kategorie hat ein Unsplash-Bild (definiert in `CAT_IMAGES` in `app.js`)
- Bilder: 480×180px, `object-fit: cover`, mit Hover-Zoom
- CSP muss `https://images.unsplash.com` in `imgSrc` erlauben

### Fonts
- **Space Grotesk** (Google Fonts) für Headings + Logo
- CSP muss `fonts.googleapis.com` (styleSrc) + `fonts.gstatic.com` (fontSrc) erlauben

### Favoriten-Logik (renderFavorites in app.js)
- Nur Einträge mit `is_real = 1` UND direkter URL (nicht `#`)
- Prioritäts-Reihenfolge der Kategorien: `['handy', 'sport', 'haus', 'beauty', 'lebensmittel']`
- Zeigt genau **3 Favoriten** (`.slice(0, 3)`)
- Blaues Highlight (kein Gold), Badge "★ Favorit"

---

## Gewinnspiel-Qualitätskriterien

Ein Eintrag darf in die Queue (`contests-queue.json`) NUR wenn:

| Kriterium | Details |
|-----------|---------|
| ✅ Kostenlos | Keine Kaufpflicht, kein kostenpflichtiges Abo |
| ✅ Newsletter-Anmeldung OK | Nur E-Mail-Adresse angeben ist erlaubt |
| ✅ Aktiv | Deadline in der Zukunft |
| ✅ Direkte URL | Pfad zur Teilnahmeseite, nicht nur Startseite |
| ✅ Seriös | Bekannter Veranstalter oder etabliertes Portal |
| ❌ Kaufzwang | z.B. Los kaufen (Postcode Lotterie) → NICHT aufnehmen |
| ❌ Pflichtmitgliedschaft | Bezahlte Mitgliedschaft erforderlich → NICHT aufnehmen |
| ❌ Drittanbieter-Aggregatoren | URL darf NICHT von einer fremden Gewinnspiel-Seite stammen — nur direkte URLs des Veranstalters |

### Geblockte Domains (Queue-Import)
URLs mit diesen Präfixen werden beim Import automatisch übersprungen (`server/db.js` → `BLOCKED_URL_PREFIXES`):
- `https://www.einfach-sparsam.de` — Drittanbieter-Aggregator, nicht der direkte Veranstalter

---

## Queue-Workflow (Agent → Produktion)

1. Agent schreibt `contests-queue.json` (mergt mit bestehenden Einträgen)
2. Agent pusht auf `main`
3. Railway erkennt den Push → baut + deployed automatisch
4. Beim Start liest `server/db.js` die Queue und importiert neue Einträge in SQLite
5. Duplikate werden per Titel-Check übersprungen

**Wichtig:** Der Agent kann Railway nicht direkt ansprechen. Nur Git-Push → Auto-Deploy.

### Queue-JSON-Schema (Felder pro Eintrag)

```jsonc
{
  "title":       "Titel des Gewinnspiels",
  "cat":         "sport",          // reise|bargeld|auto|handy|gutschein|sport|mode|haus|beauty|lebensmittel
  "sponsor":     "Veranstalter",
  "deadline":    "2026-06-01",     // ISO-Datum: letzter Teilnahmetag
  "draw_date":   "15.06.2026",     // Auslosungs-/Gewinner-Bekanntgabedatum (Freitext, optional)
  "description": "Kurze Beschreibung",
  "url":         "https://…",
  "is_real":     1,                // 1 = echtes Gewinnspiel, 0 = Demo
  "value_eur":   999               // Gewinnwert in €, null wenn nicht angegeben
}
```

### Auslosungsdatum recherchieren (`draw_date`)

**Für jeden neuen Eintrag** muss der Agent aktiv nach dem Auslosungsdatum suchen:
1. Öffne die Teilnahmeseite (url) und suche nach Begriffen wie:
   - „Auslosung", „Auslosungsdatum", „Gewinner werden", „Bekanntgabe der Gewinner",
   - „ermittelt am", „wird bekannt gegeben", „Los wird gezogen", „Ziehung"
2. Prüfe die **Teilnahmebedingungen** der Seite (oft verlinkt als „TnB", „AGB", „Teilnahmebedingungen")
3. Wenn ein konkretes Datum gefunden: trage es als Freitext ein (z.B. `"15.06.2026"` oder `"Juni 2026"`)
4. Wenn nur eine vage Aussage: trage sie sinnvoll gekürzt ein (z.B. `"nach Teilnahmeschluss"`)
5. Wenn nichts gefunden: Feld weglassen (wird als `null` importiert und in der UI als „nicht angegeben" angezeigt)

---

## Railway & Deployment

- `app.set('trust proxy', 1)` ist gesetzt — nötig wegen Railway's Load Balancer (X-Forwarded-For)
- Ohne `trust proxy` wirft `express-rate-limit` einen `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` Fehler
- Umgebungsvariablen in Railway: `PORT` (auto), `ADMIN_KEY`

---

## Geplanter Agent (Remote Trigger)

**ID:** `trig_017VN6w4veceMx324HHUXrJa`
**Name:** Gewinnspiele-Aktualisierung & Linkpruefung
**Zeitplan:** Alle 3 Tage, 7:00 Uhr UTC (= 9:00 Uhr Europe/Berlin)
**Verwaltung:** https://claude.ai/code/scheduled

Der Agent:
1. Recherchiert 5–10 neue kostenlose Gewinnspiele inkl. `draw_date` (Auslosungsdatum aus den TnBs)
2. Prüft alle URLs in der Queue (OK / KOSTENPFLICHTIG / HOMEPAGE / DEFEKT)
3. Entfernt fehlerhafte und kostenpflichtige Einträge
4. Pusht `contests-queue.json` + `link-check-report.md`

---

## Admin-Panel

- Erreichbar unter `/admin.html`
- Passwort in `.env` → `ADMIN_PASSWORD`
- Passwort: `.env` → `ADMIN_KEY=...` (nicht ADMIN_PASSWORD!)
- Funktionen: Gewinnspiele aktivieren/deaktivieren, neue hinzufügen, löschen
