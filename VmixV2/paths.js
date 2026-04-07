const path = require('path');

// Detect if running from pkg executable
const isPackaged = typeof process !== 'undefined' && process.pkg !== undefined;

// Get the directory where writable files should go
// In packaged app: same folder as the .exe
// In dev: project root
const BASE_DIR = isPackaged ? process.cwd() : __dirname;

module.exports = {
  isPackaged,
  BASE_DIR,
  getPath: (...segments) => path.join(BASE_DIR, ...segments)
};
