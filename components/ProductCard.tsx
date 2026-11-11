'use client';

import { useCart } from './CartProvider';
import { rupiah, type CatalogProduct } from '@/lib/types';
import DataImage from './DataImage';

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const { add } = useCart();
  const low = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;
  const out = typeof product.stock === 'number' && product.stock <= 0;

  return (
    <article className="product-card">
      <a
        href={`/produk/${product.odooId}`}
        className="thumb"
        style={{ textDecoration: 'none' }}
        aria-label={product.name}
        onClick={() => {
          try {
            window.localStorage.setItem(`lokalmart-product-${product.odooId}`, JSON.stringify(product));
          } catch {
            /* abaikan */
          }
        }}
      >
        <DataImage image={product.image ?? null} name={product.name} />
        {typeof product.stock === 'number' && (
          <span className={`stock-badge${low ? ' low' : ''}`}>{out ? 'HABIS' : `STOK ${product.stock}`}</span>
        )}
      </a>
      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="price">{product.formattedPrice || rupiah(product.price)}</div>
        <div className="unit">per {product.uom} · {product.category}</div>
        <div className="add-row">
          <span className="store-tag" title={product.storeName}>{product.storeName}</span>
          <button className="add-btn" onClick={() => add(product)} disabled={out} aria-label={`Tambah ${product.name} ke keranjang`}>
            + Keranjang
          </button>
        </div>
      </div>
    </article>
  );
}
