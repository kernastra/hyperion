import { NextRequest, NextResponse } from 'next/server';

// Constant-time string comparison. Runs in the Edge runtime, where
// node:crypto.timingSafeEqual isn't available, so we compare char codes with
// an XOR accumulator instead of short-circuiting on the first mismatch.
function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Protects /api/* when HYPERION_AUTH_TOKEN is set. Sean runs this behind
// Caddy + Tailscale, so auth is optional: if the env var is unset, requests
// pass through unchanged (local UX is unaffected). To use it, the reverse
// proxy must inject a matching `Authorization: Bearer <token>` (or
// `x-hyperion-token`) header on requests it forwards.
export function middleware(request: NextRequest) {
  const token = process.env.HYPERION_AUTH_TOKEN;

  if (!token) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  const headerToken = bearerToken || request.headers.get('x-hyperion-token');

  if (!headerToken || !timingSafeEqualString(headerToken, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
