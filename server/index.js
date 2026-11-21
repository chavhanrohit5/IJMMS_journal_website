'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');

const U = require('./util');
const ROOT = path.join(__dirname, '..');
U.loadEnv(path.resolve(ROOT, process.env.ENV_FILE || '.env'));

const createDb = require('./db');
const createAuth = require('./auth');
const createMailer = require('./mailer');
const seo = require('./seo');
const { renderPdf, findChrome } = require('./pdf');

const env = process.env;
const JOURNAL = env.JOURNAL === 'ls' ? 'ls' : 'ms';
const PORT = parseInt(env.PORT || '3000', 10);
const SITE = (env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const DATA = U.ensureDir(path.resolve(ROOT, env.DATA_DIR || (JOURNAL === 'ls' ? 'data-ijmls' : 'data-ijmms')));
const FILES = U.ensureDir(path.join(DATA, 'files'));
const MEDIA = U.ensureDir(path.join(DATA, 'media'));
const PDFS = U.ensureDir(path.join(DATA, 'pdf'));
const PUBLIC = path.resolve(ROOT, env.PUBLIC_DIR || path.join('public', JOURNAL));
const SECRET = env.SESSION_SECRET || crypto.randomBytes(24).toString('hex');
if (!env.SESSION_SECRET) console.warn('[warn] SESSION_SECRET not set - render tokens reset on every restart (set it in .env).');

const db = createDb(env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ijmms');
const auth = createAuth(db, { siteUrl: SITE });
const mailer = createMailer(env);
const DEFAULTS = U.defaultsFor(JOURNAL);

const ID_RE = /^[A-Za-z0-9_-]{1,48}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (res, msg, code) => res.status(code || 400).json({ error: msg });

/* ---------------- settings ---------------- */
async function getSettings() {
  const stored = await db.kvGet('settings', {});
  const S = { ...DEFAULTS, ...stored };
  return S;
}
function publicSettings(S, staff) {
  const o = { ...S };
  U.SECRET_KEYS.forEach((k) => delete o[k]);
  if (!staff) { delete o.ejsService; delete o.ejsTemplate; delete o.ejsKey; }
  o.defaultPw = false;
  return o;
}

/* ---------------- article persistence ---------------- */
const HEAVY = ['sections', 'refs', 'figures', 'ack', 'funding', 'coi', 'ethics', 'data', 'contrib', 'consent', 'reg', 'supp', 'abv'];
const lightArticle = (a) => { const o = { ...a, _light: true }; HEAVY.forEach((k) => { if (k === 'figures') o.figures = (a.figures || []).map((f) => ({ caption: f.caption || '', wide: !!f.wide })); else if (k === 'sections') o.sections = []; else o[k] = ''; }); o.nfig = (a.figures || []).length; return o; };
const PUB_TPL = 'pubstd-2026-11-21k'; // bump when public/*/js/pubstd.js changes the printed layout
const contentHash = (a, S) => U.sha1(JSON.stringify({ ...a, views: 0, downloads: 0, _light: undefined, T: PUB_TPL, S: [S.name, S.abbr, S.short, S.publisher, S.issnP, S.issnO, S.license, S.apcApproved, S.doiPrefix, S.freq, S.website, S.address, S.email, S.editorName, S.pdfTemplate, S.pdfHeader] }));

function saveFigures(a) {
  (a.figures || []).forEach((f, i) => {
    const m = /^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/s.exec(f.data || '');
    if (!m) return;
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 12e6) throw new Error('Figure ' + (i + 1) + ' is too large.');
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const name = `${a.id}-${U.sha1(m[2]).slice(0, 10)}.${ext}`;
    fs.writeFileSync(path.join(MEDIA, name), buf);
    f.data = '/media/' + name;
  });
}
async function saveArticle(a) {
  if (!a || !ID_RE.test(String(a.id || ''))) throw new Error('Bad article id.');
  const ex = await db.q('SELECT data FROM articles WHERE id=$1', [a.id]);
  if (a._light && ex.rows[0]) {
    const merged = { ...ex.rows[0].data };
    Object.keys(a).forEach((k) => { if (!HEAVY.includes(k) && k !== '_light' && k !== 'nfig') merged[k] = a[k]; });
    a = merged;
  }
  delete a._light; delete a.nfig;
  const wasPublished = !!(ex.rows[0] && ex.rows[0].data && ex.rows[0].data.status === 'published');
  const prevCert = ex.rows[0] && ex.rows[0].data && ex.rows[0].data.certIssued;
  if (prevCert && !a.certIssued) a.certIssued = prevCert;
  const issueCerts = a.status === 'published' && !a.certIssued && !wasPublished;
  if (issueCerts) a.certIssued = new Date().toISOString();
  saveFigures(a);
  a.title = String(a.title || '').slice(0, 1000);
  await db.q(`INSERT INTO articles(id,status,pub,data,updated) VALUES ($1,$2,$3,$4,now())
    ON CONFLICT (id) DO UPDATE SET status=$2,pub=$3,data=$4,updated=now()`, [a.id, a.status === 'published' ? 'published' : 'draft', a.published || '', JSON.stringify(a)]);
  if (a.status === 'published') warmPdf(a.id).catch((e) => console.warn('[pdf]', e.message));
  if (issueCerts) publicationMail(a).catch((e) => console.warn('[cert]', e.message));
  return a;
}

/* ---------------- certificates of publication ---------------- */
const authorsOf = (a) => String(a.authorsRaw || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const p = l.split('|').map((x) => x.trim()); return { name: p[0], aff: p[1] || '' }; });
const safeName = (s) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'author';
async function certPdf(a, n) { // n = 0-based author index, or null for all authors in one file
  const au = authorsOf(a);
  const f = path.join(os_tmp(), `cert-${U.uid()}.pdf`);
  await renderPdf(localUrl('cert', `${a.id}~${n == null ? 'all' : n + 1}`), f);
  const buf = fs.readFileSync(f); fs.rmSync(f, { force: true });
  const S = await getSettings();
  const who = n == null ? 'all-authors' : safeName(au[n] && au[n].name);
  return { filename: `Certificate-of-Publication-${S.short}-${who}.pdf`, content: buf, contentType: 'application/pdf' };
}
async function publicationMail(a) {
  const S = await getSettings();
  let to = '', toName = '', ref = '';
  if (a.subId) {
    const s = (await db.q('SELECT data FROM subs WHERE id=$1', [a.subId])).rows[0];
    if (s) {
      ref = s.data.ref || '';
      const u = s.data.authorId ? (await db.q('SELECT * FROM users WHERE id=$1', [s.data.authorId])).rows[0] : null;
      to = (u && u.email) || s.data.authorEmail || ''; toName = (u && u.name) || s.data.authorName || '';
    }
  }
  if (!to) { const m = String(a.corr || '').match(/[^\s,;<>()]+@[^\s,;<>()]+\.[A-Za-z]{2,}/); if (m) { to = m[0]; toName = String(a.corr).split(',')[0].trim(); } }
  if (!to) { console.log(`[cert] ${a.id}: no corresponding-author e-mail; certificates are available in Admin.`); return; }
  const au = authorsOf(a);
  const link = `${SITE}/article/${a.id}`;
  const cite = `${S.abbr} ${a.year};${a.vol}(${a.issue})${a.pages ? ':' + a.pages : ''}`;
  const body = `Dear ${toName || 'Author'},\n\nWe are delighted to inform you that your article has been published online.\n\n`
    + `Title    : ${a.title}\nCitation : ${cite}\n${a.doi ? 'DOI      : ' + a.doi + '\n' : ''}Link     : ${link}\n\n`
    + `Certificates of Publication for ${au.length > 1 ? 'all ' + au.length + ' authors are' : 'the author is'} attached to this e-mail (one PDF per author). `
    + `Please forward them to your co-authors. Each certificate can be verified online using the QR code printed on it, and can be downloaded again at any time from your submission page.\n\n`
    + `Please share the article link with your colleagues. Thank you for publishing with ${S.short}.\n\n`
    + `With regards,\n${S.editorName ? S.editorName + '\n' : ''}${S.editorTitle || 'Editorial Office'}\n${S.name} (${S.short})\n${S.publisher}${S.address ? ', ' + S.address : ''}\n${S.email}\n`;
  const rec = { id: U.uid(), to: to.toLowerCase(), toName, subject: `${ref ? '[' + ref + '] ' : ''}Your article is now published - Certificate of Publication`, body, att: 'cert', subId: a.subId || '', artId: a.id, date: new Date().toISOString(), sent: false, auto: false, status: mailer.configured ? 'sending' : 'queued' };
  await db.q('INSERT INTO outbox(id,data) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [rec.id, JSON.stringify(rec)]);
  if (mailer.configured) await deliver(rec.id);
}

/* ---------------- PDFs ---------------- */
function renderToken(kind, id, expSec = 300) {
  const exp = Math.floor(Date.now() / 1000) + expSec;
  return exp + '.' + crypto.createHmac('sha256', SECRET).update(`${kind}|${id}|${exp}`).digest('hex').slice(0, 32);
}
function renderTokenOk(kind, id, t) {
  const [exp, sig] = String(t || '').split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const good = crypto.createHmac('sha256', SECRET).update(`${kind}|${id}|${exp}`).digest('hex').slice(0, 32);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
const localUrl = (kind, id) => `http://127.0.0.1:${PORT}/render/${kind}/${encodeURIComponent(id)}?t=${renderToken(kind, id)}`;
async function articlePdfFile(id) {
  const r = await db.q('SELECT data FROM articles WHERE id=$1', [id]);
  if (!r.rows[0]) return null;
  const a = r.rows[0].data; const S = await getSettings();
  const f = path.join(PDFS, `${id}-${contentHash(a, S).slice(0, 16)}.pdf`);
  if (fs.existsSync(f)) return f;
  if (!rendering.has(f)) { // one render per file, even if a download arrives while the publish-time render is running
    rendering.set(f, (async () => {
      await renderPdf(localUrl('article', id), f);
      fs.readdirSync(PDFS).filter((n) => n.startsWith(id + '-') && path.join(PDFS, n) !== f).forEach((n) => fs.rmSync(path.join(PDFS, n), { force: true }));
      return f;
    })().finally(() => rendering.delete(f)));
  }
  return rendering.get(f);
}
const rendering = new Map();
const warming = new Set();
async function warmPdf(id) {
  if (warming.has(id) || !findChrome()) return;
  warming.add(id);
  try { await articlePdfFile(id); } finally { warming.delete(id); }
}
const KIND_FILE = { ack: 'Acknowledgement-of-receipt', accept: 'Letter-of-acceptance', revack: 'Reviewer-application-acknowledgement', revappoint: 'Reviewer-appointment-letter', cf: 'Copyright-form' };
async function letterPdf(kind, id) {
  const f = path.join(os_tmp(), `jl-${U.uid()}.pdf`);
  await renderPdf(localUrl(kind, id), f);
  const buf = fs.readFileSync(f); fs.rmSync(f, { force: true });
  return { filename: `${KIND_FILE[kind] || kind}.pdf`, content: buf, contentType: 'application/pdf' };
}
const os_tmp = () => require('os').tmpdir();

/* ---------------- mail queue ---------------- */
async function attachmentsFor(m) {
  if (m.att === 'cert' && m.artId) {
    if (!findChrome()) return [];
    const r = (await db.q('SELECT data FROM articles WHERE id=$1', [m.artId])).rows[0];
    if (!r) return [];
    const out = [];
    for (let i = 0; i < authorsOf(r.data).length; i++) {
      try { out.push(await certPdf(r.data, i)); } catch (e) { console.warn('[mail] certificate failed:', e.message); }
    }
    return out;
  }
  if (!m.att || !m.subId) return [];
  if (!findChrome()) return [];
  const kind = { ack: 'ack', accept: 'accept', revack: 'revack', revappoint: 'revappoint', cf: 'cf' }[m.att];
  if (!kind) return [];
  try { return [await letterPdf(kind, m.subId)]; } catch (e) { console.warn('[mail] attachment failed:', e.message); return []; }
}
async function deliver(id) {
  const r = await db.q('SELECT data FROM outbox WHERE id=$1', [id]);
  if (!r.rows[0]) return null;
  const m = r.rows[0].data; const S = await getSettings();
  if (!mailer.configured) { m.status = 'queued'; await db.q('UPDATE outbox SET data=$2 WHERE id=$1', [id, JSON.stringify(m)]); return m; }
  try {
    const attachments = await attachmentsFor(m);
    await mailer.send({ to: m.to, toName: m.toName, subject: m.subject, body: m.body, from: `"${S.short} Editorial Office" <${S.email}>`, replyTo: S.email, attachments });
    m.sent = true; m.auto = true; m.status = 'sent'; m.error = ''; m.attached = attachments.length > 0;
  } catch (e) { m.status = 'failed'; m.error = String(e.message || e).slice(0, 300); }
  await db.q('UPDATE outbox SET data=$2 WHERE id=$1', [id, JSON.stringify(m)]);
  return m;
}

/* ---------------- app ---------------- */
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '60mb' }));
app.use(auth.attach);
app.use('/api', auth.csrf);
app.use('/media', express.static(MEDIA, { maxAge: '30d', immutable: true }));

