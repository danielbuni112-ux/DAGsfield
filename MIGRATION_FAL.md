# Миграция plugtown.ru с muapi.ai на fal.ai

## Что изменилось

| Компонент | Было (muapi) | Стало (fal.ai) |
|---|---|---|
| API провайдер | muapi.ai (агрегатор) | fal.ai (напрямую) |
| Серверный прокси | `/api/muapi/[[...path]]/route.js` | `/api/fal/[[...path]]/route.js` |
| Env var | `MUAPI_API_KEY` | `FAL_KEY` (формат `id:secret`) |
| SDK | — (raw fetch + polling) | `@fal-ai/serverless-client` |
| Client polling | Да, каждые 2 сек | Нет — SDK делает это на сервере |
| Workflow Builder | Работает | **Coming Soon** (fal не поддерживает) |
| AI Agents | Работает | **Coming Soon** (fal не поддерживает) |
| Image/Video/LipSync | Работает | Работает (новые модели) |
| Балан в UI | Реальная сумма | "fal.ai" (API не выдаёт balance) |

## Файлы, которые изменились

1. **`app/api/fal/[[...path]]/route.js`** (новый) — серверный прокси для fal.ai
2. **`app/api/fal-upload/route.js`** (новый) — upload файлов в fal.ai storage
3. **`packages/studio/src/fal-models.js`** (новый) — каталог fal моделей + маппинг
4. **`packages/studio/src/muapi.js`** (переписан) — теперь вызывает fal.ai через свой прокси
5. **`components/StandaloneShell.js`** (переписан) — Coming Soon для Workflows/Agents
6. **`middleware.js`** (упрощён) — больше не rewrite'ит на muapi.ai
7. **`package.json`** — добавлен `@fal-ai/serverless-client` + `@babel/core` в deps
8. **`.env.production.example`** — новый env шаблон с `FAL_KEY`

## Список поддерживаемых моделей

См. `packages/studio/src/fal-models.js`. Основные:

**Image:** Nano Banana, Nano Banana Pro, Flux Dev, Flux Schnell, Flux Pro, Flux Pro Ultra, Fast SDXL, Ideogram v2, HiDream I1 Fast

**Image-to-Image:** Flux Kontext, Nano Banana Edit, Flux Dev I2I

**Text-to-Video:** Kling v2/v2.1 Master, Hailuo 02 Standard/Pro, Seedance v1 Pro

**Image-to-Video:** Kling v2 I2V, Hailuo 02 I2V, Hailuo 02 Pro I2V, Seedance v1 Pro I2V

**Lip Sync:** Sync LipSync, Veed LipSync

Модели НЕ из этого списка при попытке генерации вернут ошибку `"Модель X пока не доступна через fal.ai. Coming soon!"`.

## Как применить миграцию

### На маке — создать ветку и запушить

```bash
# 1. Перейти в локальный клон
cd ~/путь/к/DAGsfield

# 2. Убедиться что на main
git checkout main
git pull origin main

# 3. Создать feature-ветку
git checkout -b migrate-to-fal

# 4. Скопировать обновлённые файлы из workspace
# (пути с workspace на маке — замени на свои если другой путь)

WS="/Users/daniel/Documents/Claude/Projects/DAGfield"

mkdir -p "app/api/fal/[[...path]]"
mkdir -p "app/api/fal-upload"
mkdir -p "packages/studio/src"

cp "$WS/app/api/fal/[[...path]]/route.js" "app/api/fal/[[...path]]/route.js"
cp "$WS/app/api/fal-upload/route.js" "app/api/fal-upload/route.js"
cp "$WS/packages/studio/src/fal-models.js" "packages/studio/src/fal-models.js"
cp "$WS/packages/studio/src/muapi.js" "packages/studio/src/muapi.js"
cp "$WS/components/StandaloneShell.js" "components/StandaloneShell.js"
cp "$WS/middleware.js" "middleware.js"
cp "$WS/package.json" "package.json"
cp "$WS/.env.production.example" ".env.production.example"
cp "$WS/MIGRATION_FAL.md" "MIGRATION_FAL.md"

# 5. Проверить что всё на месте
git status

# 6. Коммит + пуш ветки
git add .
git commit -m "feat: migrate from muapi.ai to fal.ai (variant B monetization)

Replaces the muapi.ai aggregator with direct fal.ai integration for ~40%
cheaper inference and better rate limits. Migration preserves client
function signatures so studio components work without changes.

Changes:
- Add @fal-ai/serverless-client SDK
- New /api/fal/[[...path]] proxy using fal.subscribe (SDK handles polling)
- New /api/fal-upload for file storage
- Rewrite packages/studio/src/muapi.js to call fal via our proxy
- fal-models.js catalog with 20+ supported models across image/video/lipsync
- Coming Soon placeholders for Workflows + Agents (muapi-only features)
- Update .env template with FAL_KEY
- Add @babel/core to devDependencies (was missing, broke builds)

To rollback: git checkout main. Both branches can coexist."

git push -u origin migrate-to-fal
```

