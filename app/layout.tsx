import type { Metadata, Viewport } from 'next';
import './globals.css';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { CartProvider } from '@/components/CartProvider';

export const metadata: Metadata = {
  title: 'Lokalmart — Mitra Belanja Keluarga Indonesia',
  description: 'Belanja harian hemat member Lokalmart: promo mingguan, antar/pickup depan masjid. Katalog, keranjang, dan order langsung tercatat ke kasir toko.',
  applicationName: 'Lokalmart',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0e7a3e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <CartProvider>
          <div className="app-shell">
            <TopBar />
            <main>{children}</main>
            <BottomNav />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
