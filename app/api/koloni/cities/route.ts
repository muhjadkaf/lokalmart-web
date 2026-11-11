import { namlahFetch, jsonWithRelay } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await namlahFetch('/api/koloni/cities', { timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
