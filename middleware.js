import { NextResponse } from 'next/server';

// Fallback proxy for legacy /api/v1/* paths that still hit the app directly.
// New client code goes through /api/muapi/[[...path]]/route.js which injects
// the server-managed MUAPI_API_KEY from env. This middleware does the same
// injection for any remaining /api/v1 calls so the client never needs to
// know the key.
export function middleware(request) {
    const url = request.nextUrl;

    if (url.pathname.startsWith('/api/v1')) {
        const targetUrl = new URL(url.pathname + url.search, 'https://api.muapi.ai');
        const headers = new Headers(request.headers);
        if (process.env.MUAPI_API_KEY) {
            headers.set('x-api-key', process.env.MUAPI_API_KEY);
        }
        return NextResponse.rewrite(targetUrl, {
            request: { headers }
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/v1/:path*'
    ],
};
