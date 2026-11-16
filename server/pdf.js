'use strict';
/* PDF generation: headless Chrome/Chromium prints the same HTML templates the website uses. */
const { execFile, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

let chromePath = null;
function findChrome() {
  if (chromePath !== null) return chromePath;
  const cands = [process.env.CHROME_PATH, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium'].filter(Boolean);
  for (const c of cands) {
    try {
      if (c.startsWith('/') && fs.existsSync(c)) { chromePath = c; return c; }
      const p = execFileSync('which', [c], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (p) { chromePath = p; return p; }
    } catch (e) { /* next */ }
  }
  chromePath = '';
  return '';
}

let running = 0;
const waiting = [];
function slot() {
  return new Promise((res) => {
    const go = () => { running++; res(() => { running--; const n = waiting.shift(); if (n) n(); }); };
    if (running < 2) go(); else waiting.push(go);
  });
}

async function renderPdf(url, outFile) {
  const chrome = findChrome();
  if (!chrome) throw new Error('No Chrome/Chromium found for PDF generation (set CHROME_PATH).');
  const release = await slot();
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'jpdf-'));
  const tmpOut = outFile + '.tmp';
  try {
    await new Promise((resolve, reject) => {
      execFile(chrome, [
        '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars',
        '--disable-field-trial-config', '--disable-background-networking', '--disable-component-update', '--disable-sync',
        '--disable-default-apps', '--disable-extensions', '--disable-breakpad', '--disable-client-side-phishing-detection',
        '--metrics-recording-only', '--no-first-run', '--no-default-browser-check', '--no-service-autorun',
        '--password-store=basic', '--use-mock-keychain', '--export-tagged-pdf',
        '--no-pdf-header-footer', '--virtual-time-budget=9000', '--run-all-compositor-stages-before-draw',
        '--user-data-dir=' + prof, '--print-to-pdf=' + tmpOut, url,
      ], { timeout: 60000 }, (err) => (err && !fs.existsSync(tmpOut) ? reject(err) : resolve()));
    });
    const st = fs.statSync(tmpOut);
    if (st.size < 1000) throw new Error('PDF generation produced an empty file.');
    fs.renameSync(tmpOut, outFile);
    return outFile;
  } finally {
    release();
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) { /* ignore */ }
    try { fs.rmSync(tmpOut, { force: true }); } catch (e) { /* ignore */ }
  }
}
module.exports = { renderPdf, findChrome };
