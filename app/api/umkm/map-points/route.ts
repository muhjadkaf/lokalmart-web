import { namlahFetch, jsonWithRelay } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await namlahFetch('/api/umkm/map-points', { timeoutMs: 25_000 });
  return jsonWithRelay(result);
}
