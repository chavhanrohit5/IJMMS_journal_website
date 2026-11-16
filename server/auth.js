'use strict';
const crypto = require('crypto');
const { allow } = require('./util');

/* ---- password hashing (scrypt, built into Node) ---- */
function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(String(pw), salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${h}`;
}
function checkPw(pw, stored) {
  try {
    const [alg, salt, h] = String(stored).split('$');
    if (alg !== 'scrypt') return false;
    const t = crypto.scryptSync(String(pw), salt, 64, { N: 16384, r: 8, p: 1 });
    return crypto.timingSafeEqual(t, Buffer.from(h, 'hex'));
  } catch (e) { return false; }
}
function genPw(n = 10) {
  const c = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let o = ''; const b = crypto.randomBytes(n);
  for (let i = 0; i < n; i++) o += c[b[i] % c.length];
  return o;
}

module.exports = function createAuth(db, cfg) {
  const COOKIE = 'jsid';
  const secure = /^https:/i.test(cfg.siteUrl || '');
  const parseCookies = (req) => {
    const o = {}; String(req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
    return o;
  };
  const setCookie = (res, name, val, maxAgeSec) => {
    res.append('Set-Cookie', `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure ? '; Secure' : ''}`);
  };
  const publicUser = (u) => u && ({ id: u.id, name: u.name, email: u.email, aff: u.aff, role: u.role, ...(u.extra || {}) });

  async function createSession(res, uid) {
    const sid = crypto.randomBytes(32).toString('hex');
    await db.q('INSERT INTO sessions(sid,uid,exp) VALUES ($1,$2, now() + interval \'30 days\')', [sid, uid]);
    setCookie(res, COOKIE, sid, 30 * 86400);
  }
  async function destroySession(req, res) {
    const sid = parseCookies(req)[COOKIE];
    if (sid) await db.q('DELETE FROM sessions WHERE sid=$1', [sid]);
    setCookie(res, COOKIE, '', 0);
  }
  /* middleware: attach req.user, req.cookies */
  async function attach(req, res, next) {
    try {
      req.cookies = parseCookies(req);
      const sid = req.cookies[COOKIE];
      req.user = null;
      if (sid) {
        const r = await db.q(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.uid WHERE s.sid=$1 AND s.exp>now()`, [sid]);
        if (r.rows[0]) req.user = r.rows[0];
      }
      next();
    } catch (e) { next(e); }
  }
  const isStaff = (u) => !!u && (u.role === 'admin' || u.role === 'editor');
  const isAdminU = (u) => !!u && u.role === 'admin';
  const need = (pred, msg, code) => (req, res, next) => (pred(req.user) ? next() : res.status(code || 403).json({ error: msg }));
  const requireAuth = need((u) => !!u, 'Please log in.', 401);
  const requireStaff = need(isStaff, 'Editor access required.');
  const requireAdmin = need(isAdminU, 'Administrator access required.');

  /* CSRF: every state-changing request must carry the custom header (cannot be set cross-site without CORS) */
  function csrf(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.headers['x-requested-with'] !== 'ijmms') return res.status(403).json({ error: 'Bad request origin.' });
    next();
  }
  function throttleLogin(req, email) {
    const ip = req.ip || req.socket.remoteAddress || '';
    return allow('login:' + ip, 20, 10 * 60e3) && allow('login:' + String(email).toLowerCase(), 8, 10 * 60e3);
  }
  return { hashPw, checkPw, genPw, createSession, destroySession, attach, isStaff, isAdminU, requireAuth, requireStaff, requireAdmin, csrf, throttleLogin, publicUser, parseCookies, setCookie };
};
module.exports.hashPw = hashPw;
module.exports.checkPw = checkPw;
module.exports.genPw = genPw;
