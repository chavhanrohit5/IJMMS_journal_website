#!/usr/bin/env bash
# Adds the second journal (IJMLS) to a server that already runs IJMMS (install.sh done).
# It gets its own database, settings file, data folder, port 3002 and nginx site.
#     sudo DOMAIN=ijmls.in bash /root/IJMMS_journal_website/deploy/add-journal.sh
# Then, once the domain points here through Cloudflare:
#     sudo JOURNAL=ls DOMAIN=ijmls.in bash /root/IJMMS_journal_website/deploy/enable-https.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run as root"; exit 1; }
DOMAIN="${DOMAIN:?Set the domain first, for example: sudo DOMAIN=ijmls.in bash deploy/add-journal.sh}"
case "$DOMAIN" in *[!a-z0-9.-]*|"") echo "DOMAIN looks wrong: $DOMAIN"; exit 1;; esac
J=ls; N=ijmls; PORT=3002
SRC="$(cd "$(dirname "$0")/.." && pwd)"
[ -d /opt/journal/server ] || { echo "IJMMS is not installed yet. Run install.sh first."; exit 1; }

echo "== Copying the latest code (IJMMS keeps running)"
/opt/journal/backup.sh || echo "WARNING: backup failed; continuing"
cp -r "$SRC/server" "$SRC/public" "$SRC/package.json" /opt/journal/
[ -f "$SRC/package-lock.json" ] && cp "$SRC/package-lock.json" /opt/journal/
for f in backup.sh cloudflare-realip.sh firewall.sh enable-https.sh nginx-ijmms-https.conf health.sh; do cp "$SRC/deploy/$f" /opt/journal/$f; done
chmod +x /opt/journal/*.sh
cd /opt/journal && npm install --omit=dev --no-audit --no-fund --loglevel=error

echo "== Database and settings for IJMLS"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$N'" | grep -q 1; then
  pw=$(openssl rand -hex 12); sec=$(openssl rand -hex 32)
  sudo -u postgres psql -c "CREATE USER $N WITH PASSWORD '$pw'"
  sudo -u postgres psql -c "CREATE DATABASE $N OWNER $N"
  sed -e "s/^JOURNAL=.*/JOURNAL=$J/" -e "s/^PORT=.*/PORT=$PORT/" -e "s#^DATABASE_URL=.*#DATABASE_URL=postgres://$N:$pw@127.0.0.1:5432/$N#" \
      -e "s#^DATA_DIR=.*#DATA_DIR=/var/lib/journals/$N#" -e "s/^SESSION_SECRET=.*/SESSION_SECRET=$sec/" \
      -e "s#^SITE_URL=.*#SITE_URL=https://$DOMAIN#" "$SRC/.env.example" > /opt/journal/.env.$J
  chmod 600 /opt/journal/.env.$J
else
  echo "IJMLS database already exists; keeping it."
fi
mkdir -p /var/lib/journals/$N
chown -R journal:journal /opt/journal /var/lib/journals

echo "== Web server site for $DOMAIN (HTTP for now)"
if [ ! -f /etc/nginx/sites-available/$N ]; then
  sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__PORT__/$PORT/g" "$SRC/deploy/nginx-ijmms.conf" > /etc/nginx/sites-available/$N
fi
ln -sf /etc/nginx/sites-available/$N /etc/nginx/sites-enabled/$N
nginx -t && systemctl reload nginx

echo "== Starting both journals"
systemctl daemon-reload
systemctl enable --now journal@ls
systemctl restart journal@ms journal@ls
sleep 5
ok=1
curl -fsS -o /dev/null http://127.0.0.1:3001/ && echo "IJMMS is running (port 3001)." || { echo "PROBLEM: IJMMS did not answer. Run: journalctl -u journal@ms -n 50 --no-pager"; ok=0; }
curl -fsS -o /dev/null http://127.0.0.1:3002/ && echo "IJMLS is running (port 3002)." || { echo "PROBLEM: IJMLS did not answer. Run: journalctl -u journal@ls -n 50 --no-pager"; ok=0; }
[ $ok = 1 ] && echo "ADDED: IJMLS is installed for $DOMAIN. Next: HTTPS (enable-https.sh with JOURNAL=ls)."
