'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatRupiah } from '@/lib/config-public';

export default function KeranjangPage() {
  const { items, total, setQty, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty" style={{ paddingTop: 60 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ margin: '0 auto 12px', display: 'block', opacity: .5 }}>
          <path d="M4 6h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11.5" cy="21" r="1.4" fill="currentColor"/><circle cx="16.5" cy="21" r="1.4" fill="currentColor"/>
        </svg>
        <b>Keranjang masih kosong</b><br />
        Isi dengan produk promo minggu ini — hemat khusus member.
        <div style={{ marginTop: 16 }}><Link href="/katalog" className="btn btn-primary">Lihat Katalog Promo</Link></div>
      </div>
    );
  }

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Keranjang</h2>
        <button className="remove-x" onClick={clear} style={{ fontSize: 12, fontWeight: 700 }}>Kosongkan</button>
      </div>
      <div className="drawer-body" style={{ paddingTop: 0 }}>
        {items.map((item) => (
          <div className="qty-row" key={item.id}>
            <div className="nm">
              {item.nama}
              <div className="sub">{formatRupiah(item.harga)}{item.satuan} × {item.qty} = <b>{formatRupiah(item.harga * item.qty)}</b></div>
            </div>
            <button className="qty-btn" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Kurangi">−</button>
            <span className="qty">{item.qty}</span>
            <button className="qty-btn" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Tambah">+</button>
            <button className="remove-x" onClick={() => remove(item.id)} aria-label="Hapus">✕</button>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px 24px' }}>
        <div className="total-line"><span>Total</span><span>{formatRupiah(total)}</span></div>
        <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14 }}>Lanjut Checkout →</Link>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>Harga promo member. Bayar saat ambil di toko / saat barang diantar (COD) atau transfer — ikuti instruksi kasir via WA.</p>
      </div>
    </>
  );
}
