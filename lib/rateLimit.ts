/** Rate limiter sederhana in-memory (per instance serverless). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0]?.trim() || 'unknown';
}

/** Tolak request lintas-origin (CSRF sederhana untuk POST tanpa cookie). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser client / same-origin fetch tanpa header
  try {
    const host = new URL(origin).host;
    return host === request.headers.get('host');
  } catch {
    return false;
  }
}
