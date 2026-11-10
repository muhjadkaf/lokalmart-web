import { tokoInfo, waLink } from '@/lib/config-public';

export default function InfoPage() {
  const toko = tokoInfo();
  const mapsQuery = encodeURIComponent(toko.alamat);

  return (
    <>
      <div className="info-block" style={{ paddingTop: 18 }}>
        <h2>Tentang {toko.nama}</h2>
        <p>{toko.nama} adalah toko komunitas member-based di {toko.alamat} — dikelola bersama warga, dengan transparansi pembukuan (Odoo) dan Sisa Hasil Usaha (SHU) untuk anggota. Belanja harian kamu jadi modal membangun ekonomi warga sekitar.</p>
      </div>

      <div className="info-block">
        <h2>Jam Buka</h2>
        <p>{toko.jam}</p>
      </div>

      <div className="info-block">
        <h2>Lokasi &amp; Kontak</h2>
        <p>{toko.alamat}</p>
        <p style={{ marginTop: 6 }}>WA Kasir: <a href={waLink(`Halo ${toko.nama}!`)}>{toko.wa}</a><br />
        Maps: <a href={`https://www.google.com/maps/search/${mapsQuery}`} target="_blank" rel="noopener noreferrer">buka di Google Maps →</a></p>
      </div>

      <div className="info-block">
        <h2>Cara Pesan</h2>
        <ul>
          <li><b>Ambil di toko:</b> pesan lewat web → tunjukkan nama / nomor WA di kasir → bayar → bawa pulang.</li>
          <li><b>Diantar:</b> pesan lewat web → kurir koloni mengantar ke alamat kamu (area sekitar toko) → bayar COD / transfer sesuai konfirmasi WA.</li>
          <li><b>Tanya dulu:</b> keraguan soal stok/harga — tanya WA kasir, lebih cepat daripada nebak.</li>
        </ul>
      </div>

      <div className="info-block">
        <h2>Harga &amp; Ketentuan</h2>
        <ul>
          <li>Harga promo hanya untuk member; harga dapat berubah sewaktu-waktu.</li>
          <li>Stok promo terbatas — siapa cepat, dia dapat.</li>
          <li>Gambar produk bersifat ilustrasi; kasir akan cocokkan saat pengambilan.</li>
          <li>Data member (nama, WA, alamat) hanya dipakai untuk transaksi &amp; SHU — tidak dijual. Permintaan hapus data: hubungi kasir.</li>
        </ul>
      </div>

      <footer className="site">{toko.nama} · {toko.tagline}<br />Bagian dari ekosistem koloni Namlah.</footer>
    </>
  );
}
