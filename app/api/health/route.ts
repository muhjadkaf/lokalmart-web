import { NextResponse } from 'next/server';
import { odooBridgeStatus } from '@/lib/odooBridge';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'lokalmart-web', odoo: odooBridgeStatus(), time: new Date().toISOString() });
}
