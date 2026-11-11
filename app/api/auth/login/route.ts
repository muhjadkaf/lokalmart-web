import { namlahFetch, jsonWithRelay } from '@/lib/namlah';
import { rateLimit, clientIp, sameOrigin } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  const ip = clientIp(request);
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) return Response.json({ ok: false, error: 'Terlalu banyak percobaan login. Coba lagi sebentar.', retryAfterSeconds: rl.retryAfterSeconds }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const result = await namlahFetch('/api/auth/login', { method: 'POST', body, timeoutMs: 30_000 });
  return jsonWithRelay(result);
}
