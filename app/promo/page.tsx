import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promo & Poin — LokalMart',
};

const vouchers = [
  { title: '20% s/d Rp 20.000', subtitle: 'Min. belanja Rp 100rb · s/d 16 Nov 2026', tone: 'diskon' },
  { title: 'GRATIS ONGKIR', subtitle: 's/d Rp 10.000 · min. belanja Rp 50rb', tone: 'ongkir' },
  { title: 'Cashback 15%', subtitle: 'Kategori Kopi & Teh · khusus hari ini', tone: 'kopi' },
];

function voucherIcon(tone: string) {
  if (tone === 'ongkir') {
    return <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>;
  }
  if (tone === 'kopi') {
    return <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Zm11 1h2a2 2 0 0 1 0 4h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>;
  }
  return <path d="M4 9.5 9.5 4H20v10.5L14.5 20h-10zM14.5 9.5a1.5 1.5 0 1 0 0 .01" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>;
}

export default function PromoPage() {
  return (
    <div className="section" style={{ paddingTop: 18 }}>
      <div className="eyebrow">PROMO &amp; VOUCHER</div>
      <h1 className="page-title" style={{ fontSize: 22, margin: '4px 0 2px' }}>Promo mingguan &amp; poin member LokalMart</h1>

      <div className="card card-pad" style={{ marginTop: 14 }}>
        <div className="eyebrow">POIN LOKALMART</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
          <span className="points-big">1.240</span>
          <span style={{ color: 'var(--muted)', fontSize: 13, paddingBottom: 8 }}>poin</span>
        </div>
        <div className="progress"><i style={{ width: '81%' }} /></div>
        <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>760 poin menuju voucher Rp 20.000</div>
      </div>

      <div className="eyebrow" style={{ margin: '18px 0 8px' }}>VOUCHER UNTUKMU</div>
      {vouchers.map((voucher) => (
        <div key={voucher.title} className="voucher">
          <span className="ic"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">{voucherIcon(voucher.tone)}</svg></span>
          <span><b>{voucher.title}</b><small>{voucher.subtitle}</small></span>
          <span style={{ marginLeft: 'auto', color: 'var(--faint)', fontSize: 20 }}>›</span>
        </div>
      ))}

      <p style={{ fontSize: 10.5, color: 'var(--faint)', lineHeight: 1.6, marginTop: 14 }}>Voucher berlaku otomatis di kasir saat kamu scan Member Card / masuk dengan Semut-ID. Syarat &amp; ketentuan berlaku; stok promo terbatas.</p>
    </div>
  );
}
