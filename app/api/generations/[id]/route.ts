// /api/generations/[id]
//
// DELETE — переводит генерацию в корзину (soft-delete, deleted_at = NOW()).
// PATCH  — body: { action: 'restore' | 'purge' }
//   restore — возвращает в активные (deleted_at = NULL)
//   purge   — физически удаляет запись (только если уже была в корзине)
//
// Все операции скоупятся по userId — один пользователь не может тронуть
// чужую генерацию. Если попытка — отвечаем 404, чтобы не утекал список ID.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generation } from '@/lib/db/schema';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  if (!session.user.emailVerified) return null;
  return session;
}

type Ctx = { params: Promise<{ id: string }> };

// ─── DELETE: переместить в корзину ──────────────────────────────────────────
export async function DELETE(request: Request, ctx: Ctx) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;

  const result = await db
    .update(generation)
    .set({ deletedAt: sql`NOW()` })
    .where(and(
      eq(generation.id, id),
      eq(generation.userId, session.user.id),
      isNull(generation.deletedAt),     // идемпотентность: уже удалённое не трогаем
    ))
    .returning({ id: generation.id, deletedAt: generation.deletedAt });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: result[0].id, deletedAt: result[0].deletedAt });
}

// ─── PATCH: restore | purge ──────────────────────────────────────────────────
const patchSchema = z.object({
  action: z.enum(['restore', 'purge']),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }

  if (parsed.data.action === 'restore') {
    // Восстановить из корзины — только если запись там лежит.
    const result = await db
      .update(generation)
      .set({ deletedAt: null })
      .where(and(
        eq(generation.id, id),
        eq(generation.userId, session.user.id),
        isNotNull(generation.deletedAt),
      ))
      .returning({ id: generation.id });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found in trash' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, action: 'restore', id: result[0].id });
  }

  // purge — физическое удаление, только из корзины
  const result = await db
    .delete(generation)
    .where(and(
      eq(generation.id, id),
      eq(generation.userId, session.user.id),
      isNotNull(generation.deletedAt),
    ))
    .returning({ id: generation.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found in trash' }, { status: 404 });
  }

  // NOTE: файл на fal.ai CDN не трогаем — fal сам чистит свои объекты через
  // 24-72 часа. Если в будущем будем зеркалить в свой Object Storage —
  // здесь же добавляем удаление из бакета.

  return NextResponse.json({ ok: true, action: 'purge', id: result[0].id });
}
