import { NextRequest, NextResponse } from 'next/server';
import { runCheckout, type CheckoutInput } from '@/lib/checkout';
import { rateLimit, clientIp, sameOrigin } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  }
  const ip = clientIp(request);
  const rl = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: `Terlalu sering checkout. Coba lagi ${rl.retryAfterSeconds}s lagi.` }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: 'Body harus JSON.' }, { status: 400 }); }
  const result = await runCheckout(body as CheckoutInput);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
