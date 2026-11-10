'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatRupiah, waLink } from '@/lib/config-public';

type Phase = 'form' | 'submitting' | 'done';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [alamat, setAlamat] = useState('');
  const [metode, setMetode] = useState<'pickup' | 'antar'>('pickup');
  const [catatan, setCatatan] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderName: string; waUrl: string; unmatched: string[] } | null>(null);

  if (items.length === 0 && phase !== 'done') {
    return (
      <div className="empty" style={{ paddingTop: 60 }}>
        Keranjang masih kosong.
        <div style={{ marginTop: 16 }}><Link href="/katalog" className="btn btn-primary">Isi Keranjang Dulu</Link></div>
      </div>
    );
  }

  if (phase === 'done' && result) {
    return (
      <div className="form" style={{ paddingTop: 28 }}>
        <div className="msg success" role="status">
          <strong style={{ fontSize: 15 }}>Pesanan tercatat! 🎉</strong><br />
          No. order Odoo: <b>{result.orderName}</b><br />
          Kasir Lokalmart akan menyiapkan pesananmu. Bawa nomor order ini saat pickup, atau tunggu konfirmasi WA untuk antar.
        </div>
        {result.unmatched.length > 0 && (
          <div className="msg info">Produk berikut belum tertaut otomatis di kasir (dicatat manual): {result.unmatched.join(', ')}.</div>
        )}
        <a className="btn btn-orange" style={{ justifyContent: 'center' }} href={result.waUrl} target="_blank" rel="noopener noreferrer">Konfirmasi ke WA Kasir</a>
        <Link href="/katalog" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Belanja Lagi</Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPhase('submitting');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          member: { nama, wa, alamat: metode === 'antar' ? alamat : '' },
          metode,
          catatan,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data?.error || 'Pesanan gagal tersimpan. Coba lagi, atau pesan via WA.');
        setPhase('form');
        return;
      }
      setResult({ orderName: data.orderName, waUrl: data.waUrl, unmatched: data.unmatched || [] });
      clear();
      setPhase('done');
    } catch {
      setError('Tidak bisa menghubungi server. Periksa koneksi kamu, atau pesan via WA.');
      setPhase('form');
    }
  }

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Checkout</h2>
        <small>{items.length} item · {formatRupiah(total)}</small>
      </div>

      <form className="form" onSubmit={onSubmit}>
        {error && <div className="msg error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="nama">Nama (sesuai member)</label>
          <input id="nama" required minLength={3} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. Budi Santoso" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="wa">Nomor WhatsApp</label>
          <input id="wa" required inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="0812-3456-7890" autoComplete="tel" />
          <div className="hint">Dipakai kasir untuk konfirmasi &amp; resi — bukan untuk promo spam.</div>
        </div>

        <div className="field">
          <label>Metode</label>
          <div className="toggle" role="radiogroup" aria-label="Metode pengambilan">
            <button type="button" className={metode === 'pickup' ? 'active' : ''} onClick={() => setMetode('pickup')} aria-pressed={metode === 'pickup'}>
              Ambil di Toko<small>depan masjid · gratis</small>
            </button>
            <button type="button" className={metode === 'antar' ? 'active' : ''} onClick={() => setMetode('antar')} aria-pressed={metode === 'antar'}>
              Diantar Kurir<small>area sekitar toko · biaya nanti dikonfirmasi</small>
            </button>
          </div>
        </div>

        {metode === 'antar' && (
          <div className="field">
            <label htmlFor="alamat">Alamat lengkap untuk diantar</label>
            <textarea id="alamat" required minLength={10} rows={2} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jalan, nomor rumah, RT/RW, patokan…" />
          </div>
        )}

        <div className="field">
          <label htmlFor="catatan">Catatan (opsional)</label>
          <textarea id="catatan" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="mis. telur minta yang tidak retak / titip di warung sebelah…" />
        </div>

        <div className="total-line" style={{ marginBottom: 0 }}><span>Total (promo member)</span><span>{formatRupiah(total)}</span></div>
        <button className="btn btn-primary" type="submit" disabled={phase === 'submitting'} style={{ justifyContent: 'center', padding: 14, fontSize: 14 }}>
          {phase === 'submitting' ? 'Menyimpan ke kasir…' : 'Pesan Sekarang'}
        </button>
        <a className="btn btn-ghost" style={{ justifyContent: 'center' }} href={waLink(`Halo Lokalmart! Saya mau pesan:\n${items.map((i) => `${i.qty}× ${i.nama}`).join('\n')}\nTotal: ${formatRupiah(total)}`)} target="_blank" rel="noopener noreferrer">Pesan via WA saja</a>
      </form>
    </>
  );
}
