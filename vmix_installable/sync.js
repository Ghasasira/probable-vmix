const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { getUnsyncedLogs, markLogsAsSynced } = require('./db');
const { BASE_DIR } = require('./paths');
const os = require('os');

const CENTRAL_API_URL = process.env.CENTRAL_API_URL;
const MACHINE_NAME = process.env.MACHINE_NAME || os.hostname();
const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || '300000');

if (!CENTRAL_API_URL) {
  console.error('[Sync] ERROR: CENTRAL_API_URL is not defined in .env');
}

let isSyncing = false;

/**
 * Syncs all unsynced logs + their screenshots to the central server
 * in a single multipart/form-data request.
 *
 * The server receives:
 *   - field  "machine_name"  — string
 *   - field  "data"          — JSON string of the logs array
 *   - files  "screenshots"   — one file per log that has a screenshot,
 *                              with the field name set to the log's DB id
 *                              so the server can match screenshot → log.
 *                              e.g. field name: "screenshot_42"
 */
async function syncNow() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const logs = await getUnsyncedLogs();
    if (logs.length === 0) {
      return;
    }

    console.log(`[Sync] Syncing ${logs.length} logs (with screenshots) to central server...`);

    const form = new FormData();
    form.append('machine_name', MACHINE_NAME);
    form.append('data', JSON.stringify(logs));

    // Attach screenshots directly into the same request
    let screenshotCount = 0;
    for (const log of logs) {
      if (!log.screenshot_path) continue;

      const fullPath = path.join(BASE_DIR, log.screenshot_path);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[Sync] Screenshot missing, skipping: ${log.screenshot_path}`);
        continue;
      }

      // Field name encodes the log ID so the server knows which log it belongs to
      form.append(`screenshot_${log.id}`, fs.createReadStream(fullPath), {
        filename: path.basename(fullPath),
        contentType: 'image/png',
      });
      screenshotCount++;
    }

    console.log(`[Sync] Sending ${screenshotCount} screenshots alongside data...`);

    const response = await axios.post(CENTRAL_API_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000, // Longer timeout to accommodate file uploads
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.status === 200 || response.status === 201) {
      const ids = logs.map(l => l.id);
      await markLogsAsSynced(ids);
      console.log(`[Sync] ✓ Successfully synced ${logs.length} logs and ${screenshotCount} screenshots.`);
    } else {
      console.warn(`[Sync] Unexpected response status: ${response.status}`);
    }

  } catch (err) {
    if (err.response) {
      console.error(`[Sync] Server rejected sync: HTTP ${err.response.status} — ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`[Sync] Sync failed:`, err.message);
    }
  } finally {
    isSyncing = false;
  }
}

function startSync() {
  console.log(`[Sync] Background sync started. Interval: ${SYNC_INTERVAL_MS / 1000 / 60} minutes.`);
  console.log(`[Sync] Machine Name: ${MACHINE_NAME}`);

  // Initial sync after 10 seconds
  setTimeout(syncNow, 10000);

  // Periodic sync
  setInterval(syncNow, SYNC_INTERVAL_MS);
}

module.exports = { startSync, syncNow };