import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'LokalMart — Belanja Produk UMKM Lokal',
  description: 'Belanja produk UMKM lokal terkurasi: katalog koloni, promo member, dan pembayaran via kasir toko. Bagian dari ekosistem LokalMart (PT LokalKaryaBakti).',
  applicationName: 'LokalMart',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
