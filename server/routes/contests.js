'use strict';

const { Router } = require('express');

module.exports = function contestsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const { cat, q } = req.query;
    const today    = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // Active contests (with category + search filters)
    let activeSql = `
      SELECT id, title, cat, value_eur, icon, deadline,
             sponsor, description, url, is_real, is_favorite, draw_date, created_at
      FROM contests
      WHERE active = 1 AND is_real = 1 AND deadline >= ?
    `;
    const activeParams = [today];

    if (cat && cat !== 'alle') {
      activeSql += ' AND cat = ?';
      activeParams.push(cat);
    }
    if (q && q.trim()) {
      const like = `%${q.trim()}%`;
      activeSql += ' AND (title LIKE ? OR description LIKE ? OR sponsor LIKE ?)';
      activeParams.push(like, like, like);
    }
    activeSql += ' ORDER BY deadline ASC';

    // Recently expired (last 30 days, no filters — always shown regardless of search/cat)
    const expiredSql = `
      SELECT id, title, cat, value_eur, icon, deadline,
             sponsor, description, url, is_real, is_favorite, draw_date, created_at
      FROM contests
      WHERE is_real = 1
        AND deadline >= ?
        AND deadline < ?
      ORDER BY deadline DESC
    `;

    res.json({
      active:  db.prepare(activeSql).all(...activeParams),
      expired: db.prepare(expiredSql).all(monthAgo, today),
    });
  });

  return router;
};
