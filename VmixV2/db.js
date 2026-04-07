const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { BASE_DIR } = require('./paths');

const DB_PATH = path.join(BASE_DIR, 'vmix-log.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS play_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      played_at TEXT NOT NULL,
      input_number INTEGER,
      input_name TEXT,
      input_type TEXT,
      duration_ms INTEGER,
      position_ms INTEGER,
      loop INTEGER DEFAULT 0,
      screenshot_path TEXT,
      source TEXT DEFAULT 'unknown',
      is_synced INTEGER DEFAULT 0
    )
  `);

  // Ensure is_synced column exists for older databases
  try {
    db.run('ALTER TABLE play_log ADD COLUMN is_synced INTEGER DEFAULT 0');
    saveDb();
  } catch (e) {
    // Column already exists, ignore
  }

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function insertLog(entry) {
  const d = await getDb();
  
  // Deduplication check: Don't log the same input if it was logged in the last 2 seconds
  const now = new Date(entry.played_at).getTime();
  const recent = d.exec(
    `SELECT played_at FROM play_log 
     WHERE input_number = ? AND input_name = ? 
     ORDER BY played_at DESC LIMIT 1`,
    [entry.input_number, entry.input_name]
  );

  if (recent.length > 0 && recent[0].values.length > 0) {
    const lastPlayedAt = new Date(recent[0].values[0][0]).getTime();
    if (now - lastPlayedAt < 2000) { 
      console.log(`[DB] Ignoring duplicate log for #${entry.input_number} "${entry.input_name}" (within 2s)`);
      return;
    }
  }

  d.run(
    `INSERT INTO play_log (played_at, input_number, input_name, input_type, duration_ms, position_ms, loop, screenshot_path, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.played_at,
      entry.input_number,
      entry.input_name,
      entry.input_type,
      entry.duration_ms,
      entry.position_ms,
      entry.loop ? 1 : 0,
      entry.screenshot_path || null,
      entry.source || 'unknown'
    ]
  );
  saveDb();
}

async function getLogs({ page = 1, limit = 50, search = '', date = '' } = {}) {
  const d = await getDb();
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ` AND (input_name LIKE ? OR input_type LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (date) {
    where += ` AND played_at LIKE ?`;
    params.push(`${date}%`);
  }

  const countResult = d.exec(`SELECT COUNT(*) as cnt FROM play_log ${where}`, params);
  const total = countResult[0]?.values[0][0] || 0;

  const rows = d.exec(
    `SELECT * FROM play_log ${where} ORDER BY played_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const logs = [];
  if (rows.length > 0) {
    const cols = rows[0].columns;
    for (const row of rows[0].values) {
      const obj = {};
      cols.forEach((c, i) => (obj[c] = row[i]));
      logs.push(obj);
    }
  }

  return { logs, total, page, limit };
}

async function getAllLogs() {
  const d = await getDb();
  const rows = d.exec(`SELECT * FROM play_log ORDER BY played_at DESC`);
  if (!rows.length) return [];
  const cols = rows[0].columns;
  return rows[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => (obj[c] = row[i]));
    return obj;
  });
}

async function getStats() {
  const d = await getDb();
  const total = d.exec(`SELECT COUNT(*) FROM play_log`)[0]?.values[0][0] || 0;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = d.exec(`SELECT COUNT(*) FROM play_log WHERE played_at LIKE ?`, [`${today}%`])[0]?.values[0][0] || 0;
  const topInputs = d.exec(`SELECT input_name, COUNT(*) as cnt FROM play_log GROUP BY input_name ORDER BY cnt DESC LIMIT 5`);
  const byType = d.exec(`SELECT input_type, COUNT(*) as cnt FROM play_log GROUP BY input_type ORDER BY cnt DESC`);

  return {
    total,
    todayCount,
    topInputs: topInputs[0] ? topInputs[0].values.map(r => ({ name: r[0], count: r[1] })) : [],
    byType: byType[0] ? byType[0].values.map(r => ({ type: r[0], count: r[1] })) : []
  };
}

async function getUnsyncedLogs() {
  const d = await getDb();
  const rows = d.exec(`SELECT * FROM play_log WHERE is_synced = 0 ORDER BY played_at ASC LIMIT 100`);
  if (!rows.length) return [];
  const cols = rows[0].columns;
  return rows[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => (obj[c] = row[i]));
    return obj;
  });
}

async function markLogsAsSynced(ids) {
  if (!ids || ids.length === 0) return;
  const d = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  d.run(`UPDATE play_log SET is_synced = 1 WHERE id IN (${placeholders})`, ids);
  saveDb();
}

module.exports = { getDb, insertLog, getLogs, getAllLogs, getStats, saveDb, getUnsyncedLogs, markLogsAsSynced };
