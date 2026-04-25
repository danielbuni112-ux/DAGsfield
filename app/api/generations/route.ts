// POST /api/generations — save a generation for the signed-in user.
// GET  /api/generations?cursor=<id>&kind=image&limit=24&view=active|trash
//
// view=active (default) — только не удалённые (deleted_at IS NULL)
// view=trash            — только в корзине (deleted_at IS NOT NULL и не старше 30 дней)
//
// Soft-delete и восстановление сделаны в отдельном route handler:
//   /api/generations/[id]
//     DELETE  — переводит в корзину (deleted_at = NOW())
//     PATCH   — body { action: 'restore' | 'purge' }

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generation, TRASH_RETENTION_DAYS } from '@/lib/db/schema';
import { and, desc, eq, isNull, isNotNull, lt, gt, sql } from 'drizzle-orm';
import { z } from 'zod';

const postSchema = z.object({
  kind: z.enum(['image', 'video', 'i2i', 'i2v', 'lipsync']),
  model: z.string().min(1).max(128),
  prompt: z.string().min(1).max(4000),
  params: z.record(z.any()).default({}),
  resultUrl: z.string().url().max(2000),
  thumbnailUrl: z.string().url().max(2000).optional(),
  falRequestId: z.string().max(128).optional(),
});

async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  if (!session.user.emailVerified) return null;
  return session;
}

export async function POST(request: Request) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }

  const id = crypto.randomUUID();
  await db.insert(generation).values({
    id,
    userId: session.user.id,
    kind: parsed.data.kind,
    model: parsed.data.model,
    prompt: parsed.data.prompt,
    params: parsed.data.params,
    resultUrl: parsed.data.resultUrl,
    thumbnailUrl: parsed.data.thumbnailUrl,
    falRequestId: parsed.data.falRequestId,
  });

  return NextResponse.json({ id });
}

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 24), 100);
  const kindFilter = url.searchParams.get('kind');
  const cursor = url.searchParams.get('cursor');
  const view = url.searchParams.get('view') === 'trash' ? 'trash' : 'active';

  const where = [eq(generation.userId, session.user.id)];
  if (kindFilter) where.push(eq(generation.kind, kindFilter));

  if (view === 'trash') {
    // В корзине: показываем только то, что ещё не просрочено (cron уберёт старое,
    // но между прогонами могут болтаться — фильтруем заодно на чтении).
    where.push(isNotNull(generation.deletedAt));
    // make_interval — параметризированный интервал, drizzle прокидывает
    // TRASH_RETENTION_DAYS как numeric param без конкатенации в SQL.
    where.push(gt(
      generation.deletedAt,
      sql`NOW() - make_interval(days => ${TRASH_RETENTION_DAYS})`,
    ));
  } else {
    where.push(isNull(generation.deletedAt));
  }

  if (cursor) {
    const cursorRow = await db.query.generation.findFirst({
      where: and(eq(generation.id, cursor), eq(generation.userId, session.user.id)),
    });
    if (cursorRow) {
      // В trash сортируем по deletedAt, в active — по createdAt (как было).
      if (view === 'trash' && cursorRow.deletedAt) {
        where.push(lt(generation.deletedAt, cursorRow.deletedAt));
      } else {
        where.push(lt(generation.createdAt, cursorRow.createdAt));
      }
    }
  }

  const orderCol = view === 'trash' ? generation.deletedAt : generation.createdAt;
  const rows = await db.query.generation.findMany({
    where: and(...where),
    orderBy: [desc(orderCol)],
    limit: limit + 1,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Для trash добавляем поле expiresAt — UI рисует обратный отсчёт "осталось N дней".
  const enriched = view === 'trash'
    ? items.map((it) => ({
        ...it,
        expiresAt: it.deletedAt
          ? new Date(it.deletedAt.getTime() + TRASH_RETENTION_DAYS * 86_400_000).toISOString()
          : null,
      }))
    : items;

  return NextResponse.json({ items: enriched, nextCursor, view });
}
