import { namlahFetch, jsonWithRelay, sessionCookieFrom } from '@/lib/namlah';
import { rateLimit, clientIp, sameOrigin } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const rl = rateLimit(`changepw:${clientIp(request)}`, 5, 60_000);
  if (!rl.ok) return Response.json({ ok: false, error: 'Terlalu sering. Coba lagi nanti.' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const cookie = sessionCookieFrom(request.headers.get('cookie'));
  const result = await namlahFetch('/api/auth/change-password', { method: 'POST', body, cookie, timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
