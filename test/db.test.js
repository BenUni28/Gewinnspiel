'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDb } = require('../server/db');

// Helper: write a temp queue file, return its path
function writeTempQueue(items) {
  const file = path.join(os.tmpdir(), `queue-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(items));
  return file;
}

// Minimal real contest entry (matches required fields)
const REAL = {
  title: 'Test Contest', cat: 'reise', value_eur: 500, icon: '✈️',
  deadline: '2099-12-31', sponsor: 'Test Sponsor',
  description: 'Test description', url: 'https://example.com/win', is_real: 1,
};

const DEMO = { ...REAL, title: 'Demo Contest', is_real: 0, url: '#' };

// ── Bug 1: Missing is_favorite in SEED rows caused RangeError ─────────────
describe('seed', () => {
  test('SEED rows without is_favorite field do not throw RangeError', () => {
    // Rows that lack is_favorite — exactly what the SEED constant looks like
    const seedWithoutFav = [
      { title: 'A', cat: 'reise', value_eur: 100, icon: '✈️', deadline: '2099-01-01', sponsor: 'S', description: '', url: '#', is_real: 0 },
      { title: 'B', cat: 'handy', value_eur: 200, icon: '📱', deadline: '2099-01-01', sponsor: 'S', description: '', url: '#', is_real: 1 },
    ];
    // Must not throw — this was the production crash
    assert.doesNotThrow(() => createDb(':memory:', { seed: seedWithoutFav }));
  });

  test('seeded rows are present in DB', () => {
    const db = createDb(':memory:', { seed: [REAL] });
    const count = db.prepare('SELECT COUNT(*) AS n FROM contests').get().n;
    assert.equal(count, 1);
  });

  test('seeded rows get is_favorite = 0 by default', () => {
    const db = createDb(':memory:', { seed: [REAL] });
    const row = db.prepare('SELECT is_favorite FROM contests WHERE title = ?').get(REAL.title);
    assert.equal(row.is_favorite, 0);
  });
});

// ── Bug 7: Demo entries must be deactivated on startup ────────────────────
describe('demo deactivation', () => {
  test('is_real=0 entries are deactivated (active=0) on startup', () => {
    const db = createDb(':memory:', { seed: [DEMO] });
    const row = db.prepare('SELECT active FROM contests WHERE title = ?').get(DEMO.title);
    assert.equal(row.active, 0);
  });

  test('is_real=1 entries remain active after startup', () => {
    const db = createDb(':memory:', { seed: [REAL] });
    const row = db.prepare('SELECT active FROM contests WHERE title = ?').get(REAL.title);
    assert.equal(row.active, 1);
  });

  test('demo is_favorite is reset to 0 on startup', () => {
    // Even if a demo somehow had is_favorite=1, it should be cleared
    const demoFav = { ...DEMO, is_favorite: 1 };
    const db = createDb(':memory:', { seed: [demoFav] });
    const row = db.prepare('SELECT is_favorite FROM contests WHERE title = ?').get(demoFav.title);
    assert.equal(row.is_favorite, 0);
  });
});

// ── Bug 2: Queue import must carry is_favorite ────────────────────────────
describe('queue import', () => {
  test('is_favorite=1 in queue is imported correctly', () => {
    const queue = [{ ...REAL, title: 'Queue Fav', is_favorite: 1 }];
    const queueFile = writeTempQueue(queue);
    const db = createDb(':memory:', { seed: [], queueFile });
    const row = db.prepare('SELECT is_favorite FROM contests WHERE title = ?').get('Queue Fav');
    assert.equal(row.is_favorite, 1);
    fs.unlinkSync(queueFile);
  });

  test('queue entry without is_favorite defaults to 0', () => {
    const queue = [{ ...REAL, title: 'Queue NoFav' }]; // no is_favorite field
    const queueFile = writeTempQueue(queue);
    const db = createDb(':memory:', { seed: [], queueFile });
    const row = db.prepare('SELECT is_favorite FROM contests WHERE title = ?').get('Queue NoFav');
    assert.equal(row.is_favorite, 0);
    fs.unlinkSync(queueFile);
  });

  test('duplicate titles in queue are skipped', () => {
    const existing = { ...REAL, title: 'Already Exists' };
    const queue = [{ ...REAL, title: 'Already Exists' }]; // same title
    const queueFile = writeTempQueue(queue);
    const db = createDb(':memory:', { seed: [existing], queueFile });
    const count = db.prepare('SELECT COUNT(*) AS n FROM contests WHERE title = ?').get('Already Exists').n;
    assert.equal(count, 1); // not duplicated
    fs.unlinkSync(queueFile);
  });

  test('queue entries with missing required fields are skipped', () => {
    const queue = [
      { title: 'Missing Cat', deadline: '2099-01-01' },         // no cat
      { cat: 'reise', deadline: '2099-01-01' },                  // no title
      { title: 'Missing Deadline', cat: 'reise' },               // no deadline
      { ...REAL, title: 'Valid Entry' },                         // valid
    ];
    const queueFile = writeTempQueue(queue);
    const db = createDb(':memory:', { seed: [], queueFile });
    const count = db.prepare('SELECT COUNT(*) AS n FROM contests').get().n;
    assert.equal(count, 1); // only the valid one
    fs.unlinkSync(queueFile);
  });

  test('queue is skipped when file does not exist', () => {
    assert.doesNotThrow(() => createDb(':memory:', { seed: [], queueFile: '/nonexistent/queue.json' }));
  });
});

// ── Expired contests deactivated ──────────────────────────────────────────
describe('expired deactivation', () => {
  test('entries with past deadlines are deactivated', () => {
    const expired = { ...REAL, title: 'Expired', deadline: '2000-01-01' };
    const db = createDb(':memory:', { seed: [expired] });
    const row = db.prepare('SELECT active FROM contests WHERE title = ?').get('Expired');
    assert.equal(row.active, 0);
  });

  test('entries with future deadlines stay active', () => {
    const db = createDb(':memory:', { seed: [REAL] });
    const row = db.prepare('SELECT active FROM contests WHERE title = ?').get(REAL.title);
    assert.equal(row.active, 1);
  });
});
