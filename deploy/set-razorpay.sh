#!/usr/bin/env bash
# Saves the Razorpay API keys for BOTH journals (IJMMS and IJMLS) and restarts them.
# Nothing you type is shown; the keys go only into /opt/journal/.env.ms and .env.ls (root/journal only).
#   sudo bash deploy/set-razorpay.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run with sudo"; exit 1; }
read -rs -p "Razorpay Key ID (rzp_live_...; nothing shows while you type): " KID; echo
[[ "$KID" =~ ^rzp_(live|test)_[A-Za-z0-9]+$ ]] || { echo "That does not look like a Razorpay Key ID; nothing changed."; exit 1; }
read -rs -p "Razorpay Key Secret (nothing shows): " KSEC; echo
[ -n "$KSEC" ] || { echo "No secret entered; nothing changed."; exit 1; }
read -rs -p "Webhook secret you chose in Razorpay > Webhooks (Enter to skip): " WSEC; echo
for J in ms ls; do
  ENVF=/opt/journal/.env.$J
  [ -f "$ENVF" ] || { echo "Skipping $J: $ENVF not found"; continue; }
  KID="$KID" KSEC="$KSEC" WSEC="$WSEC" F="$ENVF" python3 - <<'PY'
import os, re
f = os.environ['F']; s = open(f).read()
kv = {'RAZORPAY_KEY_ID': os.environ['KID'], 'RAZORPAY_KEY_SECRET': '"' + os.environ['KSEC'] + '"'}
if os.environ['WSEC']: kv['RAZORPAY_WEBHOOK_SECRET'] = '"' + os.environ['WSEC'] + '"'
for k, v in kv.items():
    if re.search(r'(?m)^' + k + '=', s): s = re.sub(r'(?m)^' + k + '=.*$', lambda m, k=k, v=v: k + '=' + v, s)
    else: s = s.rstrip('\n') + '\n' + k + '=' + v + '\n'
open(f, 'w').write(s)
PY
  chmod 600 "$ENVF"; chown journal:journal "$ENVF"
  systemctl restart journal@$J
  echo "journal@$J: Razorpay keys saved, restarted."
done
unset KID KSEC WSEC
sleep 3
echo "Done. Open an accepted manuscript in the admin panel: the APC card now shows 'Send Razorpay payment link'."
