#!/usr/bin/env bash
# Updates the live journal to the latest code on GitHub, keeping settings and data.
#   bash /root/IJMMS_journal_website/deploy/update.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run as root"; exit 1; }
SRC=/root/IJMMS_journal_website
cd "$SRC"
echo "== Getting the latest code from GitHub"
git pull --ff-only || { echo "Could not download the latest code. Is the repository private, or is GitHub down?"; exit 1; }
git log --oneline -1
echo "== Saving a backup first"
/opt/journal/backup.sh || echo "WARNING: backup failed; continuing"
echo "== Installing"
cp -r "$SRC/server" "$SRC/public" "$SRC/package.json" /opt/journal/
[ -f "$SRC/package-lock.json" ] && cp "$SRC/package-lock.json" /opt/journal/
for f in backup.sh cloudflare-realip.sh firewall.sh enable-https.sh nginx-ijmms-https.conf health.sh; do cp "$SRC/deploy/$f" /opt/journal/$f; done
chmod +x /opt/journal/*.sh
cd /opt/journal && npm install --omit=dev --no-audit --no-fund --loglevel=error
chown -R journal:journal /opt/journal
fail=0
for j in ms ls; do
  [ -f /opt/journal/.env.$j ] || continue
  port=3001; [ $j = ls ] && port=3002
  systemctl restart journal@$j; sleep 4
  if curl -fsS -o /dev/null http://127.0.0.1:$port/; then echo "UPDATED: journal $j is running."; else echo "PROBLEM: journal $j did not start. Run: journalctl -u journal@$j -n 50 --no-pager"; fail=1; fi
done
exit $fail
