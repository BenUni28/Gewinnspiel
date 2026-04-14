'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createDb } = require('../server/db');
const createApp   = require('../server/app');

const ADMIN_KEY = 'test-secret-key';
const FUTURE    = '2099-12-31';

const BASE_CONTEST = {
  title: 'Test Gewinnspiel', cat: 'reise', value_eur: 1000,
  deadline: FUTURE, sponsor: 'Test GmbH',
  description: 'Kostenlos mitmachen', url: 'https://example.com/win',
  is_real: 1,
};

// ── Test server helpers ───────────────────────────────────────────────────
function startServer(db) {
  process.env.ADMIN_KEY = ADMIN_KEY;
  const app    = createApp(db);
  const server = app.listen(0);
  const { port } = server.address();
  const base   = `http://localhost:${port}`;
  return { server, base };
}

function stopServer(server) {
  return new Promise(resolve => server.close(resolve));
}

function authHeaders(extra = {}) {
  return { 'Authorization': `Bearer ${ADMIN_KEY}`, 'Content-Type': 'application/json', ...extra };
}

// ── CSP headers ───────────────────────────────────────────────────────────
describe('CSP headers', () => {
  let server, base;

  before(() => {
    const db = createDb(':memory:', { seed: [] });
    ({ server, base } = startServer(db));
  });
  after(() => stopServer(server));

  // Bug 4: Unsplash was missing from imgSrc
  test('imgSrc includes https://images.unsplash.com', async () => {
    const res = await fetch(base);
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp.includes('https://images.unsplash.com'), `imgSrc missing Unsplash. CSP: ${csp}`);
  });

  // Bug 5: Google Fonts were blocked
  test('styleSrc includes https://fonts.googleapis.com', async () => {
    const res = await fetch(base);
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp.includes('https://fonts.googleapis.com'), `styleSrc missing Google Fonts. CSP: ${csp}`);
  });

  test('fontSrc includes https://fonts.gstatic.com', async () => {
    const res = await fetch(base);
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp.includes('https://fonts.gstatic.com'), `fontSrc missing gstatic. CSP: ${csp}`);
  });

  // Admin JS was broken because inline scripts were blocked — scriptSrc must NOT have unsafe-inline
  test('scriptSrc does not include unsafe-inline', async () => {
    const res = await fetch(base);
    const csp = res.headers.get('content-security-policy');
    // Extract script-src directive
    const scriptSrc = csp.split(';').find(d => d.trim().startsWith('script-src')) || '';
    assert.ok(!scriptSrc.includes("'unsafe-inline'"), `scriptSrc must not have unsafe-inline. CSP: ${csp}`);
  });
});

// ── Trust proxy / rate limiter ────────────────────────────────────────────
describe('trust proxy', () => {
  let server, base;

  before(() => {
    const db = createDb(':memory:', { seed: [] });
    ({ server, base } = startServer(db));
  });
  after(() => stopServer(server));

  // Bug 3: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR when trust proxy was not set
  test('X-Forwarded-For header does not cause a 500 error', async () => {
    const res = await fetch(`${base}/api/contests`, {
      headers: { 'X-Forwarded-For': '1.2.3.4' },
    });
    assert.notEqual(res.status, 500, 'Rate limiter should not crash with X-Forwarded-For');
    assert.ok(res.ok, `Expected 2xx, got ${res.status}`);
  });
});

