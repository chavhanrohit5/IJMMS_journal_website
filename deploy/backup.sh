#!/usr/bin/env bash
# Nightly backup: PostgreSQL dumps + uploaded files. Keeps 14 days. COPY /var/backups/journals OFF THE SERVER regularly.
set -euo pipefail
D=/var/backups/journals; T=$(date +%F); mkdir -p "$D"
for n in ijmms ijmls; do
  [ -d /var/lib/journals/$n ] || continue
  sudo -u postgres pg_dump "$n" | gzip > "$D/$n-db-$T.sql.gz"
  tar -czf "$D/$n-files-$T.tar.gz" --exclude="$n/pdf" -C /var/lib/journals "$n"
done
find "$D" -type f -mtime +14 -delete
echo "backup $T done"
# Restore:  gunzip -c ijmms-db-DATE.sql.gz | sudo -u postgres psql ijmms     and     tar -xzf ijmms-files-DATE.tar.gz -C /var/lib/journals
