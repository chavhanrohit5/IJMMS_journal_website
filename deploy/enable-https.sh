#!/usr/bin/env bash
# Gets a free Let's Encrypt certificate for the domain and switches nginx to HTTPS.
# Run after the domain points at this server (through Cloudflare is fine):
#     sudo DOMAIN=ijmms.in bash deploy/enable-https.sh
# Renewal is automatic (certbot timer); the challenge is served on both port 80 and 443,
# so it works whatever Cloudflare's SSL mode or "Always Use HTTPS" setting is.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
DOMAIN="${DOMAIN:?Set the domain first, for example: sudo DOMAIN=ijmms.in bash deploy/enable-https.sh}"
case "$DOMAIN" in *[!a-z0-9.-]*|"") echo "DOMAIN looks wrong: $DOMAIN"; exit 1;; esac
HERE="$(cd "$(dirname "$0")" && pwd)"
TPL="$HERE/nginx-ijmms-https.conf"; [ -f "$TPL" ] || TPL=/opt/journal/nginx-ijmms-https.conf
mkdir -p /var/www/letsencrypt
certbot certonly --webroot -w /var/www/letsencrypt -d "$DOMAIN" -d "www.$DOMAIN" \
  --agree-tos --register-unsafely-without-email --non-interactive --keep-until-expiring \
  --deploy-hook "systemctl reload nginx"
cp /etc/nginx/sites-available/ijmms /etc/nginx/sites-available/ijmms.http-backup
sed "s/__DOMAIN__/$DOMAIN/g" "$TPL" > /etc/nginx/sites-available/ijmms
if nginx -t; then
  systemctl reload nginx
  echo "HTTPS enabled for $DOMAIN. Now set Cloudflare SSL/TLS mode to Full (strict)."
else
  cp /etc/nginx/sites-available/ijmms.http-backup /etc/nginx/sites-available/ijmms
  nginx -t && systemctl reload nginx
  echo "nginx rejected the HTTPS settings; the HTTP settings were restored."; exit 1
fi
