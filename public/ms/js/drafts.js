/* ---------- Submission drafts: "Save progress" + autosave (per journal, per author) ----------
   A draft is a normal submission record with status 'Draft' kept on the server under the author's account,
   so it can be continued on any device. Drafts get no reference number, are hidden from the editorial office
   and the office is notified only when the draft is finally submitted. */
if (typeof DEFAULTS !== 'undefined') { if (!('autosaveOn' in DEFAULTS)) DEFAULTS.autosaveOn = true; if (!('autosaveSec' in DEFAULTS)) DEFAULTS.autosaveSec = '20'; }
var DR = { timer: null, busy: false, dirty: false, last: 0 };
function dJournalOn() { return S.autosaveOn !== false && S.autosaveOn !== 'false' && S.autosaveOn !== '0'; }
function dSec() { var n = parseInt(S.autosaveSec, 10); return n >= 5 && n <= 300 ? n : 20; }
function dPrefKey() { var u = curUser(); return 'ijx-autosave:' + (typeof JID !== 'undefined' ? JID : 'j') + ':' + (u ? u.id : ''); }
function dAutoOn() { if (!dJournalOn()) return false; try { var v = localStorage.getItem(dPrefKey()); return v === null ? true : v === '1'; } catch (e) { return true; } }
function dSetAuto(on) { try { localStorage.setItem(dPrefKey(), on ? '1' : '0'); } catch (e) {} }
function dMine() { var u = curUser(); return u ? SUBS.filter(function (s) { return s.status === 'Draft' && s.authorId === u.id; }).sort(function (a, b) { return (b.draft && b.draft.savedAt || '').localeCompare(a.draft && a.draft.savedAt || ''); }) : []; }
function dWhen(iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return ''; var t = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); return (d.toDateString() === new Date().toDateString() ? 'today, ' : fmtDate(iso.slice(0, 10)) + ', ') + t; }
function dStat(msg, kind) { var e = $('sf-dstat'); if (!e) return; e.textContent = msg; e.className = 'dstat' + (kind ? ' ' + kind : ''); }

/* anything worth saving? */
function dHasContent() {
  var f = document.querySelector('.fmtform'); if (!f) return false;
  if (($('sf-title') && $('sf-title').value.trim()) || ($('sf-kw') && $('sf-kw').value.trim()) || ($('sf-note') && $('sf-note').value.trim())) return true;
  if (Array.prototype.some.call(f.querySelectorAll('.fmtbox textarea, .fmtbox input:not([type=file]):not([type=checkbox])'), function (e) { return e.value.trim(); })) return true;
  if (Array.prototype.some.call(f.querySelectorAll('.fmtbox .fu'), function (e) { return e.files.length; })) return true;
  var cards = f.querySelectorAll('#au-list .aucard'); return Array.prototype.some.call(cards, function (c, i) { return i > 0 && Array.prototype.some.call(c.querySelectorAll('input[data-f]'), function (e) { return e.value.trim(); }); });
}

/* build the draft record from the form */
function dCollect(id, prev) {
  var g = function (i) { return $(i) ? $(i).value.trim() : ''; }, u = curUser(), type = g('sf-type'), T = fmtType(type), d = fmtRead(type), au = authRead();
  var pf = (prev && prev.fmt) || {};
  return { id: id, authorId: u.id, authorName: u.name, authorEmail: u.email, status: 'Draft', title: g('sf-title'), type: type, branch: g('sf-branch'),
    authorsRaw: au.raw, corr: au.corr, keywords: g('sf-kw').split(/[,;]/).map(function (x) { return x.trim(); }).filter(Boolean),
    abstract: fmtComposeAbs(T, d.abs) || '', note: g('sf-note'), date: today(), created: (prev && prev.created) || Date.now(),
    hasFile: !!pf.mainName, fileName: pf.mainName || '',
    fmt: { v: 1, type: type, authors: au.list, abs: d.abs, secs: d.secs, decl: d.decl, x: d.x, conf: d.conf, pres: d.pres, refs: d.refs, files: pf.files || [], mainName: pf.mainName || '' },
    draft: { savedAt: new Date().toISOString(), ok: !!($('sf-ok') && $('sf-ok').checked) },
    history: (prev && prev.history && prev.history.length) ? prev.history : [{ d: today(), t: 'Draft started' }] };
}

