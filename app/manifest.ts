import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LokalMart — Belanja Produk UMKM Lokal',
    short_name: 'LokalMart',
    description: 'Katalog koloni, promo member, peta UMKM, dan pesanan — LokalMart web.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    lang: 'id',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
