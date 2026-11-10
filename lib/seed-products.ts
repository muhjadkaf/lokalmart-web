/**
 * DAFTAR HARGA PROMO MINGGUAN — single source untuk web Lokalmart.
 * Disinkronkan dengan Odoo (company LokalMart) per 2026-11-10:
 * nama & kode produk = produk asli Odoo; harga coret anchor = katalog WA 9–16 Nov
 * atau list_price Odoo mana yang masuk akal; harga promo = tidak pernah di atas
 * list_price Odoo. Barcode/default_code dipakai menautkan sale.order.line.
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
  /** default_code produk di Odoo (barcode atau LM-*) untuk pencocokan order */
  defaultCode?: string;
};

export const PRODUK_PROMO: SeedProduct[] = [
  { id: 'beras-premium-5kg', nama: 'Beras Rojolele Premium 5kg', kategori: 'Sembako', hargaNormal: 78000, hargaPromo: 59500, satuan: '/karung', badge: 'BEST SELLER', keterangan: 'Beras pulen, wangi, kemasan 5kg (kode LM-MK-001)', defaultCode: 'LM-MK-001' },
  { id: 'minyak-goreng-2l', nama: 'Minyak Goreng Bimoli 2L', kategori: 'Sembako', hargaNormal: 34000, hargaPromo: 34000, satuan: '/botol', badge: 'MEMBER', keterangan: 'Minyak goreng jernih 2 liter (kode LM-MK-002)', defaultCode: 'LM-MK-002' },
  { id: 'gula-pasir-1kg', nama: 'Gula Pasir Curah 1kg', kategori: 'Sembako', hargaNormal: 18500, hargaPromo: 16500, satuan: '/bungkus', badge: 'HEMAT', keterangan: 'Gula pasir kristal 1kg (kode LM-MK-003)', defaultCode: 'LM-MK-003' },
  { id: 'mie-instan-goreng', nama: 'Indomie Mi Instan Goreng Plus Special 80g', kategori: 'Makanan', hargaNormal: 3300, hargaPromo: 2900, satuan: '/pcs', badge: 'BUY 3 GRATIS 1', keterangan: 'Varian goreng, pedas manis (kode 10003517)', defaultCode: '10003517' },
  { id: 'susu-uht', nama: 'Susu UHT Full Cream 1L', kategori: 'Minuman', hargaNormal: 18500, hargaPromo: 16900, satuan: '/kotak', badge: 'BARU', keterangan: 'Susu UHT rendah gula 1L (kode LM-MK-016)', defaultCode: 'LM-MK-016' },
  { id: 'telur-ayam-1kg', nama: 'Telur Ayam 1kg', kategori: 'Segar', hargaNormal: 28500, hargaPromo: 24500, satuan: '/kg', badge: 'PROMO', keterangan: 'Telur fresh ±15 butir (kode LM-MK-005)', defaultCode: 'LM-MK-005' },
  { id: 'kopi-bubuk-250g', nama: 'Kopi Bubuk Lokal Jember 250g', kategori: 'Minuman', hargaNormal: 22000, hargaPromo: 22000, satuan: '/pack', badge: 'BEST SELLER', keterangan: 'Kopi tubruk premium 250g (kode LM-MK-011)', defaultCode: 'LM-MK-011' },
  { id: 'deterjen-cair-15l', nama: 'Rinso Deterjen Liquid + Molto Perfume Essence 1.5L', kategori: 'Rumah Tangga', hargaNormal: 39500, hargaPromo: 29800, satuan: '/botol', badge: 'DISKON 25%', keterangan: 'Cair, wangi ekstra dan lembut (kode 20099812)', defaultCode: '20099812' },
  { id: 'teh-celup-sariwangi-40s', nama: 'Teh Celup Sariwangi isi 40', kategori: 'Minuman', hargaNormal: 16000, hargaPromo: 9900, satuan: '/kotak', badge: 'HEMAT', keterangan: 'Teh melati premium isi 40 (kode LM-MK-012)', defaultCode: 'LM-MK-012' },
];

export const KATEGORI = [...new Set(PRODUK_PROMO.map((p) => p.kategori))];

export function diskonPersen(p: SeedProduct) {
  if (p.hargaNormal <= 0) return 0;
  return Math.round(((p.hargaNormal - p.hargaPromo) / p.hargaNormal) * 100);
}

export function getSeedProduct(id: string) {
  return PRODUK_PROMO.find((p) => p.id === id) ?? null;
}
