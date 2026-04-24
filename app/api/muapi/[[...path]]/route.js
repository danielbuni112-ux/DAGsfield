// Server-side proxy for muapi.ai
// ─────────────────────────────────────────────────────────────────────────────
// Forwards all client requests from /api/muapi/* to https://api.muapi.ai/*
// and injects the MUAPI_API_KEY from Vercel environment variables as the
// `x-api-key` header. Client-supplied auth headers are stripped so the secret
// key never touches the browser.
//
// Env vars required:
//   MUAPI_API_KEY  — your private muapi.ai API key (set in Vercel → Settings
//                    → Environment Variables, Production + Preview + Dev).
//
// Example request:
//   Client: fetch('/api/muapi/api/v1/predictions', { method: 'POST', body })
//   Server fetches: https://api.muapi.ai/api/v1/predictions (with x-api-key)
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Long enough to cover muapi.ai's slow first-response on some models.
export const maxDuration = 60;

const UPSTREAM = 'https://api.muapi.ai';

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

async function handler(request, { params }) {
  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) {
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

  const headers = new Headers();
  for (const [name, value] of request.headers.entries()) {
    if (!STRIPPED_REQUEST_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  }
  headers.set('x-api-key', apiKey);

  const method = request.method;
  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    // arrayBuffer() handles JSON, multipart, binary — all in one.
    body = await request.arrayBuffer();
  }

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'follow',
    });
  } catch (error) {
    console.error('muapi proxy fetch failed:', upstreamUrl, error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Upstream fetch failed' }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }

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
