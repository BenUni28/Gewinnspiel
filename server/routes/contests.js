'use strict';

const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const { cat, q } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let sql = `
    SELECT id, title, cat, value_eur, icon, deadline,
           sponsor, description, url, is_real, is_favorite, created_at
    FROM contests
    WHERE active = 1
      AND is_real = 1
      AND deadline >= ?
  `;
  const params = [today];

  if (cat && cat !== 'alle') {
    sql += ' AND cat = ?';
    params.push(cat);
  }

  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    sql += ' AND (title LIKE ? OR description LIKE ? OR sponsor LIKE ?)';
    params.push(like, like, like);
  }

  sql += ' ORDER BY deadline ASC';

  res.json(db.prepare(sql).all(...params));
});

module.exports = router;
