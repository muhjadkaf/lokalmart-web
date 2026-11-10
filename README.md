# Lokalmart Web — Storefront Member

Katalog promo member Lokalmart depan masjid: pilih produk → keranjang → checkout (pickup/antar) → tercatat ke Odoo `sale.order` (company **LokalMart**, id 1 di `edu-lokalmart.odoo.com`, atau instance produksi yang baru).

**Stack:** Next.js 15 (App Router) · TypeScript · XML-RPC/JSON-2 Odoo bridge (server-only) · tanpa database tambahan (Odoo = system of record) · deploy di Vercel.

## Jalankan lokal

```bash
npm.cmd install        # Windows (PowerShell ExecutionPolicy: pakai .cmd!)
npm.cmd run dev        # http://localhost:3000
```

Tanpa `.env`, toko tetap tampil (katalog dari `lib/seed-products.ts`); checkout & member lookup akan menjawab "Odoo belum dikonfigurasi".

## Konfigurasi (Vercel → Project → Settings → Environment Variables)

Salin `.env.example`. Wajib diisi: `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME` (bot internal, **bukan** user pribadi), `ODOO_PASSWORD` (atau JSON-2 API key), `ODOO_COMPANY_ID` (default `1` = LokalMart), `ODOO_WRITES=true`.

**Keamanan:** semua kredensial Odoo hanya server-side. Tidak pernah dikirim ke browser. Checkout divalidasi di server (harga dari seed, bukan dari client), same-origin check + rate limit per IP.

## Alur data

```
Browser (keranjang di localStorage)
   │ POST /api/checkout { items:[{id,qty}], member{...}, metode }
   ▼
Next.js server route → validasi & harga ← lib/seed-products.ts (DAFTAR HARGA PROMO MINGGUAN)
   ▼ XML-RPC
Odoo: res.partner (cari/buat by WA) → product.product (match default_code LM-*, fallback nama) → sale.order (+ order_line promo) → nama order kembali ke member
```

Member lookup (`POST /api/member/lookup`): cocokkan 8 digit terakhir WA di `res.partner.phone/mobile`, tampilkan 5 order terakhir milik nomor itu. Tanpa password — friksi minimal untuk antrean toko.

## Struktur

```
app/            beranda, katalog, keranjang, checkout, member, info + api/{health,products,member/lookup,checkout}
components/     TopBar, BottomNav (5 tab), CartProvider (localStorage), ProductCard
lib/            config (server env) · config-public (NEXT_PUBLIC_*) · odooBridge · checkout · member · seed-products
```

## Sebelum go-live (checklist)

- [ ] Bot Odoo dibuat & kredensial masuk Vercel env (bukan di chat/file)
- [ ] `ODOO_WRITES=true` setelah uji POST /api/checkout membuat order dummy TEST lalu **dibatalkan/dihapus dari Odoo**
- [ ] `default_code` LM-* terisi di produk Odoo yang ikut katalog promo (match akurat, harga promo dari seed)
- [ ] Uji member lookup dengan 1 nomor member nyata
- [ ] Deploy: `npx vercel --prod` (atau hubungkan repo → auto deploy)
- [ ] WA kasir tahu link `https://<domain>` untuk dibagikan ke status
- [ ] Minggu promo berikutnya: edit `lib/seed-products.ts`, commit, deploy, selesai

## Catatan keputusan

- **Tanpa SQLite/KV** — Vercel serverless tidak persist; Odoo adalah satu-satunya record. Keranjang di localStorage browser.
- **Foto produk** — sementara tile inisial warna per kategori (tanpa aset eksternal); ganti dengan foto asli (upload ke `public/produk/…` atau `image_128` dari Odoo) saat tersedia.
- **Harga promo** — single source `lib/seed-products.ts`, sama dengan katalog PDF quotation Odoo (`Template-Quotation-Lokalmart/data-produk.json`). Sinkronkan tiap minggu.
- **PWA** — manifest + theme-color aktif; service worker sengaja belum (checkout butuh network).
