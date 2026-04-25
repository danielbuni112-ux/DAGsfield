#!/usr/bin/env node
// Surgical patcher for packages/studio/src/components/ImageStudio.jsx
//
// Зачем не git apply: ImageStudio.jsx крупный, line-number патч ломается от
// малейших правок. Этот скрипт ищет уникальные anchor-строки регэкспами и
// вставляет новый код. Идемпотентен — повторный запуск ничего не меняет.
//
// Запуск:
//   node scripts/apply-trash-button.mjs
//   (опционально DRY=1 — посмотреть diff без записи)

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(__dirname, '..', 'packages/studio/src/components/ImageStudio.jsx');
const DRY = process.env.DRY === '1';
const MARK = '// __plugtown_trash_button_v1__';

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
function ok(msg)  { console.log(`✓ ${msg}`); }

let src;
try { src = readFileSync(TARGET, 'utf8'); }
catch { die(`не нашёл ${TARGET}`); }

// Идемпотентность
if (src.includes(MARK)) {
  ok('Патч уже применён (нашёл маркер). Выходим.');
  process.exit(0);
}

const original = src;

// ─── 1. Импорт react-hot-toast ─────────────────────────────────────────────
{
  const anchor = 'import { generateImage, generateI2I, uploadFile } from "../muapi.js";';
  if (!src.includes(anchor)) die('не нашёл импорт muapi.js');
  src = src.replace(
    anchor,
    `import toast from "react-hot-toast"; ${MARK}\n${anchor}`,
  );
  ok('добавлен импорт react-hot-toast');
}

// ─── 2. Helper persistGeneration ───────────────────────────────────────────
{
  const anchor = '// ─── UploadButton (inline picker) ───';
  if (!src.includes(anchor)) die('не нашёл секцию UploadButton');
  const helper = `
// Сохранить только что сделанную генерацию в БД (корзина работает по
// серверным ID). Возвращает серверный id или null если запрос упал.
async function persistGeneration(entry) {
  try {
    const res = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: entry.kind ?? "image",
        model: entry.model,
        prompt: entry.prompt || "(no prompt)",
        params: { aspect_ratio: entry.aspect_ratio },
        resultUrl: entry.url,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

`;
  src = src.replace(anchor, helper + anchor);
  ok('добавлен helper persistGeneration');
}

// ─── 3. State deletingIds + handleSoftDelete + keyframes-инжект ────────────
{
  const stateAnchor = 'const [generateError, setGenerateError] = useState(null);';
  if (!src.includes(stateAnchor)) die('не нашёл useState generateError');
  src = src.replace(
    stateAnchor,
    `${stateAnchor}\n  const [deletingIds, setDeletingIds] = useState(() => new Set());`,
  );
  ok('добавлен state deletingIds');
}

// ─── 4. addToHistory + persistGeneration в handleGenerate ──────────────────
{
  // Нужно превратить "addToHistory(entry); onGenerationComplete?.({...});"
  // в персист в БД с подменой id.
  const anchor = `          addToHistory(entry);
          onGenerationComplete?.({`;
  if (!src.includes(anchor)) die('не нашёл вызов addToHistory(entry) в handleGenerate');
  src = src.replace(anchor,
`          // Сохраняем в БД и подменяем клиентский id на серверный — это нужно
          // чтобы кнопка "Удалить" умела позвать DELETE /api/generations/:id.
          persistGeneration(entry).then((serverId) => {
            addToHistory(serverId ? { ...entry, id: serverId } : entry);
          });
          onGenerationComplete?.({`,
  );
  ok('addToHistory теперь персистит в БД');
}

// ─── 5. handleSoftDelete сразу после handleGenerate ────────────────────────
{
  // anchor — конец функции handleGenerate (строка с " };" перед placeholderText)
  const anchor = `  const placeholderText =`;
  if (!src.includes(anchor)) die('не нашёл placeholderText');
  src = src.replace(anchor,
`  // ── Soft-delete: переместить в корзину с анимацией стирания ──────────
  const handleSoftDelete = useCallback(async (entry) => {
    if (!entry?.id) return;
    if (deletingIds.has(entry.id)) return;
    setDeletingIds((prev) => new Set(prev).add(entry.id));
    const apiPromise = fetch(\`/api/generations/\${entry.id}\`, { method: "DELETE" });
    await new Promise((r) => setTimeout(r, 720));
    setLocalHistory((prev) => prev.filter((h) => h.id !== entry.id));
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(entry.id);
      return next;
    });
    const res = await apiPromise.catch(() => null);
    if (res && res.ok) toast.success("Перенесено в корзину");
    else toast("Удалено локально (нет связи с сервером)", { icon: "⚠️" });
  }, [deletingIds]);

  ${anchor}`,
  );
  ok('добавлен handleSoftDelete');
}

