'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import DataImage from '@/components/DataImage';
import { rupiah } from '@/lib/types';

export default function KeranjangPage() {
  const { items, total, setQty, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty" style={{ paddingTop: 70 }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ margin: '0 auto 12px', opacity: .4 }}>
          <path d="M4 6h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11.5" cy="20.6" r="1.4" fill="currentColor"/><circle cx="16.7" cy="20.6" r="1.4" fill="currentColor"/>
        </svg>
        <b>Keranjang masih kosong</b><br />
        Mulai belanja produk UMKM lokal yang terkurasi.
        <div style={{ marginTop: 16 }}><Link href="/katalog" className="btn btn-gold btn-block">Buka Katalog</Link></div>
      </div>
    );
  }

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Keranjang</h2>
        <button className="icon-btn" onClick={clear} aria-label="Kosongkan keranjang" style={{ width: 'auto', padding: '0 12px', fontSize: 12, fontWeight: 700 }}>Kosongkan</button>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        {items.map((item) => (
          <div className="qty-row" key={item.odooId}>
            <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', background: 'var(--surface3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DataImage image={item.image ?? null} name={item.name} />
            </div>
            <div className="nm">
              {item.name}
              <div className="unit">{rupiah(item.price)} / {item.uom} · {item.storeName}</div>
            </div>
            <button className="qty-btn" onClick={() => setQty(item.odooId, item.qty - 1)} aria-label="Kurangi">−</button>
            <span className="qty">{item.qty}</span>
            <button className="qty-btn" onClick={() => setQty(item.odooId, item.qty + 1)} aria-label="Tambah">+</button>
            <button className="qty-btn" onClick={() => remove(item.odooId)} aria-label="Hapus" style={{ color: 'var(--danger)' }}>✕</button>
          </div>
        ))}
      </div>

      <div className="section" style={{ paddingTop: 4 }}>
        <div className="total-line"><span>Total</span><span>{rupiah(total)}</span></div>
        <Link href="/checkout" className="btn btn-gold btn-block" style={{ padding: 15, fontSize: 14 }}>Lanjut ke Checkout →</Link>
        <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 10, textAlign: 'center' }}>Pembayaran: Tunai / QRIS / Transfer saat barang disiapkan di kasir.</p>
      </div>
    </>
  );
}
