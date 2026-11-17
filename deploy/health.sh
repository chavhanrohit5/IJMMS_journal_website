#!/usr/bin/env bash
# One-screen health check of the journal server. Changes nothing.
#   bash /root/IJMMS_journal_website/deploy/health.sh
ok(){ printf '  [ OK ]  %s\n' "$1"; }
bad(){ printf '  [FAIL]  %s\n' "$1"; }
warn(){ printf '  [WARN]  %s\n' "$1"; }
echo "IJMMS server health  $(date '+%d %b %Y %H:%M %Z')"
echo
echo "Services"
for s in journal@ms nginx postgresql; do systemctl is-active --quiet "$s" && ok "$s running" || bad "$s NOT running  ->  systemctl restart $s"; done
curl -fsS -o /dev/null http://127.0.0.1:3001/ && ok "journal answers on the server" || bad "journal does not answer  ->  journalctl -u journal@ms -n 50 --no-pager"
echo
echo "Space and memory"
use=$(df -P / | awk 'NR==2{gsub("%","",$5);print $5}')
[ "$use" -lt 80 ] && ok "disk ${use}% used" || { [ "$use" -lt 90 ] && warn "disk ${use}% used (clean up soon)" || bad "disk ${use}% used (nearly full)"; }
mem=$(free -m | awk '/Mem:/{printf "%d", ($2-$7)*100/$2}')
[ "$mem" -lt 85 ] && ok "memory ${mem}% used" || warn "memory ${mem}% used"
echo
echo "Backups"
last=$(ls -1t /var/backups/journals/ijmms-db-*.sql.gz 2>/dev/null | head -1)
if [ -n "$last" ]; then
  age=$(( ( $(date +%s) - $(stat -c %Y "$last") ) / 3600 ))
  [ "$age" -le 30 ] && ok "last backup $(basename "$last") (${age} h ago)" || bad "last backup is ${age} h old  ->  bash /opt/journal/backup.sh"
else bad "no backup found  ->  bash /opt/journal/backup.sh"; fi
echo
echo "Security"
ufw status | grep -q "Status: active" && ok "firewall on ($(ufw status | grep -c cloudflare) Cloudflare rules)" || bad "firewall OFF  ->  bash /opt/journal/firewall.sh"
end=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/ijmms.in/cert.pem 2>/dev/null | cut -d= -f2)
if [ -n "$end" ]; then days=$(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 )); [ "$days" -gt 20 ] && ok "HTTPS certificate valid ${days} more days" || bad "HTTPS certificate expires in ${days} days  ->  certbot renew"; else warn "HTTPS certificate not found"; fi
n=$(apt list --upgradable 2>/dev/null | grep -c security)
[ "$n" -eq 0 ] && ok "no security updates waiting" || warn "${n} security updates waiting (installed automatically overnight)"
[ -f /var/run/reboot-required ] && warn "a reboot is needed to finish updates  ->  systemctl reboot (site down ~1 min)" || ok "no reboot needed"
[ -f /var/lib/journals/ijmms/admin-initial-password.txt ] && bad "old admin password file still exists  ->  delete it" || ok "no leftover password file"
echo
echo "Email"
grep -q '^SMTP_HOST=.\+' /opt/journal/.env.ms && ok "email sending configured" || bad "email sending not configured  ->  bash /root/IJMMS_journal_website/deploy/set-smtp.sh"
echo
echo "Search engines"
grep -q "PRE-LAUNCH" /etc/nginx/sites-available/ijmms && warn "site hidden from Google (pre-launch setting still on)" || ok "site visible to search engines"
