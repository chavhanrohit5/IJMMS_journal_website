#!/usr/bin/env bash
# One-time setup on a fresh Ubuntu 24.04 (or 22.04) VPS, for one journal domain.
# Run as root from the cloned repository:
#     sudo DOMAIN=ijmms.in bash deploy/install.sh
# Then point the domain at this server through Cloudflare and run:
#     sudo DOMAIN=ijmms.in bash deploy/enable-https.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
DOMAIN="${DOMAIN:?Set the domain first, for example: sudo DOMAIN=ijmms.in bash deploy/install.sh}"
case "$DOMAIN" in *[!a-z0-9.-]*|"") echo "DOMAIN looks wrong: $DOMAIN"; exit 1;; esac
SRC="$(cd "$(dirname "$0")/.." && pwd)"
export DEBIAN_FRONTEND=noninteractive

echo "== System packages"
apt-get update
apt-get install -y curl ca-certificates gnupg git nginx postgresql certbot ufw unattended-upgrades fonts-liberation fonts-noto-core

echo "== Node.js 22 LTS"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "== Google Chrome (used to make article and letter PDFs)"
if ! command -v google-chrome >/dev/null; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor --yes -o /etc/apt/keyrings/google-chrome.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
  apt-get update
  apt-get install -y google-chrome-stable
fi

echo "== Application"
id journal >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin journal
mkdir -p /opt/journal /var/lib/journals /var/backups/journals /var/www/letsencrypt
cp -r "$SRC/server" "$SRC/public" "$SRC/package.json" /opt/journal/
[ -f "$SRC/package-lock.json" ] && cp "$SRC/package-lock.json" /opt/journal/
cd /opt/journal && npm install --omit=dev --no-audit --no-fund
for j in ms; do
  n=ijmms; port=3001; [ $j = ls ] && { n=ijmls; port=3002; }
  pw=$(openssl rand -hex 12); sec=$(openssl rand -hex 32)
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$n'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER $n WITH PASSWORD '$pw'"
    sudo -u postgres psql -c "CREATE DATABASE $n OWNER $n"
    sed -e "s/^JOURNAL=.*/JOURNAL=$j/" -e "s/^PORT=.*/PORT=$port/" -e "s#^DATABASE_URL=.*#DATABASE_URL=postgres://$n:$pw@127.0.0.1:5432/$n#" \
        -e "s#^DATA_DIR=.*#DATA_DIR=/var/lib/journals/$n#" -e "s/^SESSION_SECRET=.*/SESSION_SECRET=$sec/" \
        -e "s#^SITE_URL=.*#SITE_URL=https://$DOMAIN#" "$SRC/.env.example" > /opt/journal/.env.$j
    chmod 600 /opt/journal/.env.$j
  fi
  mkdir -p /var/lib/journals/$n
done
for f in backup.sh cloudflare-realip.sh firewall.sh enable-https.sh nginx-ijmms-https.conf; do cp "$SRC/deploy/$f" /opt/journal/$f; done
chmod +x /opt/journal/*.sh
cp "$SRC/deploy/journal@.service" /etc/systemd/system/journal@.service
chown -R journal:journal /opt/journal /var/lib/journals

echo "== Web server (HTTP for now; enable-https.sh adds HTTPS once the domain points here)"
sed "s/__DOMAIN__/$DOMAIN/g" "$SRC/deploy/nginx-ijmms.conf" > /etc/nginx/sites-available/ijmms
ln -sf /etc/nginx/sites-available/ijmms /etc/nginx/sites-enabled/ijmms
rm -f /etc/nginx/sites-enabled/default
/opt/journal/cloudflare-realip.sh || echo "Cloudflare address list not loaded yet; run /opt/journal/cloudflare-realip.sh later."
nginx -t && systemctl reload nginx

echo "== Start the journal"
systemctl daemon-reload
systemctl enable --now journal@ms

echo "== Scheduled jobs and firewall"
echo "0 2 * * * root /opt/journal/backup.sh >> /var/log/journal-backup.log 2>&1" > /etc/cron.d/journal-backup
echo "30 3 * * 1 root /opt/journal/cloudflare-realip.sh >> /var/log/journal-cloudflare.log 2>&1; /opt/journal/firewall.sh >> /var/log/journal-firewall.log 2>&1" > /etc/cron.d/journal-cloudflare
dpkg-reconfigure -f noninteractive unattended-upgrades || true
/opt/journal/firewall.sh

sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:3001/; then echo "Journal is running on port 3001."; else echo "WARNING: journal did not answer yet. Check: journalctl -u journal@ms -n 50"; fi
cat <<M

Installed for $DOMAIN.  NEXT:
 1. In Cloudflare DNS, point $DOMAIN and www.$DOMAIN to this server (proxied).
 2. sudo DOMAIN=$DOMAIN bash deploy/enable-https.sh
 3. In Cloudflare: SSL/TLS mode Full (strict).
 4. First admin password:  cat /var/lib/journals/ijmms/admin-initial-password.txt
 5. Email: put SMTP_* in /opt/journal/.env.ms, then: systemctl restart journal@ms
M
