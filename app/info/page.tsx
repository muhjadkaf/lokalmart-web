import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pusat Bantuan — LokalMart',
};

export default function InfoPage() {
  const wa = process.env.NEXT_PUBLIC_TOKO_WA || '0812-3456-7890';
  const waLink = process.env.NEXT_PUBLIC_TOKO_WA_LINK || '6281234567890';

  return (
    <div className="section" style={{ paddingTop: 18 }}>
      <div className="eyebrow">PUSAT BANTUAN</div>
      <h1 className="page-title" style={{ fontSize: 22, margin: '4px 0 14px' }}>LokalMart Care</h1>

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <b style={{ fontSize: 13.5 }}>Ada kendala pesanan?</b>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginTop: 6 }}>Tunjukkan nama + nomor order (mis. S00092) ke kasir toko depan masjid, atau chat WA <a style={{ color: 'var(--gold)', fontWeight: 700 }} href={`https://wa.me/${waLink}`}>{wa}</a>. Kami bantu cek statusnya di kasir.</p>
      </div>

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <b style={{ fontSize: 13.5 }}>Cara belanja</b>
        <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, paddingLeft: 18, marginTop: 6 }}>
          <li>Pilih produk di Katalog → tambah ke keranjang.</li>
          <li>Checkout: Ambil di Toko (gratis) atau Antar ke Alamat (kurir koloni).</li>
          <li>Pesanan tercatat di kasir; kamu bayar saat barang disiapkan.</li>
          <li>Riwayat belanja ada di menu Pesanan.</li>
        </ul>
      </div>

      <div className="card card-pad">
        <b style={{ fontSize: 13.5 }}>Privasi &amp; data</b>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginTop: 6 }}>Nama, WA, dan alamatmu hanya dipakai untuk transaksi &amp; pembukuan koloni — tidak diperjualbelikan. Ingin menghapus data/akun? Ketuk "Hubungi kasir" dengan pesan "HAPUS AKUN".</p>
      </div>

      <footer className="site" style={{ marginTop: 18 }}>LokalMart — PT LokalKaryaBakti<br />Depan Masjid, Jl. Raya Toko Kelontong No. 88</footer>
    </div>
  );
}
