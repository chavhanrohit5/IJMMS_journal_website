#!/usr/bin/env bash
# One-screen health check of the journal server. Changes nothing.
#   bash /root/IJMMS_journal_website/deploy/health.sh
ok(){ printf '  [ OK ]  %s\n' "$1"; }
bad(){ printf '  [FAIL]  %s\n' "$1"; }
warn(){ printf '  [WARN]  %s\n' "$1"; }
echo "Journal server health  $(date '+%d %b %Y %H:%M %Z')"
echo
echo "Services"
JS=""; for j in ms ls; do [ -f /opt/journal/.env.$j ] && JS="$JS $j"; done
name(){ [ "$1" = ls ] && echo IJMLS || echo IJMMS; }
site(){ [ "$1" = ls ] && echo ijmls || echo ijmms; }
for s in nginx postgresql; do systemctl is-active --quiet "$s" && ok "$s running" || bad "$s NOT running  ->  systemctl restart $s"; done
for j in $JS; do
  port=3001; [ $j = ls ] && port=3002
  systemctl is-active --quiet journal@$j && curl -fsS -o /dev/null http://127.0.0.1:$port/ && ok "$(name $j) running and answering" || bad "$(name $j) not answering  ->  systemctl restart journal@$j   (details: journalctl -u journal@$j -n 50 --no-pager)"
done
echo
echo "Space and memory"
use=$(df -P / | awk 'NR==2{gsub("%","",$5);print $5}')
[ "$use" -lt 80 ] && ok "disk ${use}% used" || { [ "$use" -lt 90 ] && warn "disk ${use}% used (clean up soon)" || bad "disk ${use}% used (nearly full)"; }
mem=$(free -m | awk '/Mem:/{printf "%d", ($2-$7)*100/$2}')
[ "$mem" -lt 85 ] && ok "memory ${mem}% used" || warn "memory ${mem}% used"
echo
echo "Backups"
for j in $JS; do
  last=$(ls -1t /var/backups/journals/$(site $j)-files-*.tar.gz 2>/dev/null | head -1)
  if [ -n "$last" ]; then
    age=$(( ( $(date +%s) - $(stat -c %Y "$last") ) / 3600 ))
    [ "$age" -le 30 ] && ok "$(name $j) last backup $(basename "$last") (${age} h ago)" || bad "$(name $j) last backup is ${age} h old  ->  bash /opt/journal/backup.sh"
  else bad "$(name $j) has no backup yet  ->  bash /opt/journal/backup.sh"; fi
done
echo
echo "Security"
ufw status | grep -q "Status: active" && ok "firewall on ($(ufw status | grep -c cloudflare) Cloudflare rules)" || bad "firewall OFF  ->  bash /opt/journal/firewall.sh"
for j in $JS; do
  dom=$(sed -n 's#^SITE_URL=https\?://##p' /opt/journal/.env.$j | tr -d '"' | head -1)
  end=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$dom/cert.pem 2>/dev/null | cut -d= -f2)
  if [ -n "$end" ]; then days=$(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 )); [ "$days" -gt 20 ] && ok "$dom HTTPS certificate valid ${days} more days" || bad "$dom HTTPS certificate expires in ${days} days  ->  certbot renew"; else warn "$dom HTTPS certificate not found"; fi
done
n=$(apt list --upgradable 2>/dev/null | grep -c security)
[ "$n" -eq 0 ] && ok "no security updates waiting" || warn "${n} security updates waiting (installed automatically overnight)"
[ -f /var/run/reboot-required ] && warn "a reboot is needed to finish updates  ->  systemctl reboot (site down ~1 min)" || ok "no reboot needed"
for j in $JS; do f=/var/lib/journals/$(site $j)/admin-initial-password.txt; [ -f $f ] && bad "$(name $j) first admin password file still exists  ->  change the password, then: rm $f" || ok "$(name $j) has no leftover password file"; done
echo
echo "Email"
for j in $JS; do grep -q '^SMTP_HOST=.\+' /opt/journal/.env.$j && ok "$(name $j) email sending configured" || bad "$(name $j) email sending not configured  ->  JOURNAL=$j bash /root/IJMMS_journal_website/deploy/set-smtp.sh"; done
echo
echo "Search engines"
for j in $JS; do grep -q "PRE-LAUNCH" /etc/nginx/sites-available/$(site $j) 2>/dev/null && warn "$(name $j) hidden from Google (pre-launch setting still on)" || ok "$(name $j) visible to search engines"; done
