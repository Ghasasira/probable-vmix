const path = require('path');
const fs = require('fs');
const os = require('os');

// Ensure .env exists in packaged app
const { isPackaged, BASE_DIR } = require('./paths');
if (isPackaged && !fs.existsSync(path.join(BASE_DIR, '.env'))) {
  console.log('[App] Creating default .env file...');
  fs.writeFileSync(path.join(BASE_DIR, '.env'), `VMIX_HOST=localhost
VMIX_PORT=8088
VMIX_TCP_PORT=8099
POLL_INTERVAL_MS=3000
PORT=3000
MACHINE_NAME=${os.hostname()}
CENTRAL_API_URL=https://vmixmonitor.hillcom.ug/api/newdata
SYNC_INTERVAL_MS=300000
`);
}

// Reload env after potential creation
require('dotenv').config({ path: path.join(BASE_DIR, '.env') });

const app = require('./server');
const { pollVmixState } = require('./vmix-http');
const { connect: connectTcp, getStatus: getTcpStatus } = require('./vmix-tcp');
const { startSync } = require('./sync');

const PORT = process.env.PORT || 3000;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '3000');

// Start web server
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║        vMix Logger Started           ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Dashboard: http://localhost:${PORT}    ║`);
  console.log(`║  vMix Host: ${process.env.VMIX_HOST || 'localhost'}:${process.env.VMIX_PORT || '8088'}          ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});

// Connect TCP (real-time)
connectTcp((connected) => {
  console.log(`[TCP] Status: ${connected ? '✓ Connected' : '✗ Disconnected'}`);
});

// HTTP polling fallback (runs every N ms)
let pollTimer = null;

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    // Only poll via HTTP if TCP is not connected (fallback)
    // Or poll always as double-check
    await pollVmixState();
  }, POLL_INTERVAL_MS);
  console.log(`[HTTP] Polling vMix every ${POLL_INTERVAL_MS}ms`);
}

startPolling();
startSync();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[App] Shutting down gracefully...');
  if (pollTimer) clearInterval(pollTimer);
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('[Error] Uncaught exception:', err.message);
  console.error(err.stack);
  // Keep window open in packaged app
  if (isPackaged) {
    console.log('\n[App] Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Error] Unhandled rejection at:', promise, 'reason:', reason);
  if (isPackaged) {
    console.log('\n[App] Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  }
});
