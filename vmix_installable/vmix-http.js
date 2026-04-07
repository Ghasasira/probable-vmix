const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { insertLog } = require('./db');
const { BASE_DIR } = require('./paths');

const VMIX_HOST = process.env.VMIX_HOST || 'localhost';
const VMIX_PORT = process.env.VMIX_PORT || '8088';
const BASE_URL = `http://${VMIX_HOST}:${VMIX_PORT}/api`;
const SCREENSHOTS_DIR = path.join(BASE_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let lastActiveInput = null;
let lastPreviewInput = null;

async function fetchVmixState() {
  try {
    const res = await axios.get(BASE_URL, { timeout: 3000 });
    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    return parsed.vmix;
  } catch (err) {
    console.error('[HTTP] Failed to fetch vMix state:', err.message);
    return null;
  }
}

async function takeScreenshot(inputNumber) {
  try {
    // Wait a brief moment to ensure the transition is fully complete in vMix
    await new Promise(resolve => setTimeout(resolve, 800));

    // Using /previewimage/ instead of Function=Snapshot to get raw data directly
    const url = `http://${VMIX_HOST}:${VMIX_PORT}/previewimage/${inputNumber}`;
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    
    const filename = `input_${inputNumber}_${Date.now()}.jpg`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filepath, res.data);
    
    return `screenshots/${filename}`;
  } catch (err) {
    if (err.response) {
      console.error(`[Screenshot] Failed for input ${inputNumber}: HTTP ${err.response.status} - ${err.response.statusText}`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error(`[Screenshot] Failed for input ${inputNumber}: Connection refused at ${VMIX_HOST}:${VMIX_PORT}`);
    } else {
      console.error(`[Screenshot] Failed for input ${inputNumber}:`, err.message);
    }
    return null;
  }
}

function parseInput(input) {
  if (!input) return null;
  return {
    number: parseInt(input.$.number) || 0,
    name: input.$.shortTitle || input.$.title || 'Unknown',
    type: input.$.type || 'Unknown',
    duration: parseInt(input.$.duration) || 0,
    position: parseInt(input.$.position) || 0,
    loop: input.$.loop === 'True',
    state: input.$.state || ''
  };
}

function findInputByNumber(inputs, number) {
  if (!inputs) return null;
  const list = Array.isArray(inputs.input) ? inputs.input : [inputs.input];
  return list.find(i => parseInt(i.$.number) === number) || null;
}

async function pollVmixState() {
  const state = await fetchVmixState();
  if (!state) return;

  const activeNumber = parseInt(state.active);
  const previewNumber = parseInt(state.preview);

  // Detect active input change (went live)
  if (activeNumber && activeNumber !== lastActiveInput) {
    lastActiveInput = activeNumber;
    const rawInput = findInputByNumber(state.inputs, activeNumber);
    const input = parseInput(rawInput);

    if (input) {
      console.log(`[HTTP] Active input changed → #${input.number} "${input.name}" (${input.type})`);
      const screenshot = await takeScreenshot(input.number);
      await insertLog({
        played_at: new Date().toISOString(),
        input_number: input.number,
        input_name: input.name,
        input_type: input.type,
        duration_ms: input.duration,
        position_ms: input.position,
        loop: input.loop,
        screenshot_path: screenshot,
        source: 'http-poll'
      });
    }
  }

  // Optionally track preview changes
  if (previewNumber && previewNumber !== lastPreviewInput) {
    lastPreviewInput = previewNumber;
    // Could log preview events separately if needed
  }
}

module.exports = { pollVmixState, fetchVmixState, takeScreenshot, parseInput };
