'use strict';
/* Razorpay Payment Links. Keys come only from the journal's .env file:
   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (and optionally RAZORPAY_WEBHOOK_SECRET). */
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const keyId = () => process.env.RAZORPAY_KEY_ID || '';
const keySecret = () => process.env.RAZORPAY_KEY_SECRET || '';
const configured = () => !!(keyId() && keySecret());
function call(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const base = new URL(process.env.RAZORPAY_API_URL || 'https://api.razorpay.com'); // override only for local testing
    const req = (base.protocol === 'http:' ? http : https).request({ host: base.hostname, port: base.port || undefined, path: '/v1' + path, method, auth: keyId() + ':' + keySecret(), timeout: 20000,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let b = ''; res.on('data', (c) => { b += c; });
      res.on('end', () => { let j = {}; try { j = JSON.parse(b || '{}'); } catch (e) { j = {}; }
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(j);
        else reject(new Error((j.error && (j.error.description || j.error.reason)) || ('Razorpay error ' + res.statusCode))); });
    });
    req.on('timeout', () => req.destroy(new Error('Razorpay did not answer in time.')));
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}
const createLink = (o) => call('POST', '/payment_links', o);
const fetchLink = (id) => call('GET', '/payment_links/' + encodeURIComponent(id));
const cancelLink = (id) => call('POST', '/payment_links/' + encodeURIComponent(id) + '/cancel');
function verifyWebhook(raw, sig) {
  const sec = process.env.RAZORPAY_WEBHOOK_SECRET || ''; if (!sec || !raw || !sig) return false;
  const exp = crypto.createHmac('sha256', sec).update(raw).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(exp), Buffer.from(String(sig))); } catch (e) { return false; }
}
module.exports = { configured, createLink, fetchLink, cancelLink, verifyWebhook, webhookOn: () => !!process.env.RAZORPAY_WEBHOOK_SECRET };
