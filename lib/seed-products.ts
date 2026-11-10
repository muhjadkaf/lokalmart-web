/**
 * DAFTAR HARGA PROMO MINGGUAN — sumber tunggal untuk web Lokalmart.
 * Sama dengan `Template-Quotation-Lokalmart/data-produk.json` (katalog PDF Odoo + WA Status).
 * Setiap minggu: perbarui harga/badge/periode, deploy, selesai.
 */

export const PROMO_PERIODE = {
  terbit: '9 November 2026',
  berlakuSampai: '16 November 2026',
  judul: 'DAFTAR HARGA PROMO MINGGUAN',
} as const;

export type SeedProduct = {
  id: string;
  nama: string;
  kategori: string;
  hargaNormal: number;
  hargaPromo: number;
  satuan: string;
  badge: string;
  keterangan: string;
  // Kode produk Odoo (default_code) untuk pencocokan sale.order.line — diisi setelah audit Odoo.
  defaultCode?: string;
};

export const PRODUK_PROMO: SeedProduct[] = [
  { id: 'beras-premium-5kg', nama: 'Beras Premium 5kg', kategori: 'Sembako', hargaNormal: 68500, hargaPromo: 59500, satuan: '/karung', badge: 'BEST SELLER', keterangan: 'Beras pulen, wangi, kemasan 5kg', defaultCode: 'LM-BERAS-5KG' },
  { id: 'minyak-goreng-2l', nama: 'Minyak Goreng 2L', kategori: 'Sembako', hargaNormal: 42000, hargaPromo: 35500, satuan: '/botol', badge: 'PROMO', keterangan: 'Minyak goreng jernih 2 liter', defaultCode: 'LM-MINYAK-2L' },
  { id: 'gula-pasir-1kg', nama: 'Gula Pasir 1kg', kategori: 'Sembako', hargaNormal: 18500, hargaPromo: 16500, satuan: '/bungkus', badge: 'HEMAT', keterangan: 'Gula pasir kristal 1kg', defaultCode: 'LM-GULA-1KG' },
  { id: 'mie-instan-goreng', nama: 'Mie Instan Goreng 85g', kategori: 'Makanan', hargaNormal: 3500, hargaPromo: 2900, satuan: '/pcs', badge: 'BUY 3 GRATIS 1', keterangan: 'Varian goreng, pedas manis', defaultCode: 'LM-MIE-INSTAN' },
  { id: 'susu-uht-coklat', nama: 'Susu UHT Coklat 1L', kategori: 'Minuman', hargaNormal: 19500, hargaPromo: 16900, satuan: '/kotak', badge: 'BARU', keterangan: 'Susu UHT rendah gula 1L', defaultCode: 'LM-SUSU-UHT' },
  { id: 'telur-ayam-1kg', nama: 'Telur Ayam Negeri 1kg', kategori: 'Segar', hargaNormal: 28500, hargaPromo: 24500, satuan: '/kg', badge: 'PROMO', keterangan: 'Telur fresh ±15 butir', defaultCode: 'LM-TELUR-1KG' },
  { id: 'kopi-bubuk-200g', nama: 'Kopi Bubuk 200g', kategori: 'Minuman', hargaNormal: 32500, hargaPromo: 27500, satuan: '/pack', badge: 'BEST SELLER', keterangan: 'Kopi tubruk premium 200g', defaultCode: 'LM-KOPI-200G' },
  { id: 'deterjen-cair-16l', nama: 'Deterjen Cair 1.6L', kategori: 'Rumah Tangga', hargaNormal: 36500, hargaPromo: 29800, satuan: '/botol', badge: 'DISKON 18%', keterangan: 'Wangi ekstra dan lembut', defaultCode: 'LM-DETERJEN-16' },
  { id: 'teh-celup-poci-50', nama: 'Teh Celup Poci isi 50', kategori: 'Minuman', hargaNormal: 12500, hargaPromo: 9900, satuan: '/kotak', badge: 'HEMAT', keterangan: 'Teh melati premium isi 50', defaultCode: 'LM-TEH-POCI50' },
];

export const KATEGORI = [...new Set(PRODUK_PROMO.map((p) => p.kategori))];

export function diskonPersen(p: SeedProduct) {
  return Math.round(((p.hargaNormal - p.hargaPromo) / p.hargaNormal) * 100);
}

export function getSeedProduct(id: string) {
  return PRODUK_PROMO.find((p) => p.id === id) ?? null;
}
