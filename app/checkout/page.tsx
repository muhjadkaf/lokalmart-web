'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useSession } from '@/components/SessionProvider';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { rupiah } from '@/lib/types';

type Phase = 'form' | 'submitting' | 'done';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { identity } = useSession();
  const [delivery, setDelivery] = useState(true);
  const [payment, setPayment] = useState('Tunai');
  const [nama, setNama] = useState(identity?.name ?? '');
  const [phone, setPhone] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState<string | null>(null);
  const [orderName, setOrderName] = useState<string | null>(null);

  useEffect(() => {
    if (identity?.name && !nama) setNama(identity.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.name]);

  if (items.length === 0 && phase !== 'done') {
    return (
      <div className="empty" style={{ paddingTop: 70 }}>
        Keranjang masih kosong.
        <div style={{ marginTop: 16 }}><Link href="/katalog" className="btn btn-gold btn-block">Isi Keranjang Dulu</Link></div>
      </div>
    );
  }

  if (phase === 'done' && orderName) {
    return (
      <div className="form" style={{ paddingTop: 30 }}>
        <div className="msg msg-success" role="status">
          <strong style={{ fontSize: 15 }}>Pesanan tersimpan</strong><br />
          No. order Odoo: <b>{orderName}</b><br />
          Kasir akan menyiapkan pesananmu. Bayar saat ambil di toko / saat barang diantar.
        </div>
        <Link href="/pesanan" className="btn btn-gold btn-block">Lihat Pesanan Saya</Link>
        <Link href="/" className="btn btn-ghost btn-block">Kembali ke Beranda</Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === 'submitting') return;
    if (delivery && alamat.trim().length < 8) {
      setError('Alamat pengantaran wajib diisi (min. 8 karakter).');
      return;
    }
    setPhase('submitting');
    setError(null);
    try {
      const noteParts = [`Pembayaran: ${payment}`];
      if (catatan.trim()) noteParts.push(catatan.trim());
      const result = await apiFetch<{ ok?: boolean; saleOrderName?: string; saleOrderId?: number; error?: string }>('/api/checkout', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ productId: i.odooId, qty: i.qty })),
          fulfillment: delivery ? 'deliver' : 'pickup',
          shipName: nama.trim() || undefined,
          shipPhone: phone.trim() || undefined,
          shipAddress: delivery ? alamat.trim() : undefined,
          note: noteParts.join(' · '),
        },
      });
      if (result.ok !== true) {
        setError(result.error || 'Checkout gagal. Coba lagi.');
        setPhase('form');
        return;
      }
      setOrderName(result.saleOrderName ?? `ORDER-${result.saleOrderId ?? ''}`);
      clear();
      setPhase('done');
    } catch (err) {
      setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Checkout gagal karena gangguan koneksi.'));
      setPhase('form');
    }
  }

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Checkout</h2>
        <small>{items.length} item · {rupiah(total)}</small>
      </div>

      <form className="form" onSubmit={onSubmit}>
        {error && <div className="msg msg-error" role="alert">{error}</div>}

        <div className="field">
          <label>Cara menerima</label>
          <div className="toggle" role="radiogroup" aria-label="Metode pengantaran">
            <button type="button" className={!delivery ? 'active' : ''} onClick={() => setDelivery(false)} aria-pressed={!delivery}>
              Ambil di Toko<small>gratis biaya</small>
            </button>
            <button type="button" className={delivery ? 'active' : ''} onClick={() => setDelivery(true)} aria-pressed={delivery}>
              Antar ke Alamat<small>diantar kurir</small>
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="nama">Nama penerima</label>
          <input id="nama" required minLength={3} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="phone">Nomor WhatsApp</label>
          <input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812-3456-7890" autoComplete="tel" />
          <div className="hint">Dipakai kasir untuk konfirmasi &amp; update pengiriman.</div>
        </div>
        {delivery && (
          <div className="field">
            <label htmlFor="alamat">Alamat pengantaran</label>
            <textarea id="alamat" required minLength={8} rows={2} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jalan, nomor, RT/RW, patokan…" />
          </div>
        )}

        <div className="field">
          <label htmlFor="payment">Metode pembayaran</label>
          <select id="payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
            {['Tunai', 'QRIS', 'Transfer', 'Kartu'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="catatan">Catatan (opsional)</label>
          <textarea id="catatan" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="mis. telur jangan yang retak / titip tetangga…" />
        </div>

        <div className="total-line" style={{ marginBottom: 0 }}><span>Total</span><span>{rupiah(total)}</span></div>
        <button className="btn btn-gold btn-block" type="submit" disabled={phase === 'submitting'} style={{ padding: 15, fontSize: 14 }}>
          {phase === 'submitting' ? 'Menyimpan pesanan…' : 'Pesan Sekarang'}
        </button>
      </form>
    </>
  );
}
