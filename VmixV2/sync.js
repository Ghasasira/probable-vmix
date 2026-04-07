const axios = require('axios');
const { getUnsyncedLogs, markLogsAsSynced } = require('./db');
const os = require('os');

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'https://vmix.hiilcom.ug/newdata';
const MACHINE_NAME = process.env.MACHINE_NAME || os.hostname();
const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || '300000'); // Default 5 mins

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
      const ids = logs.map(l => l.id);
      await markLogsAsSynced(ids);
      console.log(`[Sync] Successfully synced ${logs.length} logs.`);
    } else {
      console.warn(`[Sync] Central server returned unexpected status: ${response.status}`);
    }
  } catch (err) {
    console.error(`[Sync] Error during synchronization:`, err.message);
  } finally {
    isSyncing = false;
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
