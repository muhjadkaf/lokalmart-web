# LokalMart Web

Webapp untuk **LokalMart** (belanja produk UMKM lokal) — versi web dari **APK LokalMart** (`namlah-customer`, Flutter). Satu backend, dua client: keduanya memanggil API Namlah di **namlah-lokalmart.vercel.app** (Odoo = system of record).

```
Browser → /api/* (proxy same-origin, relay cookie namlah_session)
        → namlah-lokalmart.vercel.app → Odoo
```

**Kenapa proxy?** Cookie sesi `namlah_session` adalah httpOnly cookie first-party backend Namlah; webapp ini me-relay-nya agar tidak jadi third-party cookie (SaaS-friendly, tetap aman).

## Fitur (parity APK)

- **Auth member**: login (email/HP/Semut-ID + password atau PIN 6-digit), register (Semut-ID otomatis), session check, ganti password, PIN (set/hapus), nama sapaan, avatar — semua lewat route proxy `/api/auth/*`.
- **Beranda**: deteksi kota terdekat (geolocation → `/api/koloni/cities`), katalog mega-koloni/koloni sesuai kota, best sellers.
- **Katalog**: search, filter kategori, paginasi "muat lebih banyak", badge stok.
- **Detail produk** (`/produk/[odooId]`): foto, harga Odoo, **bandingkan harga antar toko** (`/api/compare/product/[odooId]`).
- **Peta UMKM** (`/peta`): Leaflet + OpenStreetMap, marker dari `/api/umkm/map-points`, sheet detail toko + produk.
- **Keranjang & Checkout** (persist localStorage): Ambil di Toko / Antar ke Alamat, metode Tunai/QRIS/Transfer/Kartu, tercatat ke `sale.order` via `/api/checkout` (backend Namlah) — **wajib login**.
- **Pesanan** (`/pesanan`): riwayat + ringkasan (total, belanja, menunggu) dari `/api/orders/mine`.
- **Promo** (`/promo`): poin member & voucher (konten statis — cerminan PromoScreen APK).
- **Akun** (`/akun`): member card (Semut-ID + barcode CSS), nama sapaan, PIN, ganti password, status verifikasi, logout.

## Jalankan

```bash
npm.cmd install
npm.cmd run dev
```

Tanpa env: katalog tetap tampil? Tidak — webapp butuh backend Namlah; default `NAMLAH_API_BASE=https://namlah-lokalmart.vercel.app`. Override lewat env bila perlu.

Env (Vercel → Settings → Environment Variables):

```
NAMLAH_API_BASE=https://namlah-lokalmart.vercel.app   # default, boleh tidak di-set
```

## Checklist deploy

- [x] Build & typecheck hijau
- [ ] Deploy: `vercel deploy --prod` (GitHub integration TIDAK auto-deploy untuk project ini — pakai CLI)
- [ ] Smoke: `/` → login → katalog → checkout dummy → cek `sale.order` di Odoo → batalkan
- [ ] Rotate token Vercel bila dipakai di luar sesi ini

## Catatan arsitektur

- **Tanpa database lokal.** Keranjang di localStorage; sesi di cookie `namlah_session` first-party via proxy.
- **APK ↔ web parity:** setiap fitur baru di APK (`namlah-customer`) harus diport ke web (dan sebaliknya, dengan approval produk).
- Rate limit & same-origin check di route yang menulis (login, pin, sapaan, password, register, checkout).
