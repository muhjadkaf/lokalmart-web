import Link from 'next/link';
import { PRODUK_PROMO, PROMO_PERIODE, KATEGORI, diskonPersen } from '@/lib/seed-products';
import { tokoInfo, waLink } from '@/lib/config-public';
import ProductCard from '@/components/ProductCard';

const keunggulan = [
  { judul: 'Member = lebih hemat', isi: 'Harga promo khusus member, berlaku 1 minggu, stok terbatas.' },
  { judul: 'Pickup & antar', isi: 'Ambil di kasir depan masjid, atau diantar kurir koloni.' },
  { judul: 'UMKM lokal terkurasi', isi: 'Produk titip UMKM Cirebon–Bondowoso, lolos kurasi Ratu.' },
  { judul: 'Transparan & SHU', isi: 'Keuntungan toko balik ke anggota lewat Sisa Hasil Usaha.' },
];

export default function HomePage() {
  const toko = tokoInfo();
  const bestSellers = PRODUK_PROMO.filter((p) => p.badge === 'BEST SELLER');

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <div className="hero-eyebrow">Katalog Promo Minggu Ini · {PROMO_PERIODE.terbit} – {PROMO_PERIODE.berlakuSampai}</div>
          <h2>Belanja cerdas,<br />hemat, berkualitas.</h2>
          <p>Khusus member {toko.nama}. Pesan dari HP — ambil di kasir depan masjid, atau diantar. Harga promo berkala, stok terbatas.</p>
          <div className="hero-cta">
            <Link href="/katalog" className="btn btn-primary">Lihat Katalog Promo</Link>
            <a className="btn btn-orange" href={waLink(`Halo ${toko.nama}! Saya mau tanya promo minggu ini.`)} target="_blank" rel="noopener noreferrer">Tanya via WA</a>
          </div>
        </div>
      </section>

      <div className="promo-banner">
        {PROMO_PERIODE.judul}
        <small>Berlaku sampai {PROMO_PERIODE.berlakuSampai} · Screenshot &amp; share ke status WA kamu!</small>
      </div>

      <div className="section-title">
        <h2>Best Seller Minggu Ini</h2>
        <small>{KATEGORI.join(' · ')}</small>
      </div>
      <div className="grid">
        {bestSellers.map((p) => <ProductCard key={p.id} product={p} discount={diskonPersen(p)} />)}
      </div>

      <div className="section-title"><h2>Kenapa Belanja di {toko.nama}?</h2></div>
      <div className="info-block" style={{ paddingTop: 0, display: 'grid', gap: 10 }}>
        {keunggulan.map((k) => (
          <div key={k.judul} className="hero-card" style={{ borderLeftColor: 'var(--green)' }}>
            <strong style={{ fontSize: 13 }}>{k.judul}</strong>
            <p style={{ marginTop: 3 }}>{k.isi}</p>
          </div>
        ))}
      </div>

      <footer className="site">
        {toko.nama} · {toko.tagline}<br />
        {toko.alamat}<br />
        Pesan online = tercatat otomatis di kasir toko (Odoo). Harga promo khusus member, stok terbatas.
      </footer>
    </>
  );
}
