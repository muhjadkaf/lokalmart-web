import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lokalmart — Mitra Belanja Keluarga Indonesia',
    short_name: 'Lokalmart',
    description: 'Katalog promo member Lokalmart, pesan antar/pickup depan masjid.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffdf7',
    theme_color: '#0e7a3e',
    lang: 'id',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