/* ---- bootstrap: everything the front end needs for the current visitor ---- */
app.get('/api/bootstrap', wrap(async (req, res) => {
  const u = req.user; const staff = auth.isStaff(u);
  const S = await getSettings();
  const out = { settings: publicSettings(S, staff), me: u ? auth.publicUser(u) : null, flags: { server: true, smtp: mailer.configured, pdf: !!findChrome(), journal: JOURNAL } };
  const ar = await db.q(staff ? 'SELECT data FROM articles' : "SELECT data FROM articles WHERE status='published'");
  out.articles = ar.rows.map((r) => lightArticle(r.data));
  out.subs = []; out.users = []; out.outbox = []; out.revapps = [];
  if (staff) {
    out.subs = (await db.q('SELECT data FROM subs ORDER BY updated DESC')).rows.map((r) => r.data);
    out.users = (await db.q('SELECT * FROM users ORDER BY created')).rows.map(auth.publicUser);
    out.outbox = (await db.q('SELECT data FROM outbox ORDER BY created DESC LIMIT 200')).rows.map((r) => r.data).reverse();
    out.revapps = (await db.q('SELECT data FROM revapps ORDER BY created')).rows.map((r) => r.data);
  } else if (u) {
    const rows = (await db.q('SELECT data FROM subs WHERE author_id=$1 OR reviewer_id=$1 ORDER BY updated DESC', [u.id])).rows;
    out.subs = rows.map((r) => { const s = r.data; if (s.authorId === u.id && s.review) { s.review = { ...s.review }; delete s.review.conf; } return s; });
    out.users = [auth.publicUser(u)];
  }
  /* visitor counter: one count per browser per day */
  const day = new Date().toISOString().slice(0, 10);
  if (req.cookies.vseen !== day) { await db.nextCounter('visits'); auth.setCookie(res, 'vseen', day, 86400); }
  out.visits = await db.getCounter('visits');
  res.json(out);
}));
app.get('/api/articles/:id', wrap(async (req, res) => {
  const r = await db.q('SELECT data,status FROM articles WHERE id=$1', [req.params.id]);
  if (!r.rows[0] || (r.rows[0].status !== 'published' && !auth.isStaff(req.user))) return bad(res, 'Not found.', 404);
  res.json(r.rows[0].data);
}));

