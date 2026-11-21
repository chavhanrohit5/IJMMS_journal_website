'use strict';
/* ==========================================================================
   Branded HTML e-mail. Every message in the outbox is written as structured
   plain text (headings in CAPITALS, "Label : value" lines, "- " bullets,
   "1. " steps, "[done]/[current]/[next]" journey lines, "With regards,"
   sign-off). This turns it into a designed e-mail: journal logo, a banner
   with an icon for the event, headings, tables, a progress flowchart, boxes,
   bold text, an automated-response note and a footer. The plain text is
   still sent alongside as the text version.
   E-mail clients ignore <style> blocks and SVG, so everything is inline CSS
   and tables; icons are emoji.
   ========================================================================== */

const C = { navy: '#0D2B4E', teal: '#0E7C7B', gold: '#B8860B', ink: '#1c2733', mute: '#5b6b7c', line: '#d9e1ea', soft: '#f3f6f9', page: '#eef2f6' };
const FONT = "font-family:Arial,'Helvetica Neue',Helvetica,sans-serif";
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* banner for each kind of message, chosen from the subject */
const KINDS = [
  [/new manuscript submitted/i, '📥', 'New manuscript submitted', '#0D2B4E'],
  [/revised manuscript submitted/i, '🔄', 'Revised manuscript submitted', '#0E7C7B'],
  [/copyright form received/i, '✍️', 'Copyright form received', '#0E7C7B'],
  [/sign the copyright form/i, '✍️', 'Please sign the copyright form', '#B8860B'],
  [/payment received/i, '✅', 'Payment received – thank you', '#1e7d32'],
  [/payment reported/i, '💳', 'APC payment reported', '#0E7C7B'],
  [/apc payment (request|reminder)/i, '💳', 'APC payment', '#B8860B'],
  [/reset your password/i, '🔑', 'Reset your password', '#0D2B4E'],
  [/welcome|login details|account/i, '👋', 'Welcome! Your account is ready', C.teal],
  [/manuscript received/i, '📨', 'Manuscript received', C.teal],
  [/entered peer review/i, '🔍', 'Your manuscript is under peer review', C.navy],
  [/revised manuscript received/i, '🔄', 'Revised manuscript received', C.teal],
  [/letter of acceptance|accepted/i, '🎉', 'Accepted for publication', C.gold],
  [/revision requested/i, '✏️', 'Revision requested', C.gold],
  [/decision on your manuscript/i, '📋', 'Editorial decision', C.navy],
  [/in production/i, '🛠️', 'Your article is in production', C.navy],
  [/published|certificate of publication/i, '🏆', 'Your article is published', C.gold],
  [/review request/i, '🧑‍⚕️', 'Invitation to review', C.navy],
  [/appointed to the reviewer panel/i, '🎖️', 'Welcome to the reviewer panel', C.gold],
  [/reviewer application received/i, '📥', 'Reviewer application received', C.teal],
  [/new reviewer application/i, '🔔', 'New reviewer application', C.navy],
  [/reviewer application/i, '📋', 'Your reviewer application', C.navy],
  [/test email/i, '✅', 'Test e-mail', C.teal],
  [/reset your password/i, '🔑', 'Reset your password', C.navy],
];
const HEAD_ICON = [[/NEW MANUSCRIPT|REVISED MANUSCRIPT/, '📥'], [/COPYRIGHT|HOW TO SIGN/, '✍️'], [/APC|PAY|CHARGE/, '💳'], [/LOGIN/, '🔐'], [/JOURNEY|PROGRESS/, '🧭'], [/NEXT STEP/, '➡️'], [/EDITOR/, '📝'], [/REVIEWER COMMENT/, '💬'], [/RESUBMIT|HOW TO/, '🔁'], [/ACCEPT/, '🎉'], [/SUBMISSION|DETAILS/, '📄'], [/APC|CHARGE|PAYMENT/, '💳']];

