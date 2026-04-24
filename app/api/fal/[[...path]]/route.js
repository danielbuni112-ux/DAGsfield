// Server-side proxy for fal.ai
// ─────────────────────────────────────────────────────────────────────────────
// Forwards all client requests from /api/fal/<fal-endpoint> to the fal.ai
// queue API. Uses official @fal-ai/serverless-client SDK which handles
// submit + polling + result retrieval internally.
//
// Client sends: POST /api/fal/fal-ai/nano-banana  { prompt: "..." }
// Server runs:  fal.subscribe("fal-ai/nano-banana", { input: { prompt } })
// Server returns: { data: { images: [...] }, requestId: "..." }
//
// Env vars required:
//   FAL_KEY  — format "<key_id>:<key_secret>" from https://fal.ai/dashboard/keys
// ─────────────────────────────────────────────────────────────────────────────

import * as fal from '@fal-ai/serverless-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Long timeout — video generation can take 2-3 minutes
export const maxDuration = 300;

// Configure the SDK once per Node process.
// process.env is read at module load, which is fine for Next.js.
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

// ─── In-flight counter for concurrency monitoring ────────────────────────────
let inflight = 0;

function logMetric(fields) {
  console.log('PROXY_METRIC ' + JSON.stringify(fields));
}

// ─── Special endpoints ───────────────────────────────────────────────────────
// fal.ai does not expose "account balance" via their public API, but we still
// return something so the UI doesn't break. Admins check balance at
// https://fal.ai/dashboard/billing directly.
async function handleBalance() {
  return Response.json({ balance: null, message: 'Check balance at fal.ai dashboard' });
}

// ─── Main handler ────────────────────────────────────────────────────────────
async function handler(request, { params }) {
  const start = Date.now();

  if (!process.env.FAL_KEY) {
    logMetric({
      t: new Date().toISOString(),
      provider: 'fal',
      status: 500,
      error: 'no_api_key',
      latency_ms: 0,
    });
    return Response.json(
      { error: 'FAL_KEY not configured on server. Set it in .env.production.' },
      { status: 500 }
    );
  }

  const resolved = await params;
  const segments = resolved?.path ?? [];
  const endpoint = Array.isArray(segments) ? segments.join('/') : '';

  // Route special endpoints
  if (endpoint === 'balance' || endpoint === 'account/balance') {
    return handleBalance();
  }

  // Everything else is a generation request through fal.ai queue
  let body = {};
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (err) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  inflight++;

  // Log the request body (keys and value shape — prompt is truncated to avoid spam)
  const bodyPreview = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === 'prompt' && typeof v === 'string') {
      bodyPreview[k] = v.length > 80 ? v.slice(0, 80) + '…' : v;
    } else if (typeof v === 'object' && v !== null) {
      bodyPreview[k] = JSON.stringify(v).slice(0, 120);
    } else {
      bodyPreview[k] = v;
    }
  }
  logMetric({
    t: new Date().toISOString(),
    provider: 'fal',
    endpoint,
    event: 'request_received',
    input: bodyPreview,
  });

  try {
    // fal.subscribe does submit + polling + result retrieval
    // If it fails (API error, timeout, etc), throws with .status and .body
    const result = await fal.subscribe(endpoint, {
      input: body,
      logs: false,
    });

    inflight--;
    const latency = Date.now() - start;

    // Log output image dimensions if present — helps debug resolution issues
    const firstImage = result?.images?.[0] || result?.image;
    const outputInfo = firstImage ? {
      width: firstImage.width || null,
      height: firstImage.height || null,
      file_size: firstImage.file_size || null,
      url_host: firstImage.url ? new URL(firstImage.url).host : null,
    } : null;

    logMetric({
      t: new Date().toISOString(),
      provider: 'fal',
      endpoint,
      status: 200,
      latency_ms: latency,
      inflight,
      output: outputInfo,
    });

    return Response.json({
      data: result,
      requestId: result?.requestId || null,
    });
  } catch (error) {
    inflight--;
    const latency = Date.now() - start;

    // fal SDK throws different error types
    const status = error?.status || (error?.message?.includes('timeout') ? 504 : 500);
    const message = error?.message || 'Unknown fal.ai error';

    logMetric({
      t: new Date().toISOString(),
      provider: 'fal',
      endpoint,
      status,
      latency_ms: latency,
      error: message,
      inflight,
    });

    return Response.json(
      {
        error: message,
        details: error?.body || null,
      },
      { status }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
