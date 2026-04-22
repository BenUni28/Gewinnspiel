'use strict';

const express    = require('express');
const helmet     = require('helmet');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

function createApp(db) {
  const app = express();

  // Trust Railway's reverse proxy so rate-limit can read the real client IP
  app.set('trust proxy', 1);

  // ── Security ────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:     ["'self'", 'data:', 'https://images.unsplash.com', 'https://logo.clearbit.com'],
        connectSrc: ["'self'"],
        workerSrc:  ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
  }));

  // ── Performance ──────────────────────────────────────────────────────────
  app.use(compression());

  // ── Rate limiting ────────────────────────────────────────────────────────
  app.use('/api/admin', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  }));

  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  }));

  // ── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json());

  // ── API routes ───────────────────────────────────────────────────────────
  app.use('/api/contests', require('./routes/contests')(db));
  app.use('/api/admin',    require('./routes/admin')(db));

  // ── Static files ─────────────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: '1h',
    etag: true,
  }));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = createApp;
