import { namlahFetch } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let namlah: Record<string, unknown> = { reachable: false };
  try {
    // /api/koloni/cities bersifat publik → indikator reachability tanpa sesi.
    const result = await namlahFetch<Record<string, unknown>>('/api/koloni/cities', { timeoutMs: 15_000 });
    namlah = { reachable: result.status === 200, status: result.status };
  } catch (error) {
    namlah = { reachable: false, error: error instanceof Error ? error.message : 'unreachable' };
  }
  return Response.json({ ok: true, service: 'lokalmart-web', namlah, time: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
}
