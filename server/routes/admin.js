'use strict';

const { Router } = require('express');
const db = require('../db');

const router = Router();

function requireAdmin(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || token !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(requireAdmin);

// GET /api/admin/contests — list all (incl. inactive)
router.get('/contests', (_req, res) => {
  res.json(db.prepare('SELECT * FROM contests ORDER BY id DESC').all());
});

// POST /api/admin/contests — create
router.post('/contests', (req, res) => {
  const { title, cat, value_eur, icon, deadline, sponsor, description, url, is_real } = req.body;

  if (!title || !cat || !deadline || !sponsor) {
    return res.status(400).json({ error: 'title, cat, deadline, sponsor are required' });
  }

  const info = db.prepare(`
    INSERT INTO contests (title, cat, value_eur, icon, deadline, sponsor, description, url, is_real)
    VALUES (@title, @cat, @value_eur, @icon, @deadline, @sponsor, @description, @url, @is_real)
  `).run({
    title,
    cat,
    value_eur: value_eur ?? null,
    icon: icon || '🎁',
    deadline,
    sponsor,
    description: description || '',
    url: url || '#',
    is_real: is_real ? 1 : 0,
  });

  res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /api/admin/contests/:id — full update
router.put('/contests/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const { title, cat, value_eur, icon, deadline, sponsor, description, url, is_real, active } = req.body;

  const info = db.prepare(`
    UPDATE contests
    SET title=@title, cat=@cat, value_eur=@value_eur, icon=@icon,
        deadline=@deadline, sponsor=@sponsor, description=@description,
        url=@url, is_real=@is_real, active=@active
    WHERE id=@id
  `).run({
    id, title, cat,
    value_eur: value_eur ?? null,
    icon: icon || '🎁',
    deadline, sponsor,
    description: description || '',
    url: url || '#',
    is_real: is_real ? 1 : 0,
    active: active !== undefined ? (active ? 1 : 0) : 1,
  });

  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ updated: id });
});

// DELETE /api/admin/contests/:id — soft-delete
router.delete('/contests/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

  const info = db.prepare('UPDATE contests SET active = 0 WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });

  res.json({ deactivated: id });
});

module.exports = router;
