'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* tiny .env loader (no dependency) */
function loadEnv(file) {
  try {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((l) => {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m || l.trim().startsWith('#')) return;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      else v = v.replace(/(^|\s)#.*$/, '').trim(); /* unquoted value: drop an inline comment ("value   # note") */
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    });
  } catch (e) { /* no .env file */ }
}

const uid = () => 'a' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const xesc = (s) => String(s == null ? '' : s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const hesc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeKey = (k) => sha1(String(k)).slice(0, 24);

/* in-memory rate limiter: allow(key, max, windowMs) */
const hits = new Map();
function allow(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr);
  return true;
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) { const f = a.filter((t) => now - t < 3600e3); if (f.length) hits.set(k, f); else hits.delete(k); } }, 600e3).unref();

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); return d; }

/* journal settings merged with built-in defaults */
function defaultsFor(journal) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults', (journal === 'ls' ? 'ls' : 'ms') + '.json'), 'utf8'));
}
const SECRET_KEYS = ['pwHash', 'defaultPw', 'ejsService', 'ejsTemplate', 'ejsKey'];

/* ---- issue list (admin-managed, stored in settings.issuesCfg) ---- */
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function defaultIssues() { // both journals: Volume 1 = 2026 (from 1 Nov), then the 1st and 15th of every month
  const L = [];
  [[1, 10, 1], [2, 10, 15], [3, 11, 1], [4, 11, 15]].forEach(([n, m, d], i) => L.push({ y: 2026, n, v: 1, d: `2026-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, p: `${d} ${MON[m]} 2026`, vis: i < 2 ? 1 : 0, sp: '' }));
  for (let k = 0; k < 24; k++) { const m = Math.floor(k / 2), d = k % 2 ? 15 : 1; L.push({ y: 2027, n: k + 1, v: 2, d: `2027-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, p: `${d} ${MON[m]} 2027`, vis: 0, sp: '' }); }
  return L;
}
function issuesOf(S) { try { const L = JSON.parse(S.issuesCfg || 'null'); if (Array.isArray(L)) return L; } catch (e) { /* fall through */ } return []; }
/* an article is public only if it is published AND its issue is listed and switched to "shown on site" */
function artPublic(S, a) { if (!a || a.status !== 'published') return false; const x = issuesOf(S).find((i) => +i.y === +a.year && +i.n === +a.issue); return !!(x && +x.vis); }

module.exports = { defaultIssues, issuesOf, artPublic, loadEnv, uid, sha1, xesc, hesc, safeKey, allow, ensureDir, defaultsFor, SECRET_KEYS };
