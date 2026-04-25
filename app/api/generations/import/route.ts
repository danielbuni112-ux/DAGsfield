// POST /api/generations/import — batch-insert old localStorage history on
// first login after auth rollout. Tolerates messy legacy shapes: different
// key names ("result_url" vs "resultUrl"), missing fields, unknown models.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generation } from '@/lib/db/schema';
import { z } from 'zod';

const legacyItem = z.object({
  kind: z.string().optional(),
  type: z.string().optional(),           // legacy name for "kind"
  model: z.string().optional(),
  prompt: z.string().optional(),
  params: z.record(z.any()).optional(),
  aspect_ratio: z.string().optional(),   // legacy flat fields
  resolution: z.string().optional(),
  resultUrl: z.string().optional(),
  result_url: z.string().optional(),     // legacy snake_case
  url: z.string().optional(),            // even older
  thumbnailUrl: z.string().optional(),
  thumbnail_url: z.string().optional(),
  falRequestId: z.string().optional(),
  fal_request_id: z.string().optional(),
  createdAt: z.union([z.string(), z.number()]).optional(),
  created_at: z.union([z.string(), z.number()]).optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
}).passthrough();

const bodySchema = z.object({
  items: z.array(legacyItem).max(500),
});

const ALLOWED_KINDS = new Set(['image', 'video', 'i2i', 'i2v', 'lipsync']);

function pickString(...v: (string | undefined)[]) {
  for (const x of v) if (typeof x === 'string' && x.length > 0) return x;
  return undefined;
}

function coerceDate(v: unknown): Date {
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
  }

  const toInsert = [];
  for (const raw of parsed.data.items) {
    const resultUrl = pickString(raw.resultUrl, raw.result_url, raw.url);
    if (!resultUrl) continue;  // skip items without a result
    let kind = pickString(raw.kind, raw.type) ?? 'image';
    if (!ALLOWED_KINDS.has(kind)) kind = 'image';

    const params = {
      ...(raw.params ?? {}),
      ...(raw.aspect_ratio ? { aspect_ratio: raw.aspect_ratio } : {}),
      ...(raw.resolution ? { resolution: raw.resolution } : {}),
    };

    toInsert.push({
      id: crypto.randomUUID(),
      userId: session.user.id,
      kind,
      model: pickString(raw.model) ?? 'unknown',
      prompt: pickString(raw.prompt) ?? '',
      params,
      resultUrl,
      thumbnailUrl: pickString(raw.thumbnailUrl, raw.thumbnail_url) ?? null,
      falRequestId: pickString(raw.falRequestId, raw.fal_request_id) ?? null,
      createdAt: coerceDate(raw.createdAt ?? raw.created_at ?? raw.timestamp),
    });
  }

  if (toInsert.length === 0) return NextResponse.json({ imported: 0 });

  await db.insert(generation).values(toInsert).onConflictDoNothing();
  return NextResponse.json({ imported: toInsert.length });
}