// ─── 6. Keyframes <style> в начале return ──────────────────────────────────
{
  const anchor = '<div className="w-full h-full flex flex-col items-center justify-center bg-app-bg relative p-4 md:p-6 overflow-hidden">';
  if (!src.includes(anchor)) die('не нашёл корневой div ImageStudio');
  src = src.replace(anchor,
`${anchor}
      {/* Анимация удаления: белая горизонтальная линия со свечением
          поднимается снизу вверх, изображение клипается синхронно. */}
      <style>{\`
        @keyframes plugtown-erase-img {
          from { clip-path: inset(0 0 0 0);   filter: brightness(1); }
          to   { clip-path: inset(0 0 100% 0); filter: brightness(1.6); }
        }
        @keyframes plugtown-erase-line {
          0%   { bottom: 0%;   opacity: 1; }
          90%  { opacity: 1; }
          100% { bottom: 100%; opacity: 0; }
        }
      \`}</style>
`,
  );
  ok('добавлены @keyframes для анимации стирания');
}

// ─── 7. Третья кнопка (корзина) + класс анимации на <img> ──────────────────
{
  // Сначала вставляем кнопку после Download.
  const downloadBtnEnd = `                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>`;
  if (!src.includes(downloadBtnEnd)) die('не нашёл блок Download-кнопки');
  src = src.replace(downloadBtnEnd,
`${downloadBtnEnd}
                  <button
                    type="button"
                    title="Удалить (в корзину)"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSoftDelete(entry);
                    }}
                    disabled={deletingIds.has(entry.id)}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-all border border-white/10 disabled:opacity-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                    </svg>
                  </button>`,
  );
  ok('добавлена третья кнопка (корзина)');
}

// ─── 8. Анимация стирания поверх <img> результата ──────────────────────────
{
  // Только тот <img>, что в галерее истории. Anchor — комбинация атрибутов.
  const imgBlock = `                <img
                  src={entry.url}
                  alt={entry.prompt?.substring(0, 30) || "Generated image"}
                  className="w-full aspect-square object-cover bg-black/40 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFullscreenUrl(entry.url)}
                />`;
  if (!src.includes(imgBlock)) die('не нашёл <img> результата в галерее');
  src = src.replace(imgBlock,
`                <img
                  src={entry.url}
                  alt={entry.prompt?.substring(0, 30) || "Generated image"}
                  className={\`w-full aspect-square object-cover bg-black/40 transition-opacity \${deletingIds.has(entry.id) ? "pointer-events-none" : "cursor-pointer hover:opacity-80"}\`}
                  style={deletingIds.has(entry.id) ? { animation: "plugtown-erase-img 700ms cubic-bezier(0.7,0,0.3,1) forwards" } : undefined}
                  onClick={() => !deletingIds.has(entry.id) && setFullscreenUrl(entry.url)}
                />
                {deletingIds.has(entry.id) && (
                  <div
                    className="absolute inset-x-0 h-[3px] bg-white pointer-events-none z-30"
                    style={{
                      animation: "plugtown-erase-line 700ms cubic-bezier(0.7,0,0.3,1) forwards",
                      boxShadow: "0 0 22px 8px rgba(255,255,255,0.9), 0 0 6px 1px rgba(255,255,255,1)",
                    }}
                  />
                )}`,
  );
  ok('изображение результата теперь стирается анимацией');
}

// ─── Финал ─────────────────────────────────────────────────────────────────
const changedBytes = src.length - original.length;
console.log(`\n${changedBytes >= 0 ? '+' : ''}${changedBytes} байт`);

if (DRY) {
  console.log('\n(DRY=1 — файл не записан)');
} else {
  writeFileSync(TARGET, src);
  ok(`записан ${TARGET}`);
  console.log('\nДальше:');
  console.log('  1. npm run build:studio');
  console.log('  2. pm2 restart plugtown');
}
