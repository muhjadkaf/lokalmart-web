import { NextResponse } from 'next/server';
import { PRODUK_PROMO, KATEGORI, PROMO_PERIODE, diskonPersen } from '@/lib/seed-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    periode: PROMO_PERIODE,
    kategori: KATEGORI,
    produk: PRODUK_PROMO.map((p) => ({
      ...p,
      diskonPersen: diskonPersen(p),
    })),
  });
}