Потом открой GitHub и создай **Pull Request** `migrate-to-fal → main`. Можно merge сразу, можно оставить открытым для ревью.

### На VPS — деплой ветки

Сначала получи fal.ai API ключ:
- https://fal.ai/dashboard/keys
- Нажми "Add new key"
- Скопируй в формате `<key_id>:<key_secret>`

Потом:

```bash
ssh deploy@89.223.68.87
sudo -i
cd /root/DAGsfield

# 1. Обновить .env.production — добавить FAL_KEY
nano .env.production
# Добавь строку:  FAL_KEY=<твой_ключ_id>:<твой_секрет>
# Старый MUAPI_API_KEY можно оставить (он игнорируется)
# Сохрани: Ctrl+X, Y, Enter

# 2. Переключиться на ветку migrate-to-fal
git fetch origin
git checkout migrate-to-fal
git pull origin migrate-to-fal

# 3. Установить новый SDK
npm install --legacy-peer-deps

# 4. Clean rebuild
rm -rf .next node_modules/.cache
npm run build:studio
npm run build

# 5. Перезапустить PM2
pm2 delete plugtown
pm2 start npm --name plugtown -- start
pm2 save
pm2 status

# 6. Проверить
sleep 3
curl -I https://plugtown.ru

exit
```

### Проверка в браузере

Chrome incognito → https://plugtown.ru

**Должно быть:**
- ✅ Сразу открывается Image Studio (без экрана ввода ключа)
- ✅ В хедере "fal.ai" вместо баланса (fal не выдаёт balance через API)
- ✅ Вкладки Workflows/Agents показывают "Coming Soon" с серой надписью
- ✅ Image Studio работает: выбираешь Nano Banana или Flux → жмёшь Generate → приходит картинка

**Если ошибка "Модель X не поддерживается":**
- Проверь что ты выбрал модель из списка поддерживаемых в `fal-models.js`
- Если модель нужная — добавь её в `fal-models.js` (найди fal endpoint на https://fal.ai/models)

## Откат на muapi (если что-то пойдёт не так)

```bash
ssh deploy@89.223.68.87
sudo -i
cd /root/DAGsfield
git checkout main
rm -rf .next
npm run build:studio
npm run build
pm2 reload plugtown
exit
```

Сайт вернётся к состоянию на muapi.

## Troubleshooting

### `npm install` падает на `@fal-ai/serverless-client`
```bash
npm install --legacy-peer-deps --force
```

### Ошибка "FAL_KEY not configured on server"
Проверь что `.env.production` содержит `FAL_KEY=...`
```bash
cat /root/DAGsfield/.env.production | grep FAL_KEY
```
Если нет — добавь и перезапусти: `pm2 restart plugtown --update-env`

### Ошибка "Модель X не доступна через fal.ai"
Модель отсутствует в `fal-models.js`. Либо выбери другую модель, либо добавь её в каталог.

### Все запросы падают с 401 Unauthorized
Неправильный формат `FAL_KEY`. Должен быть **`key_id:key_secret`** (с двоеточием посередине). Проверь на https://fal.ai/dashboard/keys.

### Upload файлов не работает
Проверь что роут `/api/fal-upload` создан. Папка должна быть `app/api/fal-upload/route.js`.

## Что осталось сделать (следующие итерации)

1. **Расширить каталог моделей** — добавить больше fal моделей в `fal-models.js`
2. **Убрать dead code** — удалить `app/api/muapi/*`, `app/api/workflow/*`, `app/api/agents/*` если они больше не нужны
3. **Улучшить UX Coming Soon** — показать roadmap вместо просто заглушки
4. **Добавить rate limiting** — защитить от abuse
5. **Credit система** — посчитать стоимость каждой генерации через fal и списывать с пользователя