/* save (manual or automatic). Files chosen in the form are uploaded and kept with the draft. */
async function draftSave(auto) {
  if (DR.busy || !$('sf-type') || !curUser()) return;
  if ($('sf-prog') && $('sf-prog').textContent) return; /* final submission in progress */
  if (auto && !dHasContent()) return;
  DR.busy = true; DR.dirty = false; clearTimeout(DR.timer);
  var prev = window.__draftId ? findSub(window.__draftId) : null, id = prev ? prev.id : uid(), type = $('sf-type').value;
  dStat(auto ? 'Autosaving…' : 'Saving…', 'ing');
  try {
    var s = dCollect(id, prev), chosen = Array.prototype.some.call(document.querySelectorAll('.fmtbox .fu'), function (f) { return f.files.length; });
    if (chosen) {
      dStat('Uploading files…', 'ing');
      var up = await fmtUpload(id, type, s.fmt.files);
      s.fmt.files = up.files; if (up.main) { s.fmt.mainName = up.main; s.fileName = up.main; s.hasFile = true; }
    }
    if (!prev) s.history = [{ d: today(), t: 'Draft started' }];
    await saveSub(s);
    window.__draftId = id;
    try { localStorage.removeItem('ijx-draftbak:' + dPrefKey()); } catch (e) {}
    if (!/^#\/submit\/draft\//.test(location.hash)) history.replaceState(null, '', '#/submit/draft/' + id);
    if (chosen) { /* show the uploaded files as already uploaded, keep everything typed */
      var keep = fmtRead(type); keep.files = s.fmt.files; keep.mainName = s.fmt.mainName;
      $('fmt-area').innerHTML = fmtForm(type, keep, 'edit'); fmtCounters();
    }
    DR.last = Date.now();
    dStat((auto ? 'Autosaved ' : 'Progress saved ') + dWhen(s.draft.savedAt) + ' · continue any time from My dashboard', 'ok');
    if (!auto) toast('Progress saved. You can continue this submission later from My dashboard.');
  } catch (e) {
    try { localStorage.setItem('ijx-draftbak:' + dPrefKey(), JSON.stringify(dCollect(id, prev))); } catch (x) {}
    dStat('Could not save to the server (' + e.message + '). A copy is kept in this browser.', 'err');
    if (!auto) toast('Could not save: ' + e.message);
    DR.dirty = true;
  }
  DR.busy = false;
  if (DR.dirty && dAutoOn()) dSchedule();
}
function dSchedule() { clearTimeout(DR.timer); if (!dAutoOn() || !$('sf-type')) return; DR.timer = setTimeout(function () { draftSave(true); }, dSec() * 1000); }
function draftStop() { clearTimeout(DR.timer); DR.dirty = false; }
function draftDone(id) { draftStop(); window.__draftId = ''; try { localStorage.removeItem('ijx-draftbak:' + dPrefKey()); } catch (e) {} }

/* edits -> mark dirty and schedule an autosave */
['input', 'change'].forEach(function (ev) {
  document.addEventListener(ev, function (e) {
    var t = e.target; if (!t.closest || !t.closest('.fmtform') || !$('sf-type')) return;
    if (t.id === 'sf-autosave') { dSetAuto(t.checked); if (t.checked) { dStat('Autosave on · every ' + dSec() + ' seconds while you work', 'ok'); if (DR.dirty) dSchedule(); } else { draftStop(); dStat('Autosave off · use Save progress', ''); } return; }
    DR.dirty = true;
    if (!dAutoOn()) { dStat('Unsaved changes · click Save progress', 'warn'); return; }
    if (t.classList && t.classList.contains('fu') && t.files.length) { clearTimeout(DR.timer); DR.timer = setTimeout(function () { draftSave(true); }, 1200); return; }
    dSchedule();
  });
});
window.addEventListener('beforeunload', function (e) { if (DR.dirty && $('sf-type') && dHasContent()) { e.preventDefault(); e.returnValue = ''; } });

/* form: save bar + drafts banner */
var _drVSub = vSubmit;
vSubmit = function () {
  var h = _drVSub(); var u = curUser(); if (!u || !/data-act="subsubmit"/.test(h)) return h;
  var m = location.hash.match(/^#\/submit\/draft\/([^\/?]+)/), dr = m ? findSub(m[1]) : null;
  if (m && (!dr || dr.status !== 'Draft')) { window.__draftId = ''; return hd('Submit manuscript') + pg('<div class="card">This draft was not found' + (dr ? ' or has already been submitted' : '') + '. <a href="#/dash">Open My dashboard</a> or <a href="#/submit">start a new submission</a>.</div>'); }
  window.__draftId = dr ? dr.id : '';
  var auto = dJournalOn(), on = dAutoOn();
  var bar = '<div class="dbar"><button class="btn ghost" type="button" data-act="draftsave">&#128190; Save progress</button>'
    + (auto ? '<label class="ck dauto"><input type="checkbox" id="sf-autosave"' + (on ? ' checked' : '') + '> Autosave</label>' : '')
    + '<span id="sf-dstat" class="dstat">' + (dr ? 'Draft last saved ' + dWhen(dr.draft && dr.draft.savedAt) : (auto && on ? 'Autosave on · your work is saved every ' + dSec() + ' seconds while you type' : 'Use Save progress to finish later')) + '</span></div>';
  h = h.replace('<button class="btn" data-act="subsubmit">', bar + '<button class="btn" data-act="subsubmit">');
  var others = dMine().filter(function (s) { return !dr || s.id !== dr.id; });
  var banner = dr ? '<div class="card dbanner"><b>Continuing your saved draft</b> – last saved ' + esc(dWhen(dr.draft && dr.draft.savedAt)) + '. Uploaded files are kept; choose a new file only to replace one. <button class="btn sm ghost" type="button" data-act="draftdel" data-id="' + dr.id + '">Delete this draft</button></div>'
    : (others.length ? '<div class="card dbanner"><b>You have ' + others.length + ' saved draft' + (others.length > 1 ? 's' : '') + '.</b> ' + others.slice(0, 3).map(function (s) { return '<a class="btn sm teal" href="#/submit/draft/' + s.id + '">Continue: ' + esc((s.title || 'Untitled draft').slice(0, 50)) + '</a>'; }).join(' ') + '</div>' : '');
  var bak = null; try { bak = JSON.parse(localStorage.getItem('ijx-draftbak:' + dPrefKey()) || 'null'); } catch (e) {}
  if (!dr && bak && bak.fmt) banner += '<div class="card dbanner warn"><b>Unsaved work found in this browser</b> (' + esc(bak.title || 'untitled') + '). <button class="btn sm teal" type="button" data-act="draftbak">Restore it</button> <button class="btn sm ghost" type="button" data-act="draftbakx">Discard</button></div>';
  return h.replace('<div class="card fmtform">', banner + '<div class="card fmtform">');
};

/* fill the form from a draft after it is rendered */
function dFill(s) {
  if (!s || !$('sf-type')) return; var f = s.fmt || {}, type = s.type || f.type || $('sf-type').value;
  if (Array.prototype.some.call($('sf-type').options, function (o) { return o.value === type; })) { $('sf-type').value = type; $('sf-type').dataset.prev = type; }
  type = $('sf-type').value;
  $('fmt-area').innerHTML = fmtForm(type, f, 'edit');
  [['sf-title', s.title], ['sf-branch', s.branch], ['sf-kw', (s.keywords || []).join(', ')], ['sf-note', s.note]].forEach(function (x) { if ($(x[0]) && x[1] != null) $(x[0]).value = x[1]; });
  if (f.authors && f.authors.length && $('au-list')) { var list = f.authors.slice(); $('au-list').innerHTML = list.map(authCard).join(''); if (typeof authRenum === 'function') authRenum(); }
  if ($('sf-ok') && s.draft) $('sf-ok').checked = !!s.draft.ok;
  if ($('sf-apc') && typeof apcSubNote === 'function') $('sf-apc').innerHTML = apcSubNote(type);
  fmtCounters(); DR.dirty = false;
}
var _drRoute = route; route = function () {
  var r = _drRoute.apply(this, arguments);
  draftStop();
  var m = location.hash.match(/^#\/submit\/draft\/([^\/?]+)/);
  if (m && $('sf-type')) dFill(findSub(m[1]));
  else if (/^#\/submit\/?$/.test(location.hash)) window.__draftId = '';
  return r;
};

/* dashboard: drafts card */
var _drVDash = vDash;
vDash = function () {
  var h = _drVDash(), l = dMine(); if (!l.length) return h;
  var card = '<div class="card dcard"><h3>Saved drafts <small>(not submitted yet)</small></h3><table class="t"><tr><th>Title</th><th>Type</th><th>Last saved</th><th></th></tr>'
    + l.map(function (s) { return '<tr><td>' + esc(s.title || 'Untitled draft') + '</td><td>' + esc(s.type || '') + '</td><td>' + esc(dWhen(s.draft && s.draft.savedAt)) + '</td><td style="white-space:nowrap"><a class="btn sm teal" href="#/submit/draft/' + s.id + '">Continue</a> <button class="btn sm ghost" data-act="draftdel" data-id="' + s.id + '">Delete</button></td></tr>'; }).join('') + '</table></div>';
  var i = h.indexOf('<table class="t bd">'); return i > -1 ? h.slice(0, i) + card + h.slice(i) : h + card;
};
/* a draft opened from the submissions table goes to the form */
if (typeof vSub === 'function') { var _drVSub2 = vSub; vSub = function (id) { var s = findSub(id); if (s && s.status === 'Draft') { var u = curUser(); if (u && s.authorId === u.id) { setTimeout(function () { location.hash = '#/submit/draft/' + id; }, 0); return hd('Opening draft…'); } } return _drVSub2(id); }; }

Object.assign(ACT, {
  draftsave: function () { draftSave(false); },
  draftdel: async function (t) {
    var id = t.dataset.id, s = findSub(id); if (!confirm('Delete this draft' + (s && s.title ? ' (' + s.title + ')' : '') + ' and its uploaded files? This cannot be undone.')) return;
    try { await api('DELETE', '/api/drafts/' + encodeURIComponent(id)); } catch (e) { toast(e.message); return; }
    var i = SUBS.indexOf(s); if (i > -1) SUBS.splice(i, 1); if (window.__draftId === id) window.__draftId = '';
    toast('Draft deleted.'); if (/^#\/submit\/draft\//.test(location.hash)) location.hash = '#/dash'; else route();
  },
  draftbak: function () { var b = null; try { b = JSON.parse(localStorage.getItem('ijx-draftbak:' + dPrefKey()) || 'null'); } catch (e) {} if (b) { var pv = window.__draftId; dFill(b); window.__draftId = pv; DR.dirty = true; $$('.dbanner.warn').forEach(function (x) { x.remove(); }); toast('Restored. Files must be chosen again.'); if (dAutoOn()) dSchedule(); } },
  draftbakx: function () { try { localStorage.removeItem('ijx-draftbak:' + dPrefKey()); } catch (e) {} $$('.dbanner.warn').forEach(function (x) { x.remove(); }); }
});

/* admin > settings: per-journal autosave switch */
if (typeof vSettings === 'function') {
  var _drVS = vSettings; vSettings = function () { var h = _drVS(); return h.replace('<button class="btn teal" data-act="savesettings">', '<h4>Submission drafts</h4><div class="row2"><div class="fg"><label class="ck"><input type="checkbox" id="s-autosaveOn"' + (dJournalOn() ? ' checked' : '') + '> Autosave authors\' submission drafts</label><div class="hint">Authors can always use “Save progress”. With autosave on, the form also saves itself while they type (each author can switch it off).</div></div><div class="fg"><label>Autosave interval (seconds)</label><input id="s-autosaveSec" type="number" min="5" max="300" value="' + dSec() + '"></div></div><button class="btn teal" data-act="savesettings">'); };
  var _drSave = ACT.savesettings; ACT.savesettings = function (t) { var e = $('s-autosaveOn'); if (e) { S.autosaveOn = e.checked; var n = parseInt($('s-autosaveSec').value, 10); S.autosaveSec = String(n >= 5 && n <= 300 ? n : 20); } return _drSave(t); };
}
if (typeof $$ === 'undefined') { var $$ = function (q) { return Array.prototype.slice.call(document.querySelectorAll(q)); }; }