// ── Public contests API ───────────────────────────────────────────────────
describe('GET /api/contests', () => {
  let server, base;

  before(() => {
    const db = createDb(':memory:', { seed: [
      // Real, active
      { ...BASE_CONTEST, title: 'Real Active' },
      // Real but expired
      { ...BASE_CONTEST, title: 'Real Expired', deadline: '2000-01-01' },
      // Demo (is_real=0) — should be deactivated and hidden
      { ...BASE_CONTEST, title: 'Demo Contest', is_real: 0, url: '#' },
    ]});
    ({ server, base } = startServer(db));
  });
  after(() => stopServer(server));

  // Bug 6: demos were showing on the public site
  test('does not return is_real=0 (demo) entries', async () => {
    const res  = await fetch(`${base}/api/contests`);
    const list = await res.json();
    const demo = list.find(c => c.title === 'Demo Contest');
    assert.equal(demo, undefined, 'Demo contest must not appear in public API');
  });

  test('does not return expired entries', async () => {
    const res  = await fetch(`${base}/api/contests`);
    const list = await res.json();
    const exp  = list.find(c => c.title === 'Real Expired');
    assert.equal(exp, undefined, 'Expired contest must not appear');
  });

  test('returns active real entries', async () => {
    const res  = await fetch(`${base}/api/contests`);
    const list = await res.json();
    const real = list.find(c => c.title === 'Real Active');
    assert.ok(real, 'Active real contest should be in response');
  });

  test('response includes is_favorite field', async () => {
    const res  = await fetch(`${base}/api/contests`);
    const list = await res.json();
    if (list.length > 0) {
      assert.ok('is_favorite' in list[0], 'Response must include is_favorite');
    }
  });

  test('filters by category', async () => {
    const res  = await fetch(`${base}/api/contests?cat=bargeld`);
    const list = await res.json();
    list.forEach(c => assert.equal(c.cat, 'bargeld'));
  });
});

// ── Admin API auth ────────────────────────────────────────────────────────
describe('POST /api/admin/contests — auth', () => {
  let server, base;

  before(() => {
    const db = createDb(':memory:', { seed: [] });
    ({ server, base } = startServer(db));
  });
  after(() => stopServer(server));

  // Bug 9: buttons had no auth feedback (server returned 401 silently)
  test('returns 401 with no Authorization header', async () => {
    const res = await fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(BASE_CONTEST),
    });
    assert.equal(res.status, 401);
  });

  test('returns 401 with wrong key', async () => {
    const res = await fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: { 'Authorization': 'Bearer wrong-key', 'Content-Type': 'application/json' },
      body: JSON.stringify(BASE_CONTEST),
    });
    assert.equal(res.status, 401);
  });

  test('returns 201 with correct key', async () => {
    const res = await fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(BASE_CONTEST),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.id, 'Response must include the new id');
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title: 'Only Title' }),
    });
    assert.equal(res.status, 400);
  });
});

// ── Favorites max-3 enforcement ───────────────────────────────────────────
describe('favorites max-3 rule', () => {
  let server, base, db;

  before(() => {
    db = createDb(':memory:', { seed: [] });
    ({ server, base } = startServer(db));
  });
  after(() => stopServer(server));

  async function addFavorite(title) {
    return fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...BASE_CONTEST, title, is_favorite: 1 }),
    });
  }

  // Bug 8: server must reject a 4th favorite
  test('allows adding up to 3 favorites', async () => {
    const r1 = await addFavorite('Fav 1');
    const r2 = await addFavorite('Fav 2');
    const r3 = await addFavorite('Fav 3');
    assert.equal(r1.status, 201);
    assert.equal(r2.status, 201);
    assert.equal(r3.status, 201);
  });

  test('rejects a 4th favorite with 400', async () => {
    const r4 = await addFavorite('Fav 4');
    assert.equal(r4.status, 400);
    const data = await r4.json();
    assert.ok(data.error.includes('3'), `Error should mention limit. Got: ${data.error}`);
  });

  test('PATCH /favorite also rejects when 3 are already set', async () => {
    // Add a non-favorite contest
    const createRes = await fetch(`${base}/api/admin/contests`, { method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...BASE_CONTEST, title: 'Non-Fav', is_favorite: 0 }),
    });
    const { id } = await createRes.json();

    // Try to mark it as favorite (should fail — already 3)
    const patchRes = await fetch(`${base}/api/admin/contests/${id}/favorite`, { method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ is_favorite: 1 }),
    });
    assert.equal(patchRes.status, 400);
  });

  test('unsetting a favorite (is_favorite=0) always succeeds', async () => {
    // Get id of first favorite
    const listRes = await fetch(`${base}/api/admin/contests`, { headers: authHeaders() });
    const list    = await listRes.json();
    const fav     = list.find(c => c.is_favorite === 1);
    assert.ok(fav, 'Should have a favorite to unset');

    const patchRes = await fetch(`${base}/api/admin/contests/${fav.id}/favorite`, { method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ is_favorite: 0 }),
    });
    assert.equal(patchRes.status, 200);
  });
});
