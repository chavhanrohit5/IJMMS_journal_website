'use strict';
const nodemailer = require('nodemailer');

module.exports = function createMailer(env) {
  const host = env.SMTP_HOST;
  const configured = !!host;
  const transport = configured ? nodemailer.createTransport({
    host,
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: String(env.SMTP_SECURE || '').toLowerCase() === 'true' || env.SMTP_PORT === '465',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS || '' } : undefined,
  }) : null;
  const clean = (s) => String(s || '').replace(/[\r\n]+/g, ' ').trim();

  async function send({ to, toName, subject, body, html, from, replyTo, attachments }) {
    if (!configured) throw new Error('SMTP is not configured (set SMTP_HOST in .env).');
    const f = env.MAIL_FROM || from;
    await transport.sendMail({
      from: f,
      to: toName ? `"${clean(toName).replace(/"/g, '')}" <${clean(to)}>` : clean(to),
      replyTo: replyTo || undefined,
      subject: clean(subject),
      text: String(body || ''),
      ...(html ? { html } : {}),
      attachments: attachments || [],
    });
  }
  async function verify() { if (!configured) return false; try { await transport.verify(); return true; } catch (e) { return false; } }
  return { configured, send, verify };
};
