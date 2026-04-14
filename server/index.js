'use strict';

require('dotenv').config();

const createApp = require('./app');
const db        = require('./db');

const app  = createApp(db);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  Gewinnspiele läuft → http://localhost:${PORT}`);
  console.log(`  Admin-Panel       → http://localhost:${PORT}/admin.html\n`);
});