function inline(t) { // escape, then bold / links / reference numbers / quoted titles
  let h = esc(t);
  h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/(https?:\/\/[^\s<]+[^\s<.,;)])/g, `<a href="$1" style="color:${C.teal};font-weight:bold;text-decoration:underline">$1</a>`);
  h = h.replace(/\b([A-Z]{3,6}\/\d{4}\/\d{3,5})\b/g, '<b>$1</b>');
  h = h.replace(/&quot;([^&]{4,300}?)&quot;/g, '<b>&ldquo;$1&rdquo;</b>');
  h = h.replace(/\b(ACCEPTED|PUBLISHED|CONGRATULATIONS)\b/g, '<b>$1</b>');
  return h;
}
const P = (h) => `<p style="margin:0 0 14px;${FONT};font-size:15px;line-height:1.6;color:${C.ink}">${h}</p>`;
function heading(t) {
  const ic = (HEAD_ICON.find(([re]) => re.test(t)) || [0, '📌'])[1];
  const label = (t.charAt(0) + t.slice(1).toLowerCase()).replace(/\bapc\b/gi, 'APC').replace(/\bdoi\b/gi, 'DOI');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 10px"><tr><td style="${FONT};font-size:16px;font-weight:bold;color:${C.navy};padding:0 0 6px;border-bottom:2px solid ${C.gold}">${ic}&nbsp; ${esc(label)}</td></tr></table>`;
}
function kvTable(rows, box) {
  const tr = rows.map(([k, v], i) => `<tr><td style="${FONT};font-size:13.5px;font-weight:bold;color:${C.navy};padding:9px 12px;width:34%;white-space:nowrap;vertical-align:top;background:${box ? '#e9f6f5' : (i % 2 ? '#ffffff' : C.soft)};border-bottom:1px solid ${C.line}">${esc(k)}</td><td style="${FONT};font-size:14px;color:${C.ink};padding:9px 12px;vertical-align:top;word-break:break-all;background:${box ? '#f4fbfa' : (i % 2 ? '#ffffff' : C.soft)};border-bottom:1px solid ${C.line}">${inline(v)}</td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:4px 0 16px;border:${box ? `2px dashed ${C.teal}` : `1px solid ${C.line}`};border-radius:6px">${tr}</table>`;
}
function journey(items) { // vertical flowchart
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 16px">${items.map((it, i) => {
    const done = it.s === 'done', cur = it.s === 'current';
    const bg = done ? C.teal : cur ? C.gold : '#ffffff', fg = done || cur ? '#ffffff' : '#8a97a6', bd = done ? C.teal : cur ? C.gold : '#c4cdd7';
    const mark = done ? '✓' : it.n;
    const conn = i < items.length - 1 ? `<div style="width:2px;height:16px;background:${done ? C.teal : '#d3dae2'};margin:0 auto"></div>` : '';
    return `<tr><td style="width:40px;vertical-align:top;text-align:center;padding:0"><div style="width:28px;height:28px;line-height:28px;border-radius:14px;background:${bg};border:2px solid ${bd};color:${fg};${FONT};font-size:13px;font-weight:bold;text-align:center;margin:0 auto">${mark}</div>${conn}</td>`
      + `<td style="vertical-align:top;padding:5px 0 0 8px;${FONT};font-size:14px;line-height:1.4;color:${done ? C.ink : cur ? C.navy : C.mute};${cur ? 'font-weight:bold' : ''}">${esc(it.t)}${cur ? `&nbsp; <span style="background:${C.gold};color:#fff;border-radius:10px;padding:2px 8px;font-size:11px;font-weight:bold">NOW</span>` : done ? `&nbsp; <span style="color:${C.teal};font-size:12px">completed</span>` : ''}</td></tr>`;
  }).join('')}</table>`;
}
const bullets = (l) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${l.map((t) => `<tr><td style="width:24px;vertical-align:top;${FONT};font-size:14px;color:${C.teal};padding:3px 0">▸</td><td style="${FONT};font-size:14.5px;line-height:1.55;color:${C.ink};padding:3px 0">${inline(t)}</td></tr>`).join('')}</table>`;
const steps = (l) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${l.map((t, i) => `<tr><td style="width:34px;vertical-align:top;padding:4px 0"><div style="width:24px;height:24px;line-height:24px;border-radius:12px;background:${C.navy};color:#fff;text-align:center;${FONT};font-size:12px;font-weight:bold">${i + 1}</div></td><td style="${FONT};font-size:14.5px;line-height:1.55;color:${C.ink};padding:6px 0 4px">${inline(t)}</td></tr>`).join('')}</table>`;
const quote = (paras) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr><td style="border-left:4px solid ${C.gold};background:#fffaf0;padding:12px 16px;${FONT};font-size:14.5px;line-height:1.6;color:${C.ink}">${paras.map(inline).join('<br>')}</td></tr></table>`;

