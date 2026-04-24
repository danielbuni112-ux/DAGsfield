#!/bin/bash
# deploy-fal.sh — автоматический деплой ветки migrate-to-fal на production.
# ─────────────────────────────────────────────────────────────────────────────
# Запускается как root на VPS plugtown.ru:
#   sudo -i
#   cat /tmp/deploy-fal.sh  # убедиться что файл получен
#   bash /tmp/deploy-fal.sh
#
# Делает:
#   1. Сбрасывает локальные изменения (git reset --hard)
#   2. Переключается на ветку migrate-to-fal
#   3. Устанавливает @fal-ai/serverless-client
#   4. Очищает кеш и пересобирает Next.js
#   5. Проверяет что fal роут реально собрался
#   6. Перезапускает PM2 с новыми env
#   7. Делает smoke-test через curl
# ─────────────────────────────────────────────────────────────────────────────

set -e  # stop on first error
cd /root/DAGsfield

say() { echo ""; echo "━━━ $* ━━━"; }
ok()  { echo "  ✅ $*"; }
err() { echo "  ❌ $*"; exit 1; }

# ─── Step 1: reset local changes ─────────────────────────────────────────────
say "Шаг 1/8: сбрасываем локальные изменения"
git reset --hard HEAD
git clean -fd
ok "Рабочая директория чистая"

# ─── Step 2: switch to migrate-to-fal ────────────────────────────────────────
say "Шаг 2/8: переключаемся на ветку migrate-to-fal"
git fetch origin
git checkout migrate-to-fal
git pull origin migrate-to-fal

CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git log -1 --format="%h %s")

if [ "$CURRENT_BRANCH" != "migrate-to-fal" ]; then
  err "Ветка $CURRENT_BRANCH, ожидалась migrate-to-fal"
fi
ok "Ветка: $CURRENT_BRANCH"
ok "Коммит: $CURRENT_COMMIT"

# ─── Step 3: verify fal files exist ──────────────────────────────────────────
say "Шаг 3/8: проверяем что fal-файлы на диске"
for f in \
  'app/api/fal/[[...path]]/route.js' \
  'packages/studio/src/fal-models.js' \
  'app/api/fal-upload/route.js'; do
  if [ -f "$f" ]; then
    ok "$f"
  else
    err "MISSING: $f — файл не запушен в ветку"
  fi
done

# ─── Step 4: install dependencies ────────────────────────────────────────────
say "Шаг 4/8: устанавливаем npm пакеты (включая @fal-ai/serverless-client)"
npm install --legacy-peer-deps

if [ ! -f "node_modules/@fal-ai/serverless-client/package.json" ]; then
  err "fal SDK не установился — проверь логи npm"
fi
ok "@fal-ai/serverless-client установлен"

# ─── Step 5: clean build ─────────────────────────────────────────────────────
say "Шаг 5/8: полная пересборка (5-8 минут)"
rm -rf .next node_modules/.cache
npm run build:studio
npm run build
ok "Сборка завершена"

# ─── Step 6: verify fal route was built ──────────────────────────────────────
say "Шаг 6/8: проверяем что fal роут в .next"
if [ ! -d ".next/server/app/api/fal" ]; then
  err "fal роут НЕ собрался. Проверь npm run build лог — возможно ошибка в route.js"
fi
ok "fal роут собран: .next/server/app/api/fal/"

# ─── Step 7: restart PM2 ─────────────────────────────────────────────────────
say "Шаг 7/8: перезапускаем PM2 с новым env"
pm2 delete plugtown 2>/dev/null || true
pm2 start npm --name plugtown -- start --update-env
pm2 save
sleep 4
pm2 status
ok "PM2 перезапущен"

# ─── Step 8: smoke test ──────────────────────────────────────────────────────
say "Шаг 8/8: проверяем что fal.ai отвечает"
RESPONSE=$(curl -s -X POST https://plugtown.ru/api/fal/fal-ai/nano-banana \
  -H "Content-Type: application/json" \
  -d '{"prompt":"smoke test cyberpunk cat"}' \
  --max-time 90 || echo "CURL_FAILED")

if echo "$RESPONSE" | grep -q '"images"'; then
  URL=$(echo "$RESPONSE" | grep -oE '"url":"[^"]+"' | head -1 | cut -d'"' -f4)
  ok "fal.ai работает!"
  ok "Пример картинки: $URL"
elif echo "$RESPONSE" | grep -q "Unauthorized"; then
  err "401 Unauthorized — проверь FAL_KEY в /root/DAGsfield/.env.production"
elif echo "$RESPONSE" | grep -q "FAL_KEY not configured"; then
  err "FAL_KEY не подхватился. Выполни: pm2 restart plugtown --update-env"
elif echo "$RESPONSE" | grep -q "next-error-h1"; then
  err "Сайт всё ещё отдаёт 404. fal роут не собрался."
else
  echo ""
  echo "⚠️  Неопознанный ответ (первые 500 символов):"
  echo "$RESPONSE" | head -c 500
  echo ""
fi

# ─── Done ────────────────────────────────────────────────────────────────────
say "ГОТОВО"
echo ""
echo "Проверь в браузере:  https://plugtown.ru"
echo "  - Должен сразу открываться Image Studio"
echo "  - Workflows/Agents вкладки — с бейджем 'soon'"
echo ""
echo "Логи:                pm2 logs plugtown --lines 50"
echo "Метрики:             /root/DAGsfield/scripts/analyze-metrics.sh"
echo ""
echo "Rollback если что:   git checkout main && npm run build && pm2 reload plugtown"
