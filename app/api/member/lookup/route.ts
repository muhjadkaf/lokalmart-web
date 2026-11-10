import { NextRequest, NextResponse } from 'next/server';
import { lookupMemberByPhone } from '@/lib/member';
import { rateLimit, clientIp, sameOrigin } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Origin ditolak.' }, { status: 403 });
  }
  const ip = clientIp(request);
  const rl = rateLimit(`member:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: `Terlalu sering. Coba lagi ${rl.retryAfterSeconds}s lagi.` }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: 'Body harus JSON.' }, { status: 400 }); }
  const phone = String((body as { phone?: unknown })?.phone || '').trim();
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ ok: false, error: 'Nomor WA minimal 9 digit.' }, { status: 400 });
  }
  const result = await lookupMemberByPhone(phone);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
