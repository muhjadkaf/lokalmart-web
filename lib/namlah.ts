/**
 * Proxy server-side ke backend Namlah (namlah-lokalmart.vercel.app).
 * APK Flutter memanggil API ini langsung; webapp lewat route /api/* di domain ini
 * agar cookie sesi (httpOnly) tidak harus menjadi third-party cookie.
 * JANGAN panggil dari client component — hanya dari Route Handlers.
 */

export const NAMLAH_BASE = (process.env.NAMLAH_API_BASE || 'https://namlah-lokalmart.vercel.app').replace(/\/+$/, '');

export type ProxyResult<T = unknown> = {
  status: number;
  body: T;
  setCookies: string[];
};

/** Panggil backend Namlah dengan mem-forward cookie sesi dari request browser. */
export async function namlahFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; cookie?: string | null; timeoutMs?: number } = {},
): Promise<ProxyResult<T>> {
  const { method = 'GET', body, cookie, timeoutMs = 30_000 } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${NAMLAH_BASE}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(cookie ? { cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await response.text();
    let parsed: unknown = {};
    if (text) {
      try { parsed = JSON.parse(text); } catch { parsed = { ok: false, error: 'Respons tidak valid dari server.' }; }
    }
    const setCookies = typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie') as string] : []);
    return { status: response.status, body: parsed as T, setCookies };
  } finally {
    clearTimeout(timer);
  }
}

/** Nama cookie sesi — harus sama dengan backend Namlah. */
export const SESSION_COOKIE = 'namlah_session';

/** Ambil nilai cookie sesi dari header Cookie milik browser. */
export function sessionCookieFrom(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === SESSION_COOKIE) {
      return part.slice(eq + 1).trim();
    }
  }
  return undefined;
}

/** Teruskan cookie sesi dari respons Namlah ke respons kita (re-host ke domain sendiri). */
export function relaySessionCookies(setCookies: string[]): Array<{ name: string; value: string; options: Record<string, unknown> }> {
  const out: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  for (const entry of setCookies) {
    const [pair, ...attrs] = entry.split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    if (name !== SESSION_COOKIE) continue;
    const value = pair.slice(eq + 1).trim();
    const options: Record<string, unknown> = {
      path: '/',
      httpOnly: true,
      sameSite: 'lax' as const,
    };
    for (const attr of attrs) {
      const [k, v] = attr.split('=', 2).map((s) => s.trim());
      const key = k.toLowerCase();
      if (key === 'max-age' && v) options.maxAge = Number(v);
      else if (key === 'expires' && v) options.expires = new Date(v);
      else if (key === 'samesite' && v) options.sameSite = v.toLowerCase();
      else if (key === 'secure') options.secure = true;
      else if (key === 'httponly') options.httpOnly = true;
      else if (key === 'path' && v) options.path = v;
    }
    out.push({ name, value, options });
  }
  return out;
}

/** JSON response helper dengan cookie relay (bila ada). */
export function jsonWithRelay<T>(result: ProxyResult<T>, relay = true): Response {
  const response = Response.json(result.body, {
    status: result.status,
    headers: { 'Cache-Control': 'no-store' },
  });
  if (relay && result.setCookies.length) {
    for (const cookie of relaySessionCookies(result.setCookies)) {
      const attrs = [
        `${cookie.name}=${cookie.value}`,
        `Path=${cookie.options.path ?? '/'}`,
        'HttpOnly',
        `SameSite=${String(cookie.options.sameSite ?? 'Lax')}`,
        'Secure',
        cookie.options.maxAge != null ? `Max-Age=${cookie.options.maxAge}` : null,
        cookie.options.expires ? `Expires=${(cookie.options.expires as Date).toUTCString()}` : null,
      ].filter(Boolean).join('; ');
      response.headers.append('Set-Cookie', attrs);
    }
  }
  return response;
}
