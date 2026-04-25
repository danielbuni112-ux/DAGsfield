#!/usr/bin/env -S npx tsx
//
// Cron-задача: физически удаляет генерации, которые провалялись в корзине
// больше TRASH_RETENTION_DAYS (по умолчанию 30 дней).
//
// Запуск вручную:
//   DATABASE_URL=postgres://... npx tsx scripts/purge-trash.ts
//
// Production (systemd timer на VPS, см. инструкцию в конце файла).

import 'dotenv/config';
import { db } from '../lib/db/client';
import { generation, TRASH_RETENTION_DAYS } from '../lib/db/schema';
import { and, isNotNull, lt, sql } from 'drizzle-orm';

async function main() {
  const startedAt = Date.now();

  // Удаляем строки, у которых deleted_at старше N дней.
  const deleted = await db
    .delete(generation)
    .where(and(
      isNotNull(generation.deletedAt),
      lt(
        generation.deletedAt,
        sql`NOW() - make_interval(days => ${TRASH_RETENTION_DAYS})`,
      ),
    ))
    .returning({ id: generation.id, userId: generation.userId });

  const tookMs = Date.now() - startedAt;
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    job: 'purge-trash',
    retention_days: TRASH_RETENTION_DAYS,
    purged_count: deleted.length,
    took_ms: tookMs,
  }));

  process.exit(0);
}

main().catch((err) => {
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    job: 'purge-trash',
    error: String(err?.message ?? err),
  }));
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SETUP (Timeweb VPS)
// ─────────────────────────────────────────────────────────────────────────────
//
// Вариант 1: systemd timer (предпочтительно — логи в journalctl, ретраи)
//
//   /etc/systemd/system/plugtown-purge-trash.service
//   ----------------------------------------------------
//   [Unit]
//   Description=Plugtown — purge generations trash older than 30 days
//   After=network.target postgresql.service
//
//   [Service]
//   Type=oneshot
//   WorkingDirectory=/root/DAGsfield
//   EnvironmentFile=/root/DAGsfield/.env.production
//   ExecStart=/usr/bin/npx tsx scripts/purge-trash.ts
//   StandardOutput=journal
//   StandardError=journal
//
//   /etc/systemd/system/plugtown-purge-trash.timer
//   ----------------------------------------------------
//   [Unit]
//   Description=Run plugtown-purge-trash daily at 04:30 MSK
//
//   [Timer]
//   OnCalendar=*-*-* 04:30:00
//   Persistent=true
//
//   [Install]
//   WantedBy=timers.target
//
//   Активация:
//     sudo systemctl daemon-reload
//     sudo systemctl enable --now plugtown-purge-trash.timer
//     sudo systemctl list-timers | grep purge-trash
//     journalctl -u plugtown-purge-trash.service -n 20
//
// Вариант 2: cron (проще, но без ретраев)
//
//   sudo crontab -e
//   30 4 * * *  cd /root/DAGsfield && /usr/bin/npx tsx scripts/purge-trash.ts >> /var/log/plugtown-purge.log 2>&1
//