/* ---- auth ---- */
app.post('/api/login', wrap(async (req, res) => {
  let email = String(req.body.email || '').trim().toLowerCase() || 'admin';
  if (!auth.throttleLogin(req, email)) return bad(res, 'Too many attempts. Try again in a few minutes.', 429);
  const r = await db.q('SELECT * FROM users WHERE lower(email)=$1', [email]);
  const u = r.rows[0];
  if (!u || !auth.checkPw(req.body.password || '', u.pw)) return bad(res, email === 'admin' ? 'Wrong password.' : 'Wrong email or password.', 401);
  await auth.createSession(res, u.id);
  res.json({ user: auth.publicUser(u) });
}));
app.post('/api/logout', wrap(async (req, res) => { await auth.destroySession(req, res); res.json({ ok: 1 }); }));
app.post('/api/register', wrap(async (req, res) => {
  if (!U.allow('reg:' + req.ip, 10, 3600e3)) return bad(res, 'Too many registrations from this address.', 429);
  const { name, email, aff } = req.body; let pw = String(req.body.password || '');
  if (!name || !EMAIL_RE.test(String(email || ''))) return bad(res, 'Enter your name and a valid email.');
  if (String(email).toLowerCase() === 'admin') return bad(res, 'That email is already registered.');
  if (pw && pw.length < 6) return bad(res, 'Password must be at least 6 characters.');
  const tmp = pw ? '' : auth.genPw(); if (!pw) pw = tmp;
  const id = U.uid();
  try { await db.q('INSERT INTO users(id,email,name,aff,role,pw) VALUES ($1,$2,$3,$4,$5,$6)', [id, String(email).trim(), String(name).trim().slice(0, 200), String(aff || '').slice(0, 300), 'author', auth.hashPw(pw)]); }
  catch (e) { if (e.code === '23505') return bad(res, 'That email is already registered.', 409); throw e; }
  await auth.createSession(res, id);
  const u = (await db.q('SELECT * FROM users WHERE id=$1', [id])).rows[0];
  res.json({ user: auth.publicUser(u), tmp });
}));
app.post('/api/password', auth.requireAuth, wrap(async (req, res) => {
  const u = req.user; const n = String(req.body.new || '');
  if (n.length < 6) return bad(res, 'New password needs 6+ characters.');
  if (!auth.checkPw(req.body.old || '', u.pw)) return bad(res, 'Current password is wrong.', 403);
  await db.q('UPDATE users SET pw=$2 WHERE id=$1', [u.id, auth.hashPw(n)]);
  res.json({ ok: 1 });
}));
app.post('/api/admin/password', auth.requireAdmin, wrap(async (req, res) => {
  const n = String(req.body.password || '');
  if (n.length < 8) return bad(res, 'Admin password must be at least 8 characters.');
  await db.q('UPDATE users SET pw=$2 WHERE id=$1', [req.user.id, auth.hashPw(n)]);
  res.json({ ok: 1 });
}));