function parse(body) {
  const lines = String(body || '').replace(/\r/g, '').split('\n');
  const out = []; let para = []; let i = 0; let section = '';
  const flush = () => { if (para.length) { out.push(/EDITOR|REVIEWER COMMENT/.test(section) ? quote(para) : P(para.map(inline).join('<br>'))); para = []; } };
  const isHead = (l) => /^[A-Z][A-Z0-9 '’&()\/-]{3,}$/.test(l) && !/[a-z]/.test(l);
  const kvRe = /^([A-Za-z][A-Za-z .()'’\/-]{0,30}?)\s*:\s+(\S.*)$/;
  const isKv = (l) => { const m = l.match(kvRe); return m && m[1].trim().split(/\s+/).length <= 4 && !/^(dear|note|please)$/i.test(m[1].trim()); };
  let sig = false;
  while (i < lines.length) {
    const raw = lines[i]; const l = raw.trim();
    if (/^(with (kind )?regards|best regards|sincerely|yours sincerely)[,.]?$/i.test(l) || /^-{2,}$/.test(l) || /^this is an automated (response|message)/i.test(l)) { flush(); sig = true; break; }
    if (!l) { flush(); i++; continue; }
    if (isHead(l)) { flush(); section = l; out.push(heading(l)); i++; continue; }
    if (/^\[(done|current|next)\]\s+\d+\.\s+/.test(l)) {
      flush(); const items = [];
      while (i < lines.length && /^\[(done|current|next)\]\s+(\d+)\.\s+(.*)$/.test(lines[i].trim())) { const m = lines[i].trim().match(/^\[(done|current|next)\]\s+(\d+)\.\s+(.*)$/); items.push({ s: m[1], n: m[2], t: m[3] }); i++; }
      out.push(journey(items)); continue;
    }
    if (isKv(l) && !para.length) {
      const rows = [];
      while (i < lines.length && lines[i].trim() && isKv(lines[i].trim())) { const m = lines[i].trim().match(kvRe); rows.push([m[1].trim(), m[2].trim()]); i++; }
      if (rows.length >= 2 || /LOGIN|DETAILS/.test(section)) { out.push(kvTable(rows, /LOGIN/.test(section))); continue; }
      para.push(`**${rows[0][0]}:** ${rows[0][1]}`); continue;
    }
    if (/^[-•]\s+/.test(l)) { flush(); const l2 = []; while (i < lines.length && /^[-•]\s+/.test(lines[i].trim())) { l2.push(lines[i].trim().replace(/^[-•]\s+/, '')); i++; } out.push(bullets(l2)); continue; }
    if (/^\d+[.)]\s+/.test(l)) { flush(); const l2 = []; while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) { l2.push(lines[i].trim().replace(/^\d+[.)]\s+/, '')); i++; } out.push(steps(l2)); continue; }
    para.push(l); i++;
  }
  flush();
  return { html: out.join(''), sig };
}

function firstUrl(body) {
  const login = String(body).match(/Login page\s*:\s*(https?:\/\/\S+)/i); if (login) return [login[1], 'Log in to your dashboard'];
  const adm = String(body).match(/Open in admin panel\s*:\s*(https?:\/\/\S+)/i); if (adm) return [adm[1], 'Open the submission'];
  const pay = String(body).match(/Pay online\s*:\s*(https?:\/\/\S+)/i); if (pay) return [pay[1], 'Pay APC online'];
  const rs = String(body).match(/Reset link\s*:\s*(https?:\/\/\S+)/i); if (rs) return [rs[1], 'Set a new password'];
  const link = String(body).match(/Link\s*:\s*(https?:\/\/\S+)/i); if (link) return [link[1], 'Read your article'];
  return null;
}

