-- Migration: добавить корзину для генераций (soft-delete + 30-дневное хранение)
--
-- Безопасно для прод-БД: добавляем NULLable колонку и индекс CONCURRENTLY,
-- старые строки получают deleted_at = NULL (т.е. остаются активными).
--
-- Применить вручную:
--   psql "$DATABASE_URL" -f drizzle/0001_add_trash.sql
-- Или через drizzle-kit:
--   npm run db:push    -- drizzle сам сгенерит ALTER (idempotent)

ALTER TABLE "generation"
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- Индекс для быстрых запросов "что в корзине" и для cron-purge.
-- CONCURRENTLY = без блокировки таблицы, безопасно на проде.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "gen_user_trash_idx"
  ON "generation" ("user_id", "deleted_at");
