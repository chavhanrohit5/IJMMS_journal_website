# IJMMS – International Journal of Modern Medicine & Surgery
Server edition (Node.js + PostgreSQL). Genosync Publications.

This repository is the IJMMS website. (The sister journal has its own repository; both can run on one VPS.)
Same design as before, now with a shared database, real logins, real e-mail, file uploads, one web address per article, server-made PDFs and Crossref export.

## What you get
| Feature | How it works |
|---|---|
| Shared database & logins | PostgreSQL; passwords hashed (scrypt); cookie sessions; login rate-limit; CSRF header; role checks on every API call (author sees only own submissions, reviewer only assigned ones, admin/editor everything) |
| Uploads | Manuscripts, reviewer résumés and article PDFs stored in `DATA_DIR/files`; type + content checked (PDF/DOC/DOCX); only the owner / assigned reviewer / editors can download |
| Real e-mail | SMTP via nodemailer. Acknowledgement, review request, decision, acceptance and reviewer-appointment e-mails are sent automatically **with the PDF letter attached** (made by headless Chrome). If SMTP is not set, they wait in Admin > Outbox |
| One address per article | `https://domain/article/<id>` – full HTML with Google Scholar (Highwire) tags, Dublin Core, JSON-LD, canonical link; PDF at `/article/<id>/pdf` |
| PDFs on the server | Journal-format PDF generated when an article is published, cached in `DATA_DIR/pdf`, regenerated when the article changes. An uploaded PDF (Admin > article) takes priority |
| Indexing helpers | `/sitemap.xml`, `/robots.txt`, `/oai` (OAI-PMH, oai_dc) |
| Crossref | Admin > **Indexing & DOI**: download deposit XML (schema 5.3.1, with reference lists) by year/issue, or deposit directly with your Crossref credentials |
| Visitor counter | Counted once per browser per day, stored in the database |

## Requirements
Ubuntu 22.04/24.04 VPS (1 GB RAM minimum, 2 GB comfortable for two journals), root access, two domains pointing (A record) to the server IP.

## Install (about 20 minutes)
1. Upload and unzip this folder on the VPS, then: `sudo bash deploy/install.sh`
2. Edit `/opt/journal/.env.ms` and `/opt/journal/.env.ls`: set `SITE_URL` (your https domain), `SMTP_*`. See `deploy/.env.example` for every option.
3. Edit `server_name` in `/etc/nginx/sites-available/ijmms` and `ijmls`, then `nginx -t && systemctl reload nginx`.
4. `systemctl daemon-reload && systemctl enable --now journal@ms`
5. HTTPS: `certbot --nginx -d your-domain -d www.your-domain` (once per domain).
6. First admin password: `cat /var/lib/journals/ijmms/admin-initial-password.txt` (and `.../ijmls/...`). Log in at `https://domain/#/login` with ID `admin`, change it in Admin > Settings, delete the file.

## First-day checklist
- Admin > Settings: ISSNs, publisher, address, DOI prefix (only your **registered** Crossref prefix), e-mail address.
- Admin > Outbox: **Send test e-mail** (confirms SMTP).
- Register a test author, submit, assign a reviewer, accept – check both PDFs arrive – then delete the test items.
- Submit `https://domain/sitemap.xml` in Google Search Console.
- APC rate card stays labelled *proposed* until you tick *formally approved* in Settings.

## Operations
- Logs: `journalctl -u journal@ms -f`
- Update: replace `/opt/journal/server` and `/opt/journal/public`, `chown -R journal:journal /opt/journal`, `systemctl restart journal@ms`
- Backups: nightly `/opt/journal/backup.sh` (database + files) into `/var/backups/journals`, 14 days kept. **Copy those files off the server** (rsync / object storage) – a backup on the same disk is not a backup.
- Restore: commands are at the bottom of `deploy/backup.sh`.
- Security: keep `.env.*` private (chmod 600 is set), use a firewall (`ufw allow 22,80,443/tcp`), keep the OS updated.

## Honest limits
- Tested here end to end against a real PostgreSQL and a local SMTP stub (registration, login, submission upload, review, decision, acceptance e-mail with PDF, reviewer applications, permissions, article page tags, PDF, sitemap, OAI, Crossref XML). **Not tested:** your real SMTP provider and the live Crossref deposit service – try both once with a test article.
- Crossref requires your own membership and prefix; articles with placeholder prefixes (`10.xxxxx`) are skipped.
- E-mail deliverability (spam folders) needs SPF/DKIM on your mail domain – set up through your mail provider.
- Indexing status (Scopus, PubMed, DOAJ etc.), impact factor and approvals remain admin-entered claims: enter only what is true.
- The site is a single-page app: the visible text of article pages is also in the HTML for crawlers, other pages load through JavaScript.

## Deploy from GitHub
On the VPS:
```
git clone https://github.com/chavhanrohit5/IJMMS_journal_website.git
cd IJMMS_journal_website
sudo bash deploy/install.sh
```
Keep this repository **private** once set up. Never commit `.env` files (already git-ignored).
