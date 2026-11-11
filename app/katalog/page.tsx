'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiErrorMessage } from '@/lib/apiFetch';
import { fetchCatalogPage, loadSavedCity } from '@/lib/catalogClient';
import type { CatalogCategory, CatalogProduct, CityKoloni } from '@/lib/types';

type Data = { products: CatalogProduct[]; categories: CatalogCategory[]; total: number; hasMore: boolean };

export default function KatalogPage() {
  const [city] = useState<CityKoloni | null>(() => loadSavedCity());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [data, setData] = useState<Data>({ products: [], categories: [], total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts: { q: string; cat: string | null; offset: number; append: boolean }) => {
    if (opts.append) setLoadingMore(true);
    else {
      setLoading(true);
      setError(null);
    }
    try {
      const page = await fetchCatalogPage({
        offset: opts.offset,
        limit: 24,
        category: opts.cat ?? undefined,
        q: opts.q || undefined,
        city,
      });
      setData((prev) => ({
        products: opts.append ? [...prev.products, ...page.products] : page.products,
        categories: page.categories.length ? page.categories : prev.categories,
        total: page.total,
        hasMore: page.hasMore,
      }));
    } catch (err) {
      setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal memuat katalog.'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [city]);

  // muat pertama + saat query/kategori berubah (debounce search)
  useEffect(() => {
    const handle = setTimeout(() => {
      load({ q: query, cat: category, offset: 0, append: false });
    }, query ? 350 : 0);
    return () => clearTimeout(handle);
  }, [query, category, load]);

  const chips = useMemo(() => data.categories.filter((c) => c.name && c.count > 0), [data.categories]);

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <div>
          <div className="eyebrow">KATALOG</div>
          <h2 style={{ marginTop: 2 }}>Semua Produk</h2>
        </div>
        <small>{data.total > 0 ? `${data.total} produk` : ''}</small>
      </div>

      <div style={{ padding: '0 16px 10px' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk (mis. beras, kopi, minyak…)"
          aria-label="Cari produk"
          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px', color: 'var(--ink)', outline: 'none' }}
        />
      </div>

      {chips.length > 0 && (
        <div className="chips" role="tablist" aria-label="Filter kategori">
          <button className={`chip${category === null ? ' active' : ''}`} onClick={() => setCategory(null)}>Semua</button>
          {chips.map((c) => (
            <button key={c.name} className={`chip${category === c.name ? ' active' : ''}`} onClick={() => setCategory(category === c.name ? null : c.name)}>{c.name} ({c.count})</button>
          ))}
        </div>
      )}

      {loading && <div className="grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" style={{ height: 210 }} />)}</div>}

      {!loading && error && (
        <div className="empty">
          <div className="msg msg-error" style={{ textAlign: 'left' }}>{error}</div>
          <button className="btn btn-gold btn-block" style={{ marginTop: 12 }} onClick={() => load({ q: query, cat: category, offset: 0, append: false })}>Coba Lagi</button>
        </div>
      )}

      {!loading && !error && data.products.length === 0 && (
        <div className="empty">Tidak ada produk cocok dengan pencarian ini.<br />Coba kata kunci lain.</div>
      )}

      {!loading && !error && data.products.length > 0 && (
        <>
          <div className="grid">
            {data.products.map((product) => <ProductCard key={product.odooId} product={product} />)}
          </div>
          {data.hasMore && (
            <div style={{ padding: '0 16px 24px' }}>
              <button className="btn btn-ghost btn-block" disabled={loadingMore} onClick={() => load({ q: query, cat: category, offset: data.products.length, append: true })}>
                {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
