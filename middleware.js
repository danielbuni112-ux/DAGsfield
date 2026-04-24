import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Middleware is effectively a no-op after migration to fal.ai.
// All AI requests now go through /api/fal/[[...path]]/route.js which handles
// auth via the official fal SDK.
//
// Legacy muapi fallback for /api/v1/* has been removed.
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(request) {
  return NextResponse.next();
}

// Empty matcher = middleware runs on no paths = effectively disabled.
// Kept as a stub in case we want to add request logging / rate limiting later.
export const config = {
  matcher: [],
};
