'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import DataImage from '@/components/DataImage';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { rupiah, type CatalogProduct, type CompareRow } from '@/lib/types';

export default function ProdukDetailPage({ params }: { params: Promise<{ odooId: string }> }) {
  const { odooId } = use(params);
  const id = Number(odooId);
  const router = useRouter();
  const { add } = useCart();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [compare, setCompare] = useState<CompareRow[] | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareLoading, setCompareLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`lokalmart-product-${id}`);
      if (raw) setProduct(JSON.parse(raw) as CatalogProduct);
    } catch {
      setProduct(null);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCompareLoading(true);
      setCompareError(null);
      try {
        const data = await apiFetch<{ ok?: boolean; matches?: Array<Record<string, unknown>>; error?: string }>(`/api/compare/product/${id}`);
        if (data.ok !== true) throw new Error(data.error || 'Gagal memuat perbandingan.');
        const rows = Array.isArray(data.matches) ? data.matches : [];
        if (!cancelled) setCompare(rows.map((r) => ({
          odooId: Number(r.odooId ?? 0),
          name: String(r.name ?? 'Produk'),
          price: Number(r.price ?? 0),
          storeName: String(r.storeName ?? 'Toko'),
          storeKind: String(r.storeKind ?? 'lokalmart'),
          inStock: r.inStock === true,
          matchScore: Number(r.sameNameScore ?? 0),
        })));
      } catch (error) {
        if (!cancelled) setCompareError(apiErrorMessage(error instanceof Error ? { error: error.message } : null, 'Gagal memuat perbandingan.'));
      } finally {
        if (!cancelled) setCompareLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fallback: data produk dari baris compare teratas (bila cache kosong)
  const fallbackRow = compare?.find((r) => r.odooId === id) ?? compare?.[0] ?? null;
  const shownProduct = product ?? (fallbackRow ? {
    odooId: fallbackRow.odooId,
    name: fallbackRow.name,
    code: '',
    price: fallbackRow.price,
    formattedPrice: rupiah(fallbackRow.price),
    category: 'Produk LokalMart',
    uom: 'Pc',
    stock: fallbackRow.inStock ? undefined : 0,
    image: null,
    storeName: fallbackRow.storeName,
  } as CatalogProduct : null);

  if (!shownProduct) {
    return (
      <div className="empty">
        Produk tidak ditemukan di perangkat ini.<br />Buka dari Katalog untuk melihat detailnya.
        <div style={{ marginTop: 14 }}><Link className="btn btn-gold btn-block" href="/katalog">Buka Katalog</Link></div>
      </div>
    );
  }

  const sortedCompare = [...(compare ?? [])].sort((a, b) => a.price - b.price);

  return (
    <div className="section" style={{ paddingBottom: 30 }}>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: 190, background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DataImage image={shownProduct.image ?? null} name={shownProduct.name} />
        </div>
        <div className="card-pad">
          <div className="eyebrow">LOKALMART</div>
          <h1 className="page-title" style={{ fontSize: 20, margin: '6px 0 4px' }}>{shownProduct.name}</h1>
          <div className="price" style={{ fontSize: 24 }}>{shownProduct.formattedPrice || rupiah(shownProduct.price)}</div>
          <div className="unit">per {shownProduct.uom} · {shownProduct.category} · {shownProduct.storeName}</div>
          <button className="btn btn-gold btn-block" style={{ marginTop: 12 }} onClick={() => { add(shownProduct); router.push('/keranjang'); }}>
            + Masuk Keranjang
          </button>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6 }}>BANDINGKAN HARGA</div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, marginBottom: 10 }}>Produk serupa di toko lain</h2>

      {compareLoading && [1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
      {compareError && <div className="msg msg-error">{compareError}</div>}
      {!compareLoading && !compareError && sortedCompare.length === 0 && <div className="msg msg-info">Belum ada toko lain dengan produk serupa.</div>}
      {sortedCompare.map((row, idx) => (
        <div key={idx} className="card card-pad" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{row.storeName}</div>
            <div className="unit">{row.storeKind === 'lokalmart' ? 'LokalMart Official' : 'Koloni UMKM'}{row.inStock ? '' : ' · stok habis'}</div>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: row.price <= shownProduct.price ? 'var(--green)' : 'var(--ink)' }}>{rupiah(row.price)}</div>
        </div>
      ))}
    </div>
  );
}
