#!/usr/bin/env bash
# One-time setup on a fresh Ubuntu 22.04/24.04 VPS.  Run as root from the unzipped folder:  sudo bash deploy/install.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
SRC="$(cd "$(dirname "$0")/.." && pwd)"
apt-get update
apt-get install -y curl ca-certificates gnupg nginx postgresql certbot python3-certbot-nginx chromium-browser fonts-liberation fonts-noto-core || apt-get install -y chromium fonts-liberation fonts-noto-core
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ] || { curl -fsSL https://deb.nodesource.com/setup_20.x | bash -; apt-get install -y nodejs; }
id journal >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin journal
mkdir -p /opt/journal /var/lib/journals /var/backups/journals
cp -r "$SRC/server" "$SRC/public" "$SRC/package.json" /opt/journal/
[ -f "$SRC/package-lock.json" ] && cp "$SRC/package-lock.json" /opt/journal/
cd /opt/journal && npm install --omit=dev
for j in ms; do
  n=ijmms; port=3001; [ $j = ls ] && { n=ijmls; port=3002; }
  pw=$(openssl rand -hex 12); sec=$(openssl rand -hex 32)
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$n'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER $n WITH PASSWORD '$pw'"
    sudo -u postgres psql -c "CREATE DATABASE $n OWNER $n"
    sed -e "s/^JOURNAL=.*/JOURNAL=$j/" -e "s/^PORT=.*/PORT=$port/" -e "s#^DATABASE_URL=.*#DATABASE_URL=postgres://$n:$pw@127.0.0.1:5432/$n#" \
        -e "s#^DATA_DIR=.*#DATA_DIR=/var/lib/journals/$n#" -e "s/^SESSION_SECRET=.*/SESSION_SECRET=$sec/" "$SRC/.env.example" > /opt/journal/.env.$j
    chmod 600 /opt/journal/.env.$j
  fi
  mkdir -p /var/lib/journals/$n
done
cp "$SRC/deploy/backup.sh" /opt/journal/backup.sh; chmod +x /opt/journal/backup.sh
cp "$SRC/deploy/cloudflare-realip.sh" /opt/journal/cloudflare-realip.sh; chmod +x /opt/journal/cloudflare-realip.sh
cp "$SRC/deploy/journal@.service" /etc/systemd/system/journal@.service
cp "$SRC/deploy/nginx-ijmms.conf" /etc/nginx/sites-available/ijmms
ln -sf /etc/nginx/sites-available/ijmms /etc/nginx/sites-enabled/ijmms
chown -R journal:journal /opt/journal /var/lib/journals
echo "0 2 * * * root /opt/journal/backup.sh >> /var/log/journal-backup.log 2>&1" > /etc/cron.d/journal-backup
echo "30 3 * * 1 root /opt/journal/cloudflare-realip.sh >> /var/log/journal-cloudflare.log 2>&1" > /etc/cron.d/journal-cloudflare
/opt/journal/cloudflare-realip.sh || echo "Cloudflare address list not installed yet; run /opt/journal/cloudflare-realip.sh later."
cat <<M

Installed. NEXT (see README.md):
 1. Edit /opt/journal/.env.ms  -> SITE_URL (your domain), SMTP_*, Crossref (optional)
 2. Edit the server_name in /etc/nginx/sites-available/ijmms, then: nginx -t && systemctl reload nginx
 3. systemctl daemon-reload && systemctl enable --now journal@ms
 4. certbot --nginx -d <domain>   (once per domain)
 5. Read the first admin password:  cat /var/lib/journals/ijmms/admin-initial-password.txt
M
