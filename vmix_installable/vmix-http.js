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

async function takeScreenshot(inputNumber, inputKey = null) {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    let res = null;

    // vMix correct endpoints — try input-specific thumbnail first, then program output
    const urls = [];
    if (inputKey)    urls.push(`http://${VMIX_HOST}:${VMIX_PORT}/thumbnails/input/${inputKey}`);
    if (inputNumber) urls.push(`http://${VMIX_HOST}:${VMIX_PORT}/thumbnails/input/${inputNumber}`);
    urls.push(`http://${VMIX_HOST}:${VMIX_PORT}/programimage`); // always reliable fallback

    for (const url of urls) {
      try {
        console.log(`[Screenshot] Trying: ${url}`);
        res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        if (res.status === 200 && res.data?.byteLength > 0) {
          console.log(`[Screenshot] Got image from: ${url} (${res.data.byteLength} bytes)`);
          break;
        }
      } catch (err) {
        console.warn(`[Screenshot] Failed URL ${url}: ${err.message}`);
        continue;
      }
    }

    if (!res || !res.data?.byteLength) {
      throw new Error('All screenshot endpoints failed or returned empty data');
    }

    const filename = `input_${inputNumber || 'active'}_${Date.now()}.jpg`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filepath, Buffer.from(res.data));

    console.log(`[Screenshot] Saved: ${filename}`);
    return `screenshots/${filename}`;

  } catch (err) {
    console.error(`[Screenshot] Failed for input ${inputNumber}:`, err.message);
    return null;
  }
}

function parseInput(input) {
  if (!input) return null;
  return {
    key: input.$.key || null,
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
