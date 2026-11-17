#!/usr/bin/env bash
# Sets the journal's outgoing e-mail account and restarts the site. The password is read
# without being shown and is written only to /opt/journal/.env.ms (readable by root/journal only).
#   sudo bash deploy/set-smtp.sh                      # GoDaddy mailbox editor@ijmms.in (defaults)
#   sudo bash deploy/set-smtp.sh user@domain host port
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
USER_ADDR="${1:-editor@ijmms.in}"; HOST="${2:-smtpout.secureserver.net}"; PORT="${3:-465}"
ENVF=/opt/journal/.env.ms
read -rs -p "Password for $USER_ADDR (nothing shows while you type): " P; echo
[ -n "$P" ] || { echo "No password entered; nothing changed."; exit 1; }
P="$P" U="$USER_ADDR" H="$HOST" PT="$PORT" F="$ENVF" python3 - <<'PY'
import os, re
f = os.environ['F']; s = open(f).read()
port = os.environ['PT']
kv = {'SMTP_HOST': os.environ['H'], 'SMTP_PORT': port, 'SMTP_SECURE': 'true' if port == '465' else 'false',
      'SMTP_USER': os.environ['U'], 'SMTP_PASS': '"' + os.environ['P'] + '"'}
for k, v in kv.items():
    if re.search(r'(?m)^' + k + '=', s):
        s = re.sub(r'(?m)^' + k + '=.*$', lambda m, k=k, v=v: k + '=' + v, s)
    else:
        s += '\n' + k + '=' + v + '\n'
open(f, 'w').write(s)
PY
unset P
chmod 600 "$ENVF"; chown journal:journal "$ENVF"
systemctl restart journal@ms; sleep 3
journalctl -u journal@ms -n 1 --no-pager -o cat
echo "Done. Now use Admin > Outbox > Send test email."
