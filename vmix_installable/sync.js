const axios = require('axios');
const { getUnsyncedLogs, markLogsAsSynced } = require('./db');
const os = require('os');

const CENTRAL_API_URL = process.env.CENTRAL_API_URL;
const MACHINE_NAME = process.env.MACHINE_NAME || os.hostname();
const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || '300000'); // Default 5 mins

if (!CENTRAL_API_URL) {
  console.error('[Sync] ERROR: CENTRAL_API_URL is not defined in .env');
}

let isSyncing = false;

async function syncNow() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const logs = await getUnsyncedLogs();
    if (logs.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`[Sync] Attempting to sync ${logs.length} logs to central server...`);

    const payload = {
      machine_name: MACHINE_NAME,
      data: logs // Sending the array of log objects
    };

    const response = await axios.post(CENTRAL_API_URL, payload, { timeout: 10000 });
    
    if (response.status === 200 || response.status === 201) {
      console.log(`[Sync] JSON data synced. Now uploading ${logs.filter(l => l.screenshot_path).length} potential screenshots...`);
      
      // Upload screenshots for the logs we just synced
      for (const log of logs) {
        if (log.screenshot_path) {
          await uploadScreenshot(log.screenshot_path);
        }
      }

      const ids = logs.map(l => l.id);
      await markLogsAsSynced(ids);
      console.log(`[Sync] Successfully synced ${logs.length} logs and screenshots.`);
    } else {
      console.warn(`[Sync] Central server returned unexpected status: ${response.status}`);
    }
  } catch (err) {
    console.error(`[Sync] Error during synchronization:`, err.message);
  } finally {
    isSyncing = false;
  }
}

async function uploadScreenshot(relativePath) {
  try {
    const { BASE_DIR } = require('./paths');
    const path = require('path');
    const fs = require('fs');
    
    const fullPath = path.join(BASE_DIR, relativePath);
    if (!fs.existsSync(fullPath)) return;

    const uploadUrl = CENTRAL_API_URL.replace('/newdata', '/upload-screenshot');
    
    // We use a simple multipart construction for compatibility
    // Node.js 18+ has a global FormData, but for older versions we might need a workaround.
    // However, the user is likely on a modern environment.
    const FormData = require('form-data'); // We assume this is available or we'll fallback
    const form = new FormData();
    form.append('machine_name', MACHINE_NAME);
    form.append('screenshot', fs.createReadStream(fullPath));

    await axios.post(uploadUrl, form, {
      headers: { ...form.getHeaders() },
      timeout: 15000
    });
  } catch (err) {
    console.warn(`[Sync] Screenshot upload failed for ${relativePath}:`, err.message);
  }
}

function startSync() {
  console.log(`[Sync] Background sync started. Interval: ${SYNC_INTERVAL_MS / 1000 / 60} minutes.`);
  console.log(`[Sync] Machine Name: ${MACHINE_NAME}`);
  
  // Initial sync attempt after 10 seconds
  setTimeout(syncNow, 10000);
  
  // Periodic sync
  setInterval(syncNow, SYNC_INTERVAL_MS);
}

module.exports = { startSync, syncNow };
