#!/bin/bash
# analyze-metrics.sh — анализ метрик из PM2 логов plugtown
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   ./scripts/analyze-metrics.sh              # последние 1000 запросов
#   ./scripts/analyze-metrics.sh 5000         # последние 5000 запросов
#   ./scripts/analyze-metrics.sh 1000 live    # live режим — обновляется каждые 5 сек
#
# Requires jq:  sudo apt install -y jq
# ─────────────────────────────────────────────────────────────────────────────

set -eu

LINES="${1:-1000}"
MODE="${2:-once}"
LOG_FILE="${PM2_LOG:-/root/.pm2/logs/plugtown-out.log}"

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is not installed. Run: sudo apt install -y jq"
  exit 1
fi

if [ ! -r "$LOG_FILE" ]; then
  echo "❌ Cannot read $LOG_FILE"
  echo "Hint: run as root, or set PM2_LOG=/path/to/log"
  exit 1
fi

analyze() {
  local metrics
  metrics=$(tail -n "$LINES" "$LOG_FILE" | grep -a '^PROXY_METRIC ' | sed 's/^PROXY_METRIC //' 2>/dev/null || true)

  if [ -z "$metrics" ]; then
    echo "No PROXY_METRIC lines found in last $LINES lines."
    echo "Either no traffic yet, or logging not enabled on this build."
    return
  fi

  local total
  total=$(echo "$metrics" | wc -l | tr -d ' ')

  clear
  echo "═══════════════════════════════════════════════════════════════"
  echo " Plugtown API Metrics — last $total requests"
  echo " $(date +'%Y-%m-%d %H:%M:%S')"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""

  # ─── Overall stats ────────────────────────────────────────────────────────
  echo "📊 ОБЩАЯ СТАТИСТИКА"
  echo "───────────────────────────────────────────────────────────────"
  echo "$metrics" | jq -s '
    {
      total: length,
      success_rate_pct: (map(select(.status >= 200 and .status < 300)) | length) * 100 / length,
      rate_limited: (map(select(.rate_limited == true)) | length),
      errors_4xx: (map(select(.status >= 400 and .status < 500 and .rate_limited != true)) | length),
      errors_5xx: (map(select(.status >= 500)) | length),
      avg_latency_ms: (map(.latency_ms) | add / length | floor),
      p50_latency_ms: (map(.latency_ms) | sort | .[(length/2 | floor)]),
      p95_latency_ms: (map(.latency_ms) | sort | .[((length * 0.95) | floor)]),
      p99_latency_ms: (map(.latency_ms) | sort | .[((length * 0.99) | floor)]),
      max_inflight: (map(.inflight) | max),
      avg_inflight: (map(.inflight) | add / length | . * 10 | floor / 10)
    }
  ' | jq -r '
    "Всего запросов:           \(.total)",
    "Успешных (2xx):           \(.success_rate_pct | floor)%",
    "Rate-limited (429):       \(.rate_limited)  " + (if .rate_limited > 0 then "⚠️  upstream throttling" else "✅" end),
    "Клиентские ошибки (4xx):  \(.errors_4xx)",
    "Серверные ошибки (5xx):   \(.errors_5xx)  " + (if .errors_5xx > 0 then "⚠️" else "✅" end),
    "",
    "⏱  Latency:",
    "  Average:    \(.avg_latency_ms) ms",
    "  P50 (median): \(.p50_latency_ms) ms",
    "  P95:          \(.p95_latency_ms) ms  " + (if .p95_latency_ms > 15000 then "⚠️  slow" else "" end),
    "  P99:          \(.p99_latency_ms) ms",
    "",
    "🔀 Параллельные запросы:",
    "  Средняя concurrency: \(.avg_inflight)",
    "  Peak concurrency:    \(.max_inflight)  " + (if .max_inflight > 50 then "⚠️  близко к лимиту Pro tier" else "" end)
  '

  echo ""
  echo "📂 ПО КАТЕГОРИЯМ (что юзеры делают чаще всего)"
  echo "───────────────────────────────────────────────────────────────"
  echo "$metrics" | jq -s '
    group_by(.category) |
    map({
      category: .[0].category,
      count: length,
      avg_latency_ms: (map(.latency_ms) | add / length | floor),
      errors: (map(select(.status >= 400)) | length)
    }) |
    sort_by(-.count)
  ' | jq -r '.[] | "  \(.category | . + (" " * (24 - length)))  count=\(.count)  avg=\(.avg_latency_ms)ms  err=\(.errors)"'

  echo ""
  echo "🚨 ПОСЛЕДНИЕ ОШИБКИ (если есть)"
  echo "───────────────────────────────────────────────────────────────"
  local errors
  errors=$(echo "$metrics" | jq -c 'select(.status >= 400)' | tail -5)
  if [ -z "$errors" ]; then
    echo "  ✅ Ошибок нет"
  else
    echo "$errors" | jq -r '"  [\(.t)] \(.category) → \(.status) (\(.latency_ms)ms)" + (if .error then " — \(.error)" else "" end)'
  fi

  echo ""
  echo "💡 ЧТО ДЕЛАТЬ (автоматические подсказки)"
  echo "───────────────────────────────────────────────────────────────"
  echo "$metrics" | jq -s '
    {
      rl: (map(select(.rate_limited == true)) | length),
      tot: length,
      p95: (map(.latency_ms) | sort | .[((length * 0.95) | floor)]),
      maxcc: (map(.inflight) | max),
      err5: (map(select(.status >= 500)) | length)
    }
  ' | jq -r '
    (if (.rl * 100 / .tot) > 1 then
      "  ⚠️  >1% rate-limited. Время upgrade muapi tier или подключить fal.ai fallback."
    else empty end),
    (if .p95 > 15000 then
      "  ⚠️  P95 latency >15сек. Юзеры чувствуют тормоза. Проверь upstream или добавь provider."
    else empty end),
    (if .maxcc > 40 then
      "  ⚠️  Peak concurrency >40. Pro tier muapi ≈50 concurrent — скоро упрёшься."
    else empty end),
    (if (.err5 * 100 / .tot) > 2 then
      "  🔥  >2% 5xx ошибок. muapi нестабилен, нужен резервный провайдер СРОЧНО."
    else empty end),
    (if ((.rl * 100 / .tot) <= 1 and .p95 <= 15000 and .maxcc <= 40 and (.err5 * 100 / .tot) <= 2) then
      "  ✅ Всё в пределах нормы. Ничего делать не надо."
    else empty end)
  '
  echo ""
}

if [ "$MODE" = "live" ]; then
  while true; do
    analyze
    echo "🔄 Обновится через 5 секунд... (Ctrl+C чтобы остановить)"
    sleep 5
  done
else
  analyze
fi
