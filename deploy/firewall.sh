#!/usr/bin/env bash
# Firewall: SSH open; web ports (80/443) only from Cloudflare, so nobody can bypass Cloudflare's
# protection by using the server's IP address directly. Safe to re-run; refreshed weekly by cron.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
command -v ufw >/dev/null || apt-get install -y ufw
tmp=$(mktemp); trap 'rm -f "$tmp"' EXIT
for v in v4 v6; do curl -fsS --max-time 20 "https://www.cloudflare.com/ips-$v" || true; echo; done \
  | tr -d '\r' | grep -E '^[0-9a-fA-F:.]+/[0-9]{1,3}$' > "$tmp" || true
n=$(wc -l < "$tmp")
[ "$n" -ge 10 ] || { echo "Cloudflare address list looks incomplete ($n ranges); firewall left unchanged."; exit 1; }
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
while read -r ip; do ufw allow proto tcp from "$ip" to any port 80,443 comment cloudflare >/dev/null; done < "$tmp"
ufw --force enable >/dev/null
echo "Firewall active: SSH open, web traffic only from Cloudflare ($n ranges)."
