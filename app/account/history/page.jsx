'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const KINDS = [
  { value: '',        label: 'Все' },
  { value: 'image',   label: 'Фото' },
  { value: 'video',   label: 'Видео' },
  { value: 'i2i',     label: 'Image-to-image' },
  { value: 'i2v',     label: 'Image-to-video' },
  { value: 'lipsync', label: 'LipSync' },
];

const DAY_MS = 86_400_000;

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / DAY_MS));
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [kind, setKind] = useState('');
  // view: 'active' (история) | 'trash' (корзина)
  const [view, setView] = useState('active');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  // CSS-классы для уходящих карточек: { id: 'fade-out' | 'erase' }
  const [exitingIds, setExitingIds] = useState({});

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (kind) params.set('kind', kind);
      if (view === 'trash') params.set('view', 'trash');
      if (!reset && cursor) params.set('cursor', cursor);
      params.set('limit', '24');

      const res = await fetch(`/api/generations?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      toast.error('Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  }, [kind, view, cursor]);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setExitingIds({});
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, view]);

  // ─── Действия ────────────────────────────────────────────────────────────
  const removeFromList = (id, animationMs = 350) => {
    setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
      setExitingIds((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }, animationMs);
  };

  // Перенести в корзину (из активного списка)
  const softDelete = async (item) => {
    setExitingIds((prev) => ({ ...prev, [item.id]: 'erase' }));
    const res = await fetch(`/api/generations/${item.id}`, { method: 'DELETE' });
    if (res.ok) {
      removeFromList(item.id, 720);
      toast.success('Перенесено в корзину');
    } else {
      setExitingIds((prev) => { const c = { ...prev }; delete c[item.id]; return c; });
      toast.error('Не удалось удалить');
    }
  };

  // Восстановить из корзины
  const restore = async (item) => {
    setExitingIds((prev) => ({ ...prev, [item.id]: 'fade' }));
    const res = await fetch(`/api/generations/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore' }),
    });
    if (res.ok) {
      removeFromList(item.id, 350);
      toast.success('Восстановлено');
    } else {
      setExitingIds((prev) => { const c = { ...prev }; delete c[item.id]; return c; });
      toast.error('Не удалось восстановить');
    }
  };

  // Удалить навсегда
  const purge = async (item) => {
    if (!confirm('Удалить навсегда? Это действие необратимо.')) return;
    setExitingIds((prev) => ({ ...prev, [item.id]: 'erase' }));
    const res = await fetch(`/api/generations/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'purge' }),
    });
    if (res.ok) {
      removeFromList(item.id, 720);
      toast.success('Удалено навсегда');
    } else {
      setExitingIds((prev) => { const c = { ...prev }; delete c[item.id]; return c; });
      toast.error('Не удалось удалить');
    }
  };

  const isVideo = (g) => g.kind === 'video' || g.kind === 'i2v' || g.kind === 'lipsync';

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Анимация: белая горизонтальная линия со свечением идёт снизу вверх,
          изображение клипается синхронно. */}
      <style>{`
        @keyframes plugtown-erase-img {
          from { clip-path: inset(0 0 0 0);   filter: brightness(1); }
          to   { clip-path: inset(0 0 100% 0); filter: brightness(1.6); }
        }
        @keyframes plugtown-erase-line {
          0%   { bottom: 0%;   opacity: 1; }
          90%  { opacity: 1; }
          100% { bottom: 100%; opacity: 0; }
        }
        @keyframes plugtown-fade-out {
          to { opacity: 0; transform: scale(0.96); }
        }
        .plugtown-erasing-img  { animation: plugtown-erase-img  700ms cubic-bezier(0.7,0,0.3,1) forwards; }
        .plugtown-erasing-line { animation: plugtown-erase-line 700ms cubic-bezier(0.7,0,0.3,1) forwards;
                                box-shadow: 0 0 22px 8px rgba(255,255,255,0.9), 0 0 6px 1px rgba(255,255,255,1); }
        .plugtown-fading       { animation: plugtown-fade-out 320ms ease-out forwards; }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold">
            {view === 'trash' ? 'Корзина' : 'История генераций'}
          </h1>
          <div className="flex gap-3 text-sm">
            <Link href="/studio" className="text-white/60 hover:text-white">← Студия</Link>
            <Link href="/account" className="text-white/60 hover:text-white">Аккаунт</Link>
          </div>
        </header>

        {/* Пилюли: Все / Фото / Видео / ... / Корзина */}
        <div className="flex gap-2 flex-wrap">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => { setView('active'); setKind(k.value); }}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                view === 'active' && kind === k.value
                  ? 'bg-[#d4ff00] text-black font-semibold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {k.label}
            </button>
          ))}

          {/* Разделитель + плажка корзины */}
          <div className="w-px self-stretch bg-white/10 mx-1" />

          <button
            onClick={() => { setView('trash'); setKind(''); }}
            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-1.5 ${
              view === 'trash'
                ? 'bg-red-500/20 text-red-300 font-semibold border border-red-500/40'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
            Корзина
          </button>
        </div>

        {/* Подсказка про 30 дней — только в корзине */}
        {view === 'trash' && (
          <p className="text-xs text-white/40">
            Файлы хранятся 30 дней, потом удаляются автоматически. Можно восстановить или удалить навсегда.
          </p>
        )}

        {items.length === 0 && !loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-white/50">
            {view === 'trash'
              ? 'Корзина пуста.'
              : <>Пока пусто. <Link href="/studio" className="text-[#d4ff00] hover:underline">Создай первую генерацию</Link></>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((g) => {
            const exiting = exitingIds[g.id];
            const isErasing = exiting === 'erase';
            const isFading  = exiting === 'fade';
            const left = view === 'trash' ? daysLeft(g.expiresAt) : null;

            return (
              <div
                key={g.id}
                className={`group rounded-xl overflow-hidden bg-white/[0.02] border border-white/10 hover:border-[#d4ff00]/40 transition ${isFading ? 'plugtown-fading' : ''}`}
              >
                <div className="aspect-square bg-black relative overflow-hidden">
                  {isVideo(g) ? (
                    <video
                      src={g.resultUrl}
                      poster={g.thumbnailUrl ?? undefined}
                      className={`w-full h-full object-cover ${isErasing ? 'plugtown-erasing-img' : ''}`}
                      muted
                      loop
                      onMouseEnter={(e) => !isErasing && e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <img
                      src={g.thumbnailUrl ?? g.resultUrl}
                      alt={g.prompt}
                      loading="lazy"
                      className={`w-full h-full object-cover ${isErasing ? 'plugtown-erasing-img' : ''}`}
                    />
                  )}

                  {isErasing && (
                    <div className="absolute inset-x-0 h-[3px] bg-white pointer-events-none z-30 plugtown-erasing-line" />
                  )}

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-xs">
                    {g.model}
                  </div>

                  {/* Шильдик "осталось N дней" — только в корзине */}
                  {view === 'trash' && left !== null && (
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur ${
                      left <= 3 ? 'bg-red-500/80 text-white' : 'bg-black/70 text-white/80'
                    }`}>
                      {left === 0 ? 'удаляется…' : left === 1 ? '1 день' : `${left} дн.`}
                    </div>
                  )}

                  {/* Hover-actions */}
                  {!isErasing && (
                    <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent pt-8">
                      {view === 'active' ? (
                        <button
                          onClick={() => softDelete(g)}
                          className="flex-1 px-2 py-1.5 rounded-md bg-black/70 hover:bg-red-500 text-white text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5"
                          title="Удалить (в корзину)"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          </svg>
                          В корзину
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => restore(g)}
                            className="flex-1 px-2 py-1.5 rounded-md bg-[#d4ff00] hover:bg-[#e5ff33] text-black text-xs font-bold transition flex items-center justify-center gap-1.5"
                            title="Восстановить"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                            </svg>
                            Восстановить
                          </button>
                          <button
                            onClick={() => purge(g)}
                            className="flex-1 px-2 py-1.5 rounded-md bg-black/70 hover:bg-red-600 text-white text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5"
                            title="Удалить навсегда"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Навсегда
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 text-sm space-y-1">
                  <p className="line-clamp-2 text-white/80">{g.prompt}</p>
                  <p className="text-xs text-white/40">
                    {view === 'trash' && g.deletedAt
                      ? `Удалено: ${new Date(g.deletedAt).toLocaleString('ru-RU')}`
                      : new Date(g.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => load(false)}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm transition disabled:opacity-50"
            >
              {loading ? 'Загружаем...' : 'Показать ещё'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
