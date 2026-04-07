const { getAllLogs } = require('./db');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { BASE_DIR } = require('./paths');

const EXPORTS_DIR = path.join(BASE_DIR, 'exports');
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

function msToTime(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${h > 0 ? h + 'h ' : ''}${m % 60 > 0 ? (m % 60) + 'm ' : ''}${s % 60}s`;
}

async function exportCsv() {
  const logs = await getAllLogs();
  const filename = `vmix-log-${Date.now()}.csv`;
  const filepath = path.join(EXPORTS_DIR, filename);

  const writer = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'played_at', title: 'Played At' },
      { id: 'input_number', title: 'Input #' },
      { id: 'input_name', title: 'Input Name' },
      { id: 'input_type', title: 'Type' },
      { id: 'duration_ms', title: 'Duration (ms)' },
      { id: 'position_ms', title: 'Position (ms)' },
      { id: 'loop', title: 'Loop' },
      { id: 'source', title: 'Source' },
      { id: 'screenshot_path', title: 'Screenshot' }
    ]
  });

  await writer.writeRecords(logs);
  return { filepath, filename };
}

async function exportPdf() {
  const logs = await getAllLogs();
  const filename = `vmix-log-${Date.now()}.pdf`;
  const filepath = path.join(EXPORTS_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.rect(0, 0, doc.page.width, 60).fill('#0f172a');
    doc.fillColor('#f8fafc').fontSize(20).font('Helvetica-Bold')
      .text('vMix Play Log', 40, 18);
    doc.fontSize(10).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}  |  Total entries: ${logs.length}`, 40, 42);

    doc.moveDown(3);
    doc.fillColor('#0f172a');

    // Column widths
    const cols = [
      { label: 'Date & Time', width: 130 },
      { label: 'Input #', width: 50 },
      { label: 'Input Name', width: 160 },
      { label: 'Type', width: 80 },
      { label: 'Duration', width: 70 },
      { label: 'Position', width: 70 },
      { label: 'Source', width: 60 }
    ];

    const startX = 40;
    let y = 75;
    const rowHeight = 20;

    function drawRow(values, isHeader = false, isEven = false) {
      if (y > doc.page.height - 60) {
        doc.addPage({ layout: 'landscape' });
        y = 40;
      }

      if (isHeader) {
        doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), rowHeight).fill('#1e3a5f');
      } else if (isEven) {
        doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), rowHeight).fill('#f1f5f9');
      }

      let x = startX;
      cols.forEach((col, i) => {
        doc.fillColor(isHeader ? '#ffffff' : '#1e293b')
          .fontSize(isHeader ? 8 : 7.5)
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(String(values[i] || '—'), x + 4, y + 5, { width: col.width - 8, ellipsis: true });
        x += col.width;
      });

      // Row border
      doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), rowHeight)
        .strokeColor('#cbd5e1').lineWidth(0.3).stroke();

      y += rowHeight;
    }

    // Draw header
    drawRow(['Date & Time', 'Input #', 'Input Name', 'Type', 'Duration', 'Position', 'Source'], true);

    // Draw rows
    logs.forEach((log, idx) => {
      drawRow([
        formatDate(log.played_at),
        log.input_number,
        log.input_name,
        log.input_type,
        msToTime(log.duration_ms),
        msToTime(log.position_ms),
        log.source
      ], false, idx % 2 === 0);
    });

    // Footer
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
      .text('vMix Logger — Automated Play Log', 40, doc.page.height - 30);

    doc.end();
    stream.on('finish', () => resolve({ filepath, filename }));
    stream.on('error', reject);
  });
}

module.exports = { exportCsv, exportPdf };
