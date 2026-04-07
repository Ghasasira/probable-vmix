const express = require('express');
const path = require('path');
const fs = require('fs');
const { getLogs, getStats } = require('./db');
const { exportCsv, exportPdf } = require('./export');
const { isPackaged, BASE_DIR } = require('./paths');

const app = express();
app.use(express.json());
app.use('/screenshots', express.static(path.join(BASE_DIR, 'screenshots')));
app.use('/exports', express.static(path.join(BASE_DIR, 'exports')));

// Serve index.html - from snapshot if packaged, from filesystem if dev
app.get('/', (req, res) => {
  try {
    const indexPath = isPackaged 
      ? path.join(__dirname, 'index.html')  // From pkg snapshot
      : path.join(BASE_DIR, 'index.html'); // From filesystem
    const content = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (err) {
    res.status(500).send(`Error loading dashboard: ${err.message}`);
  }
});

// Static files for other assets
app.use(express.static(BASE_DIR));

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', date = '' } = req.query;
    const result = await getLogs({ page: parseInt(page), limit: parseInt(limit), search, date });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/export/csv
app.get('/api/export/csv', async (req, res) => {
  try {
    const { filepath, filename } = await exportCsv();
    res.download(filepath, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/export/pdf
app.get('/api/export/pdf', async (req, res) => {
  try {
    const { filepath, filename } = await exportPdf();
    res.download(filepath, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