/* m = outbox record, S = settings, site = https://ijmms.in */
function emailHtml(m, S, site) {
  const kind = KINDS.find(([re]) => re.test(m.subject || '')) || [0, '✉️', String(m.subject || 'Message').replace(/^\[[^\]]+\]\s*/, ''), C.navy];
  const ref = (String(m.subject || '').match(/^\[([^\]]+)\]/) || [])[1] || '';
  const { html, sig } = parse(m.body);
  const cta = firstUrl(m.body);
  const logo = `${site}/assets/email-logo.png`;
  const sigBlock = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 8px"><tr><td style="background:${C.soft};border:1px solid ${C.line};border-radius:6px;padding:12px 16px;${FONT};font-size:13.5px;line-height:1.55;color:${C.mute}">🤖&nbsp; <b style="color:${C.navy}">This is an automated response.</b> Please do not reply to this message. For any query, please write to <a href="mailto:${esc(S.email)}" style="color:${C.teal};font-weight:bold">${esc(S.email)}</a>${ref ? ' and quote your reference number <b>' + esc(ref) + '</b>' : ''}.</td></tr></table>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(m.subject)}</title></head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden">${esc(kind[2])}${ref ? ' – ' + esc(ref) : ''} · ${esc(S.short)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid ${C.line}">
<tr><td align="center" style="padding:22px 24px 16px"><a href="${site}" style="text-decoration:none"><img src="${logo}" width="330" alt="${esc(S.name)}" style="display:block;width:330px;max-width:90%;height:auto;border:0"></a></td></tr>
<tr><td style="padding:0;line-height:0;font-size:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:5px;background:${C.navy};width:70%"></td><td style="height:5px;background:${C.teal};width:18%"></td><td style="height:5px;background:${C.gold}"></td></tr></table></td></tr>
<tr><td style="background:${kind[3]};padding:22px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:56px;vertical-align:middle"><div style="width:48px;height:48px;line-height:48px;border-radius:24px;background:rgba(255,255,255,.18);text-align:center;font-size:24px">${kind[1]}</div></td>
<td style="vertical-align:middle;padding-left:12px"><div style="${FONT};font-size:21px;font-weight:bold;color:#ffffff;line-height:1.25">${esc(kind[2])}</div>${ref ? `<div style="${FONT};font-size:13px;color:#e6eef6;margin-top:4px;letter-spacing:.5px">Reference: <b>${esc(ref)}</b></div>` : ''}</td></tr></table></td></tr>
<tr><td style="padding:26px 30px 8px">${html}
${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td style="background:${C.teal};border-radius:6px"><a href="${esc(cta[0])}" style="display:inline-block;padding:12px 24px;${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">${esc(cta[1])} &rarr;</a></td></tr></table>` : ''}
${sigBlock}</td></tr>
<tr><td style="padding:18px 30px 22px;background:${C.navy}"><div style="${FONT};font-size:13px;font-weight:bold;color:#f1d58a">${esc(S.name)} (${esc(S.short)})</div>
<div style="${FONT};font-size:12px;line-height:1.6;color:#d7e2ee;margin-top:4px">Published by ${esc(S.publisher)}${S.address ? ' · ' + esc(S.address) : ''}<br>Peer-reviewed · Open access · ${esc(S.freq || '')}${S.issnO ? ' · eISSN ' + esc(S.issnO) : ''}${S.issnP ? ' · pISSN ' + esc(S.issnP) : ''}<br><a href="${site}" style="color:#ffffff">${esc(site.replace(/^https?:\/\//, ''))}</a> · <a href="mailto:${esc(S.email)}" style="color:#ffffff">${esc(S.email)}</a></div></td></tr>
</table>
<div style="${FONT};font-size:11px;color:#8a97a6;margin-top:12px;max-width:600px;line-height:1.5">Automated message from the ${esc(S.short)} editorial system.</div>
</td></tr></table></body></html>`;
}

module.exports = { emailHtml };
