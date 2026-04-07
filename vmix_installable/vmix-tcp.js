const net = require('net');
const { insertLog } = require('./db');
const { takeScreenshot, fetchVmixState, parseInput } = require('./vmix-http');

const VMIX_HOST = process.env.VMIX_HOST || 'localhost';
const VMIX_TCP_PORT = parseInt(process.env.VMIX_TCP_PORT || '8099');

let client = null;
let reconnectTimer = null;
let isConnected = false;

function connect(onStatusChange) {
  if (client) {
    client.destroy();
    client = null;
  }

  console.log(`[TCP] Connecting to vMix at ${VMIX_HOST}:${VMIX_TCP_PORT}...`);
  client = new net.Socket();

  client.connect(VMIX_TCP_PORT, VMIX_HOST, () => {
    isConnected = true;
    console.log('[TCP] Connected to vMix.');
    if (onStatusChange) onStatusChange(true);

    // Subscribe to input transitions (tally events)
    client.write('SUBSCRIBE TALLY\r\n');
    client.write('SUBSCRIBE ACTS\r\n');
  });

  let buffer = '';

  client.on('data', async (data) => {
    buffer += data.toString();
    const lines = buffer.split('\r\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;
      await handleTcpMessage(line.trim());
    }
  });

  client.on('close', () => {
    isConnected = false;
    console.log('[TCP] Connection closed. Reconnecting in 5s...');
    if (onStatusChange) onStatusChange(false);
    scheduleReconnect(onStatusChange);
  });

  client.on('error', (err) => {
    isConnected = false;
    console.error('[TCP] Connection error:', err.message);
    scheduleReconnect(onStatusChange);
  });
}

function scheduleReconnect(onStatusChange) {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => connect(onStatusChange), 5000);
}

async function handleTcpMessage(line) {
  // ACTS messages tell us when an input goes live
  // Format: ACTS InputNumber Function Value
  if (line.startsWith('ACTS OK')) {
    const parts = line.split(' ');
    // Example: ACTS OK Transition1 Cut 0
    console.log('[TCP] Event:', line);
  }

  // TALLY messages tell us tally state
  // Format: TALLY OK 1112211... (1=program, 2=preview, 0=inactive)
  if (line.startsWith('TALLY OK')) {
    const tallyString = line.replace('TALLY OK ', '').trim();
    await handleTallyChange(tallyString);
  }

  // ActiveInput notification
  if (line.startsWith('ACTIVEINPUT')) {
    const inputNum = parseInt(line.split(' ')[1]);
    if (!isNaN(inputNum)) {
      await handleActiveInput(inputNum);
    }
  }
}

let lastTally = '';

async function handleTallyChange(tallyString) {
  if (tallyString === lastTally) return;

  const prev = lastTally;
  lastTally = tallyString;

  // Find inputs that just became program (1)
  for (let i = 0; i < tallyString.length; i++) {
    const current = tallyString[i];
    const previous = prev[i] || '0';

    if (current === '1' && previous !== '1') {
      const inputNumber = i + 1;
      console.log(`[TCP] Input #${inputNumber} went LIVE`);
      await handleActiveInput(inputNumber);
    }
  }
}

async function handleActiveInput(inputNumber) {
  try {
    const state = await fetchVmixState();
    if (!state) return;

    const inputs = state.inputs;
    if (!inputs) return;

    const list = Array.isArray(inputs.input) ? inputs.input : [inputs.input];
    const rawInput = list.find(i => parseInt(i.$.number) === inputNumber);
    const input = parseInput(rawInput);

    if (!input) return;

    console.log(`[TCP] Logging: #${input.number} "${input.name}" (${input.type})`);
    const screenshot = await takeScreenshot(input.number, input.key);

    await insertLog({
      played_at: new Date().toISOString(),
      input_number: input.number,
      input_name: input.name,
      input_type: input.type,
      duration_ms: input.duration,
      position_ms: input.position,
      loop: input.loop,
      screenshot_path: screenshot,
      source: 'tcp'
    });
  } catch (err) {
    console.error('[TCP] Error handling active input:', err.message);
  }
}

function getStatus() {
  return isConnected;
}

module.exports = { connect, getStatus };
