// Server-side proxy for muapi.ai
// ─────────────────────────────────────────────────────────────────────────────
// Forwards all client requests from /api/muapi/* to https://api.muapi.ai/*
// and injects the MUAPI_API_KEY from env as the `x-api-key` header.
// Client-supplied auth headers are stripped so the secret key never touches
// the browser.
//
// METRICS: logs a structured JSON line per request with provider, path,
// method, status, latency, and concurrency estimate. Tail logs with:
//   pm2 logs plugtown --lines 100 | grep PROXY_METRIC
// Aggregate with scripts/analyze-metrics.sh (see repo root).
//
// Env vars required:
//   MUAPI_API_KEY  — your private muapi.ai API key (set in .env.production)
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Long enough to cover muapi.ai's slow first-response on some models.
export const maxDuration = 60;

const UPSTREAM = 'https://api.muapi.ai';
const PROVIDER = 'muapi';

// Headers that must never be forwarded upstream — either Node/fetch manages
// them itself, or they'd leak client state that the proxy intentionally hides.
const STRIPPED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'x-api-key',
  'authorization',
  'cookie',
]);

// Response headers that can break when re-emitted (encoding was already
// decoded by fetch; connection is hop-by-hop).
const STRIPPED_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'transfer-encoding',
  'connection',
]);

// ─── In-process concurrency counter ──────────────────────────────────────────
// Tracks currently in-flight requests for this Node worker. Useful as a
// proxy for "how close are we to the provider's concurrency limit?".
// Note: this is per-worker, not cluster-wide. For PM2 in fork mode (1 worker)
// the number is exact. For cluster mode, each worker tracks its own count.
let inflight = 0;

// ─── Category extraction — classifies the muapi path for metric grouping ─────
// Examples:
//   /api/v1/predictions       → "predictions:submit"
//   /api/v1/predictions/xyz/result → "predictions:poll"
//   /api/v1/account/balance   → "account:balance"
//   /api/v1/upload_file       → "upload"
//   /workflow/create          → "workflow:create"
//   /agents/user/agents       → "agents:list"
function categorize(pathname) {
  if (!pathname) return 'root';
  if (pathname.includes('/predictions') && pathname.includes('/result')) return 'predictions:poll';
  if (pathname.includes('/predictions')) return 'predictions:submit';
  if (pathname.includes('/account/balance')) return 'account:balance';
  if (pathname.includes('/upload')) return 'upload';
  if (pathname.startsWith('workflow/')) {
    if (pathname.includes('/api-execute')) return 'workflow:execute';
    if (pathname.includes('/run/')) return 'workflow:poll';
    if (pathname.includes('/create')) return 'workflow:create';
    return 'workflow:other';
  }
  if (pathname.startsWith('agents/')) return 'agents:' + (pathname.split('/')[1] || 'other');
  return pathname.split('/')[0] || 'other';
}

// ─── Structured metric logger ────────────────────────────────────────────────
function logMetric(fields) {
  // Single line of JSON prefixed with PROXY_METRIC so grep can find it.
  // PM2 writes stdout to /root/.pm2/logs/plugtown-out.log
  console.log('PROXY_METRIC ' + JSON.stringify(fields));
}

async function handler(request, { params }) {
  const reqStart = Date.now();
  const apiKey = process.env.MUAPI_API_KEY;

  if (!apiKey) {
    logMetric({
      t: new Date().toISOString(),
      provider: PROVIDER,
      status: 500,
      error: 'no_api_key',
      latency_ms: 0,
      inflight,
    });
    return new Response(
      JSON.stringify({ error: 'MUAPI_API_KEY not configured on server' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Next.js 15 passes params as a Promise in App Router.
  const resolved = await params;
  const segments = resolved?.path ?? [];
  const pathname = Array.isArray(segments) ? segments.join('/') : '';
  const { search } = new URL(request.url);
  const upstreamUrl = `${UPSTREAM}/${pathname}${search}`;
  const category = categorize(pathname);
  const method = request.method;

  const headers = new Headers();
  for (const [name, value] of request.headers.entries()) {
    if (!STRIPPED_REQUEST_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  }
  headers.set('x-api-key', apiKey);

  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  inflight++;
  const upstreamStart = Date.now();
  let upstream;
  let upstreamError = null;

  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'follow',
    });
  } catch (error) {
    upstreamError = error?.message || 'fetch_failed';
    inflight--;
    const latency_ms = Date.now() - reqStart;
    logMetric({
      t: new Date().toISOString(),
      provider: PROVIDER,
      category,
      method,
      status: 502,
      latency_ms,
      upstream_ms: Date.now() - upstreamStart,
      error: upstreamError,
      inflight,
    });
    return new Response(
      JSON.stringify({ error: upstreamError }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }

  const upstream_ms = Date.now() - upstreamStart;
  inflight--;
  const latency_ms = Date.now() - reqStart;

  // Log BEFORE streaming body back — status is known, latency is known,
  // body size we don't need precisely.
  logMetric({
    t: new Date().toISOString(),
    provider: PROVIDER,
    category,
    method,
    status: upstream.status,
    latency_ms,
    upstream_ms,
    rate_limited: upstream.status === 429,
    inflight,
  });

  const responseHeaders = new Headers();
  for (const [name, value] of upstream.headers.entries()) {
    if (!STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase())) {
      responseHeaders.set(name, value);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
