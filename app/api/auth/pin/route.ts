import { namlahFetch, jsonWithRelay, sessionCookieFrom } from '@/lib/namlah';
import { rateLimit, clientIp, sameOrigin } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cookieOf(request: Request) {
  return sessionCookieFrom(request.headers.get('cookie'));
}

export async function GET(request: Request) {
  const result = await namlahFetch('/api/auth/pin', { cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const rl = rateLimit(`pin:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) return Response.json({ ok: false, error: 'Terlalu sering. Coba lagi nanti.' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const result = await namlahFetch('/api/auth/pin', { method: 'POST', body, cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const rl = rateLimit(`pin:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) return Response.json({ ok: false, error: 'Terlalu sering. Coba lagi nanti.' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const result = await namlahFetch('/api/auth/pin', { method: 'DELETE', body, cookie: cookieOf(request), timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
