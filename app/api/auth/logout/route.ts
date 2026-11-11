import { namlahFetch, jsonWithRelay, sessionCookieFrom } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookie = sessionCookieFrom(request.headers.get('cookie'));
  const result = await namlahFetch('/api/auth/logout', { method: 'POST', cookie, timeoutMs: 15_000 });
  // Logout: response Namlah membersihkan cookie-nya; kita bersihkan juga milik kita.
  const response = jsonWithRelay(result);
  if (cookie) {
    response.headers.append('Set-Cookie', `namlah_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
  }
  return response;
}
