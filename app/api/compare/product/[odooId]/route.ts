import { namlahFetch, jsonWithRelay } from '@/lib/namlah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ odooId: string }> }) {
  const { odooId } = await params;
  const id = Number(odooId);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ ok: false, error: 'odooId tidak valid.' }, { status: 400 });
  }
  const result = await namlahFetch(`/api/compare/product/${id}`, { timeoutMs: 20_000 });
  return jsonWithRelay(result);
}