/* ---- users (admin) ---- */
app.post('/api/users', auth.requireAdmin, wrap(async (req, res) => {
  const { name, email, role } = req.body; let pw = String(req.body.password || '');
  if (!name || !EMAIL_RE.test(String(email || ''))) return bad(res, 'Name and valid email required.');
  if (!['author', 'reviewer', 'editor'].includes(role)) return bad(res, 'Invalid role.');
  if (pw && pw.length < 6) return bad(res, 'Password needs 6+ characters.');
  const tmp = pw ? '' : auth.genPw(); if (!pw) pw = tmp;
  const id = U.uid();
  try { await db.q('INSERT INTO users(id,email,name,aff,role,pw,extra) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, String(email).trim(), String(name).trim(), String(req.body.aff || ''), role, auth.hashPw(pw), JSON.stringify(req.body.extra || {})]); }
  catch (e) { if (e.code === '23505') return bad(res, 'Email already exists.', 409); throw e; }
  res.json({ user: auth.publicUser((await db.q('SELECT * FROM users WHERE id=$1', [id])).rows[0]), tmp });
}));
app.delete('/api/users/:id', auth.requireAdmin, wrap(async (req, res) => {
  if (req.params.id === 'admin' || req.params.id === req.user.id) return bad(res, 'This account cannot be deleted.');
  await db.q('DELETE FROM sessions WHERE uid=$1', [req.params.id]);
  await db.q('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ ok: 1 });
}));
app.post('/api/users/:id/reset', auth.requireAdmin, wrap(async (req, res) => {
  const tmp = auth.genPw();
  const r = await db.q('UPDATE users SET pw=$2 WHERE id=$1 RETURNING id', [req.params.id, auth.hashPw(tmp)]);
  if (!r.rowCount) return bad(res, 'No such user.', 404);
  await db.q('DELETE FROM sessions WHERE uid=$1', [req.params.id]);
  res.json({ tmp });
}));

/* ---- settings ---- */
app.put('/api/settings', auth.requireAdmin, wrap(async (req, res) => {
  const body = req.body || {}; const cur = await db.kvGet('settings', {});
  const next = { ...cur };
  Object.keys(body).forEach((k) => { if (!U.SECRET_KEYS.includes(k) && k.length < 60 && (typeof body[k] === 'string' || typeof body[k] === 'boolean' || typeof body[k] === 'number')) next[k] = body[k]; });
  await db.kvSet('settings', next);
  res.json({ ok: 1 });
}));

/* ---- articles (staff) ---- */
app.put('/api/articles/:id', auth.requireStaff, wrap(async (req, res) => {
  if (req.body.id !== req.params.id) return bad(res, 'Id mismatch.');
  const a = await saveArticle(req.body);
  res.json({ ok: 1, figures: a.figures || [] });
}));
app.post('/api/articles/bulk', auth.requireStaff, wrap(async (req, res) => {
  const list = Array.isArray(req.body.articles) ? req.body.articles : [];
  for (const a of list) await saveArticle(a);
  res.json({ ok: 1, n: list.length });
}));
app.post('/api/articles/bulk-delete', auth.requireStaff, wrap(async (req, res) => {
  const ids = (req.body.ids || []).filter((i) => ID_RE.test(i));
  if (ids.length) await db.q('DELETE FROM articles WHERE id = ANY($1)', [ids]);
  res.json({ ok: 1 });
}));
app.delete('/api/articles/:id', auth.requireStaff, wrap(async (req, res) => {
  await db.q('DELETE FROM articles WHERE id=$1', [req.params.id]);
  await removeFile(req.params.id);
  fs.readdirSync(PDFS).filter((n) => n.startsWith(req.params.id + '-')).forEach((n) => fs.rmSync(path.join(PDFS, n), { force: true }));
  res.json({ ok: 1 });
}));
app.post('/api/articles/:id/view', wrap(async (req, res) => {
  if (U.allow('view:' + req.ip + req.params.id, 1, 3600e3)) {
    await db.q(`UPDATE articles SET data = jsonb_set(data,'{views}', to_jsonb(COALESCE((data->>'views')::int,0)+1)) WHERE id=$1 AND status='published'`, [req.params.id]);
  }
  res.json({ ok: 1 });
}));

/* ---- submissions ---- */
const AUTHOR_KEYS = ['fileName', 'hasFile', 'note', 'branch', 'history', 'corr', 'keywords', 'abstract', 'title', 'authorsRaw', 'type'];
const nextRef = async (S) => { const y = new Date().getFullYear(); const n = await db.nextCounter('ref-' + y); return `${S.short}/${y}/${String(n).padStart(4, '0')}`; };
app.put('/api/subs/:id', auth.requireAuth, wrap(async (req, res) => {
  const id = req.params.id; const u = req.user; const inc = req.body || {};
  if (!ID_RE.test(id) || inc.id !== id) return bad(res, 'Bad submission id.');
  const S = await getSettings();
  const ex = (await db.q('SELECT data FROM subs WHERE id=$1', [id])).rows[0];
  let s;
  if (!ex) {
    s = { ...inc };
    if (!auth.isStaff(u)) {
      Object.assign(s, { authorId: u.id, authorName: u.name, authorEmail: u.email, status: 'Submitted', reviewerId: '' });
      delete s.review; delete s.decision; delete s.reviewerName; delete s.articleId;
    }
  } else {
    const cur = ex.data;
    if (auth.isStaff(u)) s = { ...inc };
    else if (cur.authorId === u.id) {
      s = { ...cur }; AUTHOR_KEYS.forEach((k) => { if (inc[k] !== undefined) s[k] = inc[k]; });
      if (inc.status === 'Submitted') s.status = 'Submitted';
      if (inc.ref && !cur.ref) s.ref = inc.ref;
    } else if (cur.reviewerId === u.id) {
      s = { ...cur }; if (inc.review) s.review = inc.review; if (Array.isArray(inc.history)) s.history = inc.history; s.status = 'Under review';
    } else return bad(res, 'Not allowed.', 403);
    if (Array.isArray(s.history) && Array.isArray(cur.history) && s.history.length < cur.history.length) s.history = cur.history;
    s.authorId = cur.authorId; if (!auth.isStaff(u)) s.reviewerId = cur.reviewerId || '';
  }
  const clash = s.ref ? (await db.q('SELECT id FROM subs WHERE ref=$1 AND id<>$2', [s.ref, id])).rows[0] : null;
  if (!s.ref || clash) s.ref = await nextRef(S);
  await db.q(`INSERT INTO subs(id,author_id,reviewer_id,ref,data,updated) VALUES ($1,$2,$3,$4,$5,now())
    ON CONFLICT (id) DO UPDATE SET author_id=$2,reviewer_id=$3,ref=$4,data=$5,updated=now()`, [id, s.authorId || '', s.reviewerId || '', s.ref, JSON.stringify(s)]);
  res.json({ ok: 1, sub: s });
}));
app.delete('/api/subs/:id', auth.requireStaff, wrap(async (req, res) => {
  await db.q('DELETE FROM subs WHERE id=$1', [req.params.id]);
  await removeFile('sub:' + req.params.id);
  res.json({ ok: 1 });
}));

/* ---- files (manuscripts, resumes, uploaded article PDFs) ---- */
const KEY_RE = /^(sub:[A-Za-z0-9_-]{1,48}|rv_[A-Za-z0-9_-]{1,48}|[A-Za-z0-9_-]{1,48})$/;
const MIMES = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
function magicOk(ext, b) {
  if (ext === 'pdf') return b.slice(0, 4).toString() === '%PDF';
  if (ext === 'docx') return b.slice(0, 2).toString() === 'PK';
  if (ext === 'doc') return b[0] === 0xd0 && b[1] === 0xcf;
  return false;
}
async function removeFile(key) {
  const r = await db.q('DELETE FROM files WHERE key=$1 RETURNING path', [key]);
  if (r.rows[0]) fs.rmSync(r.rows[0].path, { force: true });
}
app.put('/api/files/:key', express.raw({ type: () => true, limit: '30mb' }), wrap(async (req, res) => {
  const key = req.params.key; const u = req.user;
  if (!KEY_RE.test(key)) return bad(res, 'Bad key.');
  const name = decodeURIComponent(String(req.headers['x-filename'] || key)).replace(/[\\/]/g, '_').slice(0, 200);
  const ext = (name.split('.').pop() || '').toLowerCase();
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) return bad(res, 'Empty file.');
  if (!MIMES[ext] || !magicOk(ext, buf)) return bad(res, 'Only valid PDF, DOC or DOCX files are accepted.');
  if (key.startsWith('rv_')) {
    if (buf.length > 3 * 1024 * 1024) return bad(res, 'Resume must be 3 MB or smaller.');
    if (!u && !U.allow('rv:' + req.ip, 6, 3600e3)) return bad(res, 'Too many uploads. Try later.', 429);
  } else if (key.startsWith('sub:')) {
    if (!u) return bad(res, 'Please log in.', 401);
    const sid = key.slice(4); const s = (await db.q('SELECT author_id FROM subs WHERE id=$1', [sid])).rows[0];
    if (s && !(auth.isStaff(u) || s.author_id === u.id)) return bad(res, 'Not allowed.', 403);
  } else {
    if (!auth.isStaff(u)) return bad(res, 'Editor access required.', 403);
    if (ext !== 'pdf') return bad(res, 'Article files must be PDF.');
  }
  const file = path.join(FILES, U.safeKey(key));
  fs.writeFileSync(file, buf);
  await db.q(`INSERT INTO files(key,name,mime,size,path,owner) VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (key) DO UPDATE SET name=$2,mime=$3,size=$4,path=$5,created=now()`, [key, name, MIMES[ext], buf.length, file, u ? u.id : '']);
  res.json({ ok: 1 });
}));
async function canReadFile(key, f, u) {
  if (key.startsWith('rv_')) return auth.isStaff(u);
  if (key.startsWith('sub:')) {
    if (!u) return false; if (auth.isStaff(u)) return true;
    const s = (await db.q('SELECT author_id,reviewer_id FROM subs WHERE id=$1', [key.slice(4)])).rows[0];
    return s ? (s.author_id === u.id || s.reviewer_id === u.id) : f.owner === u.id;
  }
  const a = (await db.q('SELECT status FROM articles WHERE id=$1', [key])).rows[0];
  return !!a && (a.status === 'published' || auth.isStaff(u));
}
app.get('/api/files/:key', wrap(async (req, res) => {
  const key = req.params.key;
  if (!KEY_RE.test(key)) return bad(res, 'Bad key.');
  const f = (await db.q('SELECT * FROM files WHERE key=$1', [key])).rows[0];
  if (!f) return bad(res, 'File not found.', 404);
  if (!(await canReadFile(key, f, req.user))) return bad(res, 'Not allowed.', req.user ? 403 : 401);
  res.setHeader('Content-Type', f.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`);
  fs.createReadStream(f.path).pipe(res);
}));
app.delete('/api/files/:key', auth.requireAuth, wrap(async (req, res) => {
  const key = req.params.key; const u = req.user;
  if (!KEY_RE.test(key)) return bad(res, 'Bad key.');
  if (!auth.isStaff(u)) { const f = (await db.q('SELECT owner FROM files WHERE key=$1', [key])).rows[0]; if (!f || f.owner !== u.id) return bad(res, 'Not allowed.', 403); }
  await removeFile(key); res.json({ ok: 1 });
}));

/* ---- reviewer applications ---- */
app.post('/api/revapps', wrap(async (req, res) => {
  const u = req.user; const a = req.body || {};
  if (!u && !U.allow('rvapp:' + req.ip, 5, 3600e3)) return bad(res, 'Too many applications from this address.', 429);
  if (!ID_RE.test(String(a.id || '')) || !EMAIL_RE.test(String(a.email || '')) || !a.name) return bad(res, 'Incomplete application.');
  if ((await db.q("SELECT 1 FROM revapps WHERE lower(data->>'email')=$1 AND data->>'status' <> 'Rejected'", [String(a.email).toLowerCase()])).rowCount) return bad(res, 'An application with this e-mail already exists.', 409);
  const S = await getSettings(); const y = new Date().getFullYear(); const n = await db.nextCounter('revref-' + y);
  const r = { ...a, status: 'Pending', ref: `RA/${S.short}/${y}/${String(n).padStart(4, '0')}`, created: Date.now(), date: new Date().toISOString().slice(0, 10) };
  delete r.approvedDate;
  await db.q('INSERT INTO revapps(id,data) VALUES ($1,$2)', [r.id, JSON.stringify(r)]);
  res.json({ ok: 1, app: r });
}));
app.put('/api/revapps/:id', auth.requireStaff, wrap(async (req, res) => {
  const ex = (await db.q('SELECT data FROM revapps WHERE id=$1', [req.params.id])).rows[0];
  if (!ex) return bad(res, 'Not found.', 404);
  const r = { ...ex.data, status: req.body.status || ex.data.status, approvedDate: req.body.approvedDate || ex.data.approvedDate };
  await db.q('UPDATE revapps SET data=$2 WHERE id=$1', [req.params.id, JSON.stringify(r)]);
  res.json({ ok: 1, app: r });
}));
app.delete('/api/revapps/:id', auth.requireStaff, wrap(async (req, res) => {
  await db.q('DELETE FROM revapps WHERE id=$1', [req.params.id]); await removeFile('rv_' + req.params.id); res.json({ ok: 1 });
}));
app.post('/api/revapps/:id/approve', auth.requireAdmin, wrap(async (req, res) => {
  const ex = (await db.q('SELECT data FROM revapps WHERE id=$1', [req.params.id])).rows[0];
  if (!ex) return bad(res, 'Not found.', 404);
  const r = ex.data; let tmp = '', user;
  const ux = (await db.q('SELECT * FROM users WHERE lower(email)=$1', [String(r.email).toLowerCase()])).rows[0];
  if (ux) {
    if (ux.role === 'admin') return bad(res, 'This e-mail belongs to an administrator.');
    await db.q('UPDATE users SET role=$2, extra=$3 WHERE id=$1', [ux.id, 'reviewer', JSON.stringify({ expertise: r.expertise || [] })]);
    user = (await db.q('SELECT * FROM users WHERE id=$1', [ux.id])).rows[0];
  } else {
    tmp = auth.genPw(); const id = U.uid();
    await db.q('INSERT INTO users(id,email,name,aff,role,pw,extra) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, r.email, r.name, r.aff || '', 'reviewer', auth.hashPw(tmp), JSON.stringify({ expertise: r.expertise || [], rvId: r.id })]);
    user = (await db.q('SELECT * FROM users WHERE id=$1', [id])).rows[0];
  }
  r.status = 'Approved'; r.approvedDate = new Date().toISOString().slice(0, 10);
  await db.q('UPDATE revapps SET data=$2 WHERE id=$1', [r.id, JSON.stringify(r)]);
  res.json({ ok: 1, user: auth.publicUser(user), tmp, app: r, existed: !!ux });
}));

/* ---- outbox / email ---- */
const ATTS = ['ack', 'accept', 'revack', 'revappoint', 'cf', ''];
app.post('/api/outbox', wrap(async (req, res) => {
  const u = req.user; const m = req.body || {}; const S = await getSettings();
  const to = String(m.to || '').trim().toLowerCase();
  if (!ID_RE.test(String(m.id || '')) || !EMAIL_RE.test(to)) return bad(res, 'Bad message.');
  if (!ATTS.includes(m.att || '')) return bad(res, 'Bad attachment type.');
  let allowed = auth.isStaff(u);
  if (!allowed && u) {
    allowed = to === String(u.email).toLowerCase() || to === String(S.email).toLowerCase();
    if (!allowed && m.subId) {
      const s = (await db.q('SELECT data FROM subs WHERE id=$1', [m.subId])).rows[0];
      if (s && (s.data.authorId === u.id || s.data.reviewerId === u.id)) allowed = [s.data.authorEmail, s.data.authorEmail && ''].includes(to) || to === String(S.email).toLowerCase();
    }
  }
  if (!allowed && !u) {
    if (!U.allow('mailanon:' + req.ip, 8, 3600e3)) return bad(res, 'Too many requests.', 429);
    allowed = ['revack'].includes(m.att) || to === String(S.email).toLowerCase();
  }
  if (!allowed) return bad(res, 'You may not send e-mail to that address.', 403);
  const rec = { id: m.id, to, toName: String(m.toName || '').slice(0, 200), subject: String(m.subject || '').replace(/[\r\n]+/g, ' ').slice(0, 300), body: String(m.body || '').slice(0, 30000), att: m.att || '', subId: String(m.subId || ''), date: new Date().toISOString(), sent: false, auto: false, status: mailer.configured ? 'sending' : 'queued' };
  await db.q('INSERT INTO outbox(id,data) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [rec.id, JSON.stringify(rec)]);
  res.json({ ok: 1, mail: { status: rec.status } });
  if (mailer.configured) deliver(rec.id).catch((e) => console.warn('[mail]', e.message));
}));
app.post('/api/outbox/:id/send', auth.requireStaff, wrap(async (req, res) => {
  if (!mailer.configured) return bad(res, 'SMTP is not configured on the server (see .env).', 400);
  const m = await deliver(req.params.id);
  if (!m) return bad(res, 'Not found.', 404);
  res.json({ ok: m.sent, mail: m });
}));
app.post('/api/outbox/:id/mark', auth.requireStaff, wrap(async (req, res) => {
  const r = await db.q("UPDATE outbox SET data = jsonb_set(jsonb_set(data,'{sent}','true'),'{status}','\"sent\"') WHERE id=$1", [req.params.id]);
  res.json({ ok: r.rowCount });
}));
app.delete('/api/outbox/:id', auth.requireStaff, wrap(async (req, res) => { await db.q('DELETE FROM outbox WHERE id=$1', [req.params.id]); res.json({ ok: 1 }); }));
app.post('/api/mail-test', auth.requireAdmin, wrap(async (req, res) => {
  const S = await getSettings();
  try { await mailer.send({ to: S.email, subject: S.short + ' test email', body: 'This is a test email from the journal server.', from: `"${S.short}" <${S.email}>` }); res.json({ ok: 1 }); }
  catch (e) { bad(res, e.message, 400); }
}));

/* ---- Crossref ---- */
async function doiArticles(req) {
  const S = await getSettings();
  let rows = (await db.q("SELECT data FROM articles WHERE status='published' ORDER BY pub")).rows.map((r) => r.data);
  rows = rows.filter((a) => seo.realDoi(a, S));
  if (req.query.year) rows = rows.filter((a) => String(a.year) === String(req.query.year));
  if (req.query.issue) rows = rows.filter((a) => String(a.issue) === String(req.query.issue));
  return { S, rows };
}
app.get('/api/crossref.xml', auth.requireStaff, wrap(async (req, res) => {
  const { S, rows } = await doiArticles(req);
  if (!rows.length) return bad(res, 'No published articles with a registered DOI prefix match. Set the DOI prefix in Settings and assign DOIs first.', 404);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="crossref-${S.short}-${req.query.year || 'all'}${req.query.issue ? '-' + req.query.issue : ''}.xml"`);
  res.send(seo.crossrefXml(rows, S, SITE, { name: S.publisher, email: S.email }));
}));
app.post('/api/crossref/deposit', auth.requireAdmin, wrap(async (req, res) => {
  if (!env.CROSSREF_USER || !env.CROSSREF_PASS) return bad(res, 'Set CROSSREF_USER and CROSSREF_PASS in .env first.');
  const { S, rows } = await doiArticles({ query: req.body || {} });
  if (!rows.length) return bad(res, 'No matching articles with DOIs.', 404);
  const xml = seo.crossrefXml(rows, S, SITE, { name: S.publisher, email: S.email });
  const fd = new FormData();
  fd.append('operation', 'doMDUpload'); fd.append('login_id', env.CROSSREF_USER); fd.append('login_passwd', env.CROSSREF_PASS);
  fd.append('fname', new Blob([xml], { type: 'application/xml' }), 'deposit.xml');
  const r = await fetch(env.CROSSREF_URL || 'https://doi.crossref.org/servlet/deposit', { method: 'POST', body: fd });
  const t = await r.text();
  res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, articles: rows.length, response: t.slice(0, 500) });
}));
app.post('/api/admin/clear-pdf-cache', auth.requireAdmin, wrap(async (req, res) => {
  fs.readdirSync(PDFS).forEach((n) => fs.rmSync(path.join(PDFS, n), { force: true })); res.json({ ok: 1 });
}));

