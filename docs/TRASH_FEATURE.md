# Корзина для генераций — деплой

Soft-delete + 30-дневное хранение + кнопка удаления с анимацией.

## Что добавлено

| Файл | Что |
|---|---|
| `lib/db/schema.ts` | Колонка `deleted_at` + индекс `gen_user_trash_idx` + константа `TRASH_RETENTION_DAYS = 30` |
| `drizzle/0001_add_trash.sql` | SQL-миграция (idempotent, безопасна на проде) |
| `app/api/generations/route.ts` | GET-фильтр `?view=active\|trash`, поле `expiresAt` для UI |
| `app/api/generations/[id]/route.ts` | `DELETE` (soft) + `PATCH { action: 'restore' \| 'purge' }` |
| `app/account/history/page.jsx` | Плажка «Корзина», восстановление, удаление навсегда, обратный отсчёт «осталось N дней» |
| `scripts/purge-trash.ts` | Cron-скрипт, чистит просроченные >30 дней (systemd timer внутри файла) |
| `scripts/apply-trash-button.mjs` | Surgical-патчер для `ImageStudio.jsx` (3-я кнопка + анимация стирания) |
| `patches/0001-trash-button-imagestudio.patch` | Тот же diff в виде unified-патча — для ревью / `git apply` |

## Деплой на VPS (89.223.68.87)

```bash
ssh deploy@89.223.68.87
sudo -i
cd /root/DAGsfield
git checkout migrate-to-fal && git pull

# 1. Применить миграцию БД
psql "$(grep DATABASE_URL .env.production | cut -d= -f2-)" -f drizzle/0001_add_trash.sql

# 2. Пропатчить ImageStudio (идемпотентно)
node scripts/apply-trash-button.mjs

# 3. Пересобрать studio package + перезапустить Next
npm run build:studio
pm2 restart plugtown

# 4. Поставить ежедневный purge корзины (см. инструкцию внутри purge-trash.ts)
sudo cp /root/DAGsfield/deploy/plugtown-purge-trash.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now plugtown-purge-trash.timer
sudo systemctl list-timers | grep purge-trash
```

## Что увидит пользователь

**В студии** (после генерации фото) — третья круглая кнопка-корзина под раскрытием и скачиванием. Клик → горизонтальная белая линия со свечением идёт снизу вверх, изображение клипается синхронно (~700ms), карточка исчезает, тост «Перенесено в корзину».

**В `/account/history`** — пилюля «Корзина» справа от LipSync. В режиме корзины:
- Шильдик «осталось N дн.» в углу карточки (красный когда ≤ 3 дней)
- Hover-actions: «Восстановить» (зелёный) и «Навсегда» (красный)
- Подсказка вверху: «Файлы хранятся 30 дней, потом удаляются автоматически»

## Безопасность

- Все CRUD-операции скоупятся по `userId` — попытка тронуть чужую генерацию возвращает 404 без утечки
- `DELETE` идемпотентен: повторный вызов на уже удалённой записи отдаёт 404, не двигает `deleted_at`
- `purge` принимается только для записей где `deleted_at IS NOT NULL` — нельзя удалить навсегда минуя корзину
- Файл на fal.ai CDN не трогаем — у них собственная ретенция 24-72ч и API не даёт ручного удаления. Если позже зеркалим в свой Object Storage — добавим bucket-delete в `PATCH … purge`

## Откат

```sql
-- Если что-то сломалось, восстановить всю корзину одним запросом:
UPDATE generation SET deleted_at = NULL WHERE deleted_at IS NOT NULL;

-- Полный откат миграции (теряем колонку, корзина становится пуста):
DROP INDEX IF EXISTS gen_user_trash_idx;
ALTER TABLE generation DROP COLUMN IF EXISTS deleted_at;
```

```bash
# Откат кода:
cd /root/DAGsfield
git checkout migrate-to-fal -- packages/studio/src/components/ImageStudio.jsx
npm run build:studio && pm2 restart plugtown
```
