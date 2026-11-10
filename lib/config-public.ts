/** Konfigurasi yang aman untuk client & server (hanya NEXT_PUBLIC_*). */
const clean = (v: string | undefined) => v?.trim() || '';

export function tokoInfo() {
  return {
    nama: clean(process.env.NEXT_PUBLIC_TOKO_NAMA) || 'LOKALMART',
    tagline: clean(process.env.NEXT_PUBLIC_TOKO_TAGLINE) || 'Mitra Belanja Keluarga Indonesia',
    alamat: clean(process.env.NEXT_PUBLIC_TOKO_ALAMAT) || 'Depan Masjid, Jl. Raya Toko Kelontong No. 88',
    wa: clean(process.env.NEXT_PUBLIC_TOKO_WA) || '0812-3456-7890',
    waLinkNumber: clean(process.env.NEXT_PUBLIC_TOKO_WA_LINK) || '6281234567890',
    jam: clean(process.env.NEXT_PUBLIC_TOKO_JAM) || 'Senin–Sabtu 07.00–21.00 WIB · Minggu 07.00–12.00 WIB',
  };
}

export function waLink(message: string): string {
  const base = tokoInfo().waLinkNumber;
  return `https://wa.me/${base}?text=${encodeURIComponent(message)}`;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}
