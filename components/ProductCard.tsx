'use client';

import { useCart } from './CartProvider';
import { formatRupiah } from '@/lib/config-public';
import type { SeedProduct } from '@/lib/seed-products';

function initials(nama: string) {
  const words = nama.split(' ').filter(Boolean);
  return (words[0]?.[0] || 'L').toUpperCase() + (words[1]?.[0] || '').toUpperCase();
}

function thumbClass(kategori: string) {
  const k = kategori.toLowerCase().replace(/\s+/g, '-');
  return `thumb k-${k}`;
}

export default function ProductCard({ product, discount }: { product: SeedProduct; discount: number }) {
  const { add } = useCart();

  return (
    <article className="card">
      <div className={thumbClass(product.kategori)} aria-hidden="true">
        <span className="badge">{product.badge}</span>
        {discount > 0 && <span className="discount-pill">-{discount}%</span>}
        {initials(product.nama)}
      </div>
      <div className="card-body">
        <h3>{product.nama}</h3>
        <div className="ket">{product.keterangan} · {product.satuan.replace('/', 'per ')}</div>
        <div className="price-row">
          <div>
            <div className="price-old">{formatRupiah(product.hargaNormal)}</div>
            <div className="price-new">{formatRupiah(product.hargaPromo)}</div>
          </div>
          <button className="add-btn" onClick={() => add({ id: product.id, nama: product.nama, harga: product.hargaPromo, satuan: product.satuan })} aria-label={`Tambah ${product.nama} ke keranjang`}>
            + Keranjang
          </button>
        </div>
      </div>
    </article>
  );
}
