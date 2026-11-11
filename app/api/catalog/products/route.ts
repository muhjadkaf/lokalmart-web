import { namlahFetch, jsonWithRelay } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PARAMS = new Set(['scope', 'koloni', 'offset', 'limit', 'category', 'q']);

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of incoming) {
    if (ALLOWED_PARAMS.has(key)) params.set(key, value);
  }
  const result = await namlahFetch(`/api/catalog/products?${params.toString()}`, { timeoutMs: 30_000 });
  return jsonWithRelay(result);
}