/* ---- render pages used by headless Chrome (token protected) ---- */
const SHELL_FILE = () => path.join(PUBLIC, 'index.html');
app.get('/render/:kind/:id', wrap(async (req, res) => {
  const { kind, id } = req.params;
  if (!renderTokenOk(kind, id, req.query.t)) return res.status(403).send('Forbidden');
  const S = await getSettings(); const D = { kind, settings: publicSettings(S, true), users: [], site: SITE };
  if (kind === 'article') { const r = (await db.q('SELECT data FROM articles WHERE id=$1', [id])).rows[0]; if (!r) return res.status(404).send('Not found'); D.article = r.data; }
  else if (kind === 'cert') {
    const [aid, n] = String(id).split('~');
    const r = (await db.q('SELECT data FROM articles WHERE id=$1', [aid])).rows[0]; if (!r) return res.status(404).send('Not found');
    D.article = r.data; D.certN = n === 'all' ? null : Number(n) - 1;
  }
  else if (['ack', 'accept', 'cf'].includes(kind)) {
    const r = (await db.q('SELECT data FROM subs WHERE id=$1', [id])).rows[0]; if (!r) return res.status(404).send('Not found'); D.sub = r.data;
    const au = (await db.q('SELECT * FROM users WHERE id=$1', [D.sub.authorId])).rows[0]; if (au) D.users = [auth.publicUser(au)];
  } else if (['revack', 'revappoint'].includes(kind)) { const r = (await db.q('SELECT data FROM revapps WHERE id=$1', [id])).rows[0]; if (!r) return res.status(404).send('Not found'); D.revapp = r.data; }
  else return res.status(404).send('Unknown');
  let html = fs.readFileSync(SHELL_FILE(), 'utf8');
  html = html.replace(/<script src="js\/(app|server)\.js"><\/script>/g, '');
  html = html.replace('</body>', `<script>window.__RD=${JSON.stringify(D).replace(/</g, '\\u003c')};</script><script src="/js/render.js"></script></body>`);
  html = html.replace(/<script src="js\//g, '<script src="/js/').replace(/href="css\//g, 'href="/css/');
  res.setHeader('Cache-Control', 'no-store');
  res.send(html);
}));

/* ---- public article pages, PDFs, sitemap, OAI ---- */
app.get('/article/:id/pdf', wrap(async (req, res) => {
  const id = req.params.id; if (!ID_RE.test(id)) return res.status(404).send('Not found');
  const r = (await db.q('SELECT data,status FROM articles WHERE id=$1', [id])).rows[0];
  if (!r || (r.status !== 'published' && !auth.isStaff(req.user))) return res.status(404).send('Not found');
  const a = r.data;
  const nm = (a.doi ? a.doi.replace(/[\/\\]/g, '_') : id) + '.pdf';
  if (a.hasPdf) {
    const f = (await db.q('SELECT * FROM files WHERE key=$1', [id])).rows[0];
    if (f && fs.existsSync(f.path)) { res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `inline; filename="${nm}"`); return fs.createReadStream(f.path).pipe(res); }
  }
  let file;
  try { file = await articlePdfFile(id); } catch (e) { return res.status(503).send('PDF generation is unavailable: ' + e.message); }
  res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `inline; filename="${nm}"`);
  fs.createReadStream(file).pipe(res);
}));
app.get('/article/:id/certificate/:n', wrap(async (req, res) => {
  const id = req.params.id; if (!ID_RE.test(id)) return res.status(404).send('Not found');
  const r = (await db.q("SELECT data FROM articles WHERE id=$1 AND status='published'", [id])).rows[0];
  if (!r) return res.status(404).send('Not found');
  const a = r.data; const au = authorsOf(a);
  let ok = auth.isStaff(req.user);
  if (!ok && req.user && a.subId) { const s = (await db.q('SELECT data FROM subs WHERE id=$1', [a.subId])).rows[0]; ok = !!(s && s.data.authorId === req.user.id); }
  if (!ok) return res.status(403).send('Please log in as the submitting author or as editorial staff to download certificates.');
  const n = req.params.n === 'all' ? null : parseInt(req.params.n, 10) - 1;
  if (n != null && !(n >= 0 && n < au.length)) return res.status(404).send('Not found');
  let file;
  try { file = await certPdf(a, n); } catch (e) { return res.status(503).send('PDF generation is unavailable: ' + e.message); }
  res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
  res.send(file.content);
}));
app.get('/verify/:id/:n', wrap(async (req, res) => {
  const id = req.params.id; const n = parseInt(req.params.n, 10) - 1;
  const S = await getSettings();
  const r = ID_RE.test(id) ? (await db.q("SELECT data FROM articles WHERE id=$1 AND status='published'", [id])).rows[0] : null;
  const au = r ? authorsOf(r.data) : []; const x = au[n];
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const certNo = r && x ? `${S.short}/CERT/${r.data.year}/${String(r.data.artno || r.data.id).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12)}-${String(n + 1).padStart(2, '0')}` : '';
  const body = r && x
    ? `<h1 style="color:#0E7C7B">&#10004; Valid certificate</h1><p>Certificate No. <b>${e(certNo)}</b></p><table cellpadding="6"><tr><td>Author</td><td><b>${e(x.name)}</b>${x.aff ? '<br>' + e(x.aff) : ''}</td></tr><tr><td>Article</td><td>${e(r.data.title)}</td></tr><tr><td>Journal</td><td>${e(S.name)} (${e(S.short)}), Volume ${e(r.data.vol)}, Issue ${e(r.data.issue)}, ${e(r.data.year)}</td></tr><tr><td>Published</td><td>${e(r.data.published)}</td></tr><tr><td>DOI</td><td>${r.data.doi ? e(r.data.doi) : 'to be assigned'}</td></tr></table><p><a href="/article/${e(id)}">Read the article</a></p>`
    : '<h1 style="color:#9b1c1c">Certificate not found</h1><p>This certificate could not be verified. Please contact the editorial office.</p>';
  res.setHeader('Cache-Control', 'no-store');
  res.status(r && x ? 200 : 404).send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Certificate verification | ${e(S.short)}</title></head><body style="font-family:Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;color:#1c2530"><p style="color:#5f6b7a">${e(S.name)} &middot; ${e(S.publisher)}</p>${body}<p style="color:#5f6b7a;font-size:13px;margin-top:30px">Questions: ${e(S.email)}</p></body></html>`);
}));
app.get('/article/:id', wrap(async (req, res) => {
  const r = (await db.q("SELECT data FROM articles WHERE id=$1 AND status='published'", [req.params.id])).rows[0];
  if (!r) return res.status(404).sendFile(path.join(PUBLIC, '404.html'));
  const S = await getSettings(); const a = r.data;
  const html = fs.readFileSync(SHELL_FILE(), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(seo.injectShell(html, seo.articleHead(a, S, SITE), seo.articleFallback(a, S), `${a.title} | ${S.abbr}`));
}));
app.get('/sitemap.xml', wrap(async (req, res) => {
  const rows = (await db.q("SELECT data FROM articles WHERE status='published' ORDER BY pub DESC")).rows.map((r) => r.data);
  res.type('application/xml').send(seo.sitemap(rows, SITE));
}));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /render/\nSitemap: ${SITE}/sitemap.xml\n`));
app.get('/oai', wrap(async (req, res) => {
  const S = await getSettings();
  const rows = (await db.q("SELECT data FROM articles WHERE status='published' ORDER BY pub")).rows.map((r) => r.data);
  res.type('text/xml').send(seo.oai(req, rows, S, SITE));
}));
app.get('/healthz', wrap(async (req, res) => { await db.q('SELECT 1'); res.json({ ok: 1, journal: JOURNAL }); }));

/* ---- static front end ---- */
app.use(express.static(PUBLIC, { extensions: ['html'], maxAge: '1h' }));
app.use((req, res) => res.status(404).sendFile(path.join(PUBLIC, '404.html')));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[error]', req.method, req.url, err.message);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.status && err.status < 500 ? err.message : 'Server error: ' + err.message });
});

