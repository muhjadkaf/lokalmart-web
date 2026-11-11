import { namlahFetch } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let namlah: Record<string, unknown> = { reachable: false };
  try {
    const result = await namlahFetch<Record<string, unknown>>('/api/health', { timeoutMs: 15_000 });
    namlah = { reachable: true, status: result.status, body: result.body };
  } catch (error) {
    namlah = { reachable: false, error: error instanceof Error ? error.message : 'unreachable' };
  }
  return Response.json({ ok: true, service: 'lokalmart-web', namlah, time: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
}
