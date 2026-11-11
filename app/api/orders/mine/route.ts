import { namlahFetch, jsonWithRelay, sessionCookieFrom } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookie = sessionCookieFrom(request.headers.get('cookie'));
  const result = await namlahFetch('/api/orders/mine', { cookie, timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
