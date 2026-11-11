import { namlahFetch, jsonWithRelay, sessionCookieFrom } from '@/lib/namlah';
import { sameOrigin } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cookieOf(request: Request) {
  return sessionCookieFrom(request.headers.get('cookie'));
}

export async function GET(request: Request) {
  const result = await namlahFetch('/api/auth/sapaan', { cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const result = await namlahFetch('/api/auth/sapaan', { method: 'POST', body, cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const result = await namlahFetch('/api/auth/sapaan', { method: 'DELETE', cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
