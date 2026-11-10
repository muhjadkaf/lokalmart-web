'use client';

import { useState, type FormEvent } from 'react';
import { formatRupiah } from '@/lib/config-public';

type LookupResult =
  | { ok: true; found: true; partner: { id: number; name: string }; orders: Array<{ id: number; name: string; date: string; total: number; state: string }> }
  | { ok: true; found: false }
  | { ok: false; error: string };

export default function MemberPage() {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as LookupResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: 'Tidak bisa menghubungi server. Periksa koneksi kamu.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="member-hero">
        <h2>Member Lokalmart</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.55 }}>Masuk pakai nomor WA — tanpa password. Kami tunjukkan identitas member &amp; riwayat pesananmu. Nomor WA kamu tidak dibagikan ke pihak lain.</p>
      </div>

      <form className="form" onSubmit={onSubmit} style={{ paddingTop: 8 }}>
        <div className="field">
          <label htmlFor="phone">Nomor WhatsApp terdaftar</label>
          <input id="phone" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812-3456-7890" autoComplete="tel" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center' }}>
          {busy ? 'Mencari…' : 'Masuk / Cek Member'}
        </button>
      </form>

      {result && !result.ok && <div className="msg error" role="alert" style={{ margin: '0 16px' }}>{result.error}</div>}
      {result && result.ok && !result.found && (
        <div className="msg info" style={{ margin: '0 16px' }}>
          Nomor <b>{phone}</b> belum terdaftar sebagai member.<br />
          Cara daftar: belanja sekali di toko depan masjid, sebut “mau member” ke kasir — nama &amp; WA kamu langsung didaftarkan. Member pertama langsung dapat harga promo minggu ini.
        </div>
      )}
      {result && result.ok && result.found && (
        <>
          <div className="msg success" style={{ margin: '0 16px' }}>
            Halo, <b>{result.partner.name}</b>! 👋 Kamu member terdaftar Lokalmart.
          </div>
          <div className="section-title"><h2>Riwayat Pesanan Terakhir</h2></div>
          {result.orders.length === 0 && <div className="empty" style={{ paddingTop: 8 }}>Belum ada pesanan tercatat. Yuk mulai belanja dari katalog promo.</div>}
          {result.orders.map((order) => (
            <div className="order-card" key={order.id}>
              <b>{order.name}</b> <span className={`state ${order.state === 'sale' ? 'sale' : ''}`}>{order.state}</span>
              <div style={{ marginTop: 4, color: 'var(--muted)' }}>{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {formatRupiah(order.total)}</div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
