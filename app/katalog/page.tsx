'use client';

import { useMemo, useState } from 'react';
import { PRODUK_PROMO, KATEGORI, PROMO_PERIODE, diskonPersen } from '@/lib/seed-products';
import ProductCard from '@/components/ProductCard';

export default function KatalogPage() {
  const [kategori, setKategori] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const produk = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUK_PROMO.filter((p) => {
      if (kategori && p.kategori !== kategori) return false;
      if (q && !`${p.nama} ${p.keterangan} ${p.kategori}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kategori, query]);

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Katalog Promo</h2>
        <small>s/d {PROMO_PERIODE.berlakuSampai}</small>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <input
          type="search"
          placeholder="Cari produk (mis. beras, kopi, minyak…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari produk"
          style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 12px', background: 'var(--field)', outline: 'none' }}
        />
      </div>

      <div className="chips" role="tablist" aria-label="Filter kategori">
        <button className={`chip${kategori === null ? ' active' : ''}`} onClick={() => setKategori(null)}>Semua ({PRODUK_PROMO.length})</button>
        {KATEGORI.map((k) => (
          <button key={k} className={`chip${kategori === k ? ' active' : ''}`} onClick={() => setKategori(kategori === k ? null : k)}>{k}</button>
        ))}
      </div>

      {produk.length > 0 ? (
        <div className="grid">
          {produk.map((p) => <ProductCard key={p.id} product={p} discount={diskonPersen(p)} />)}
        </div>
      ) : (
        <div className="empty">Tidak ada produk cocok dengan “{query}”.<br />Coba kata kunci lain, atau tanya langsung lewat WA kasir.</div>
      )}
    </>
  );
}
