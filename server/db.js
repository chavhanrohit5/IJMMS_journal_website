'use strict';
const { Pool } = require('pg');

module.exports = function createDb(url) {
  const pool = new Pool({ connectionString: url, max: 10 });
  const q = (text, params) => pool.query(text, params);

  async function init() {
    await q(`
      CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL);
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY, email text NOT NULL, name text NOT NULL DEFAULT '', aff text NOT NULL DEFAULT '',
        role text NOT NULL DEFAULT 'author', pw text NOT NULL, extra jsonb NOT NULL DEFAULT '{}'::jsonb,
        created timestamptz NOT NULL DEFAULT now());
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower ON users (lower(email));
      CREATE TABLE IF NOT EXISTS sessions (sid text PRIMARY KEY, uid text NOT NULL, exp timestamptz NOT NULL);
      CREATE TABLE IF NOT EXISTS articles (
        id text PRIMARY KEY, status text NOT NULL, pub text NOT NULL DEFAULT '', data jsonb NOT NULL,
        updated timestamptz NOT NULL DEFAULT now());
      CREATE INDEX IF NOT EXISTS articles_status ON articles (status);
      CREATE TABLE IF NOT EXISTS subs (
        id text PRIMARY KEY, author_id text NOT NULL DEFAULT '', reviewer_id text NOT NULL DEFAULT '',
        ref text NOT NULL DEFAULT '', data jsonb NOT NULL, updated timestamptz NOT NULL DEFAULT now());
      CREATE INDEX IF NOT EXISTS subs_author ON subs (author_id);
      CREATE INDEX IF NOT EXISTS subs_reviewer ON subs (reviewer_id);
      CREATE TABLE IF NOT EXISTS files (
        key text PRIMARY KEY, name text NOT NULL DEFAULT '', mime text NOT NULL DEFAULT '', size integer NOT NULL DEFAULT 0,
        path text NOT NULL, owner text NOT NULL DEFAULT '', created timestamptz NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS outbox (
        id text PRIMARY KEY, data jsonb NOT NULL, created timestamptz NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS revapps (id text PRIMARY KEY, data jsonb NOT NULL, created timestamptz NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS counters (name text PRIMARY KEY, n bigint NOT NULL DEFAULT 0);
    `);
  }

  async function nextCounter(name) {
    const r = await q(`INSERT INTO counters(name,n) VALUES ($1,1)
      ON CONFLICT (name) DO UPDATE SET n = counters.n + 1 RETURNING n`, [name]);
    return Number(r.rows[0].n);
  }
  async function getCounter(name) {
    const r = await q('SELECT n FROM counters WHERE name=$1', [name]);
    return r.rows[0] ? Number(r.rows[0].n) : 0;
  }
  async function kvGet(key, dflt) {
    const r = await q('SELECT value FROM kv WHERE key=$1', [key]);
    return r.rows[0] ? r.rows[0].value : dflt;
  }
  async function kvSet(key, value) {
    await q(`INSERT INTO kv(key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`, [key, JSON.stringify(value)]);
  }
  return { pool, q, init, nextCounter, getCounter, kvGet, kvSet, close: () => pool.end() };
};