/* ---------------- start ---------------- */
async function ensureAdmin() {
  const r = await db.q("SELECT 1 FROM users WHERE id='admin'");
  if (r.rowCount) return;
  let pw = env.ADMIN_PASSWORD; let generated = false;
  if (!pw) { pw = auth.genPw(14); generated = true; }
  await db.q("INSERT INTO users(id,email,name,role,pw) VALUES ('admin','admin','Administrator','admin',$1)", [auth.hashPw(pw)]);
  if (generated) { fs.writeFileSync(path.join(DATA, 'admin-initial-password.txt'), `Login: admin\nPassword: ${pw}\nChange it in Admin > Settings, then delete this file.\n`, { mode: 0o600 }); console.log(`[setup] Admin account created. Initial password saved in ${path.join(DATA, 'admin-initial-password.txt')}`); }
  else console.log('[setup] Admin account created with the ADMIN_PASSWORD from .env');
}
async function start() {
  await db.init();
  await ensureAdmin();
  setInterval(() => db.q('DELETE FROM sessions WHERE exp<now()').catch(() => {}), 3600e3).unref();
  return new Promise((resolve) => {
    const server = app.listen(PORT, env.HOST || '0.0.0.0', () => {
      console.log(`[ok] ${JOURNAL === 'ls' ? 'IJMLS' : 'IJMMS'} server on :${PORT}  site=${SITE}  smtp=${mailer.configured}  pdf=${!!findChrome()}`);
      resolve(server);
    });
  });
}
if (require.main === module) start().catch((e) => { console.error('Fatal:', e); process.exit(1); });
module.exports = { start, app, db };
