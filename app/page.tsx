'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { apiErrorMessage } from '@/lib/apiFetch';
import { distanceKm, fetchCatalogPage, fetchCities, loadSavedCity, saveCity } from '@/lib/catalogClient';
import { type CatalogPage, type CityKoloni } from '@/lib/types';

type LoadState = {
  city: CityKoloni | null;
  page: CatalogPage | null;
  loading: boolean;
  error: string | null;
};

export default function BerandaPage() {
  const [state, setState] = useState<LoadState>({ city: null, page: null, loading: true, error: null });

  const load = useCallback(async (city: CityKoloni | null) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const page = await fetchCatalogPage({ offset: 0, limit: 6, city });
      setState({ city, page, loading: false, error: null });
    } catch (error) {
      setState({ city, page: null, loading: false, error: apiErrorMessage(error instanceof Error ? { error: error.message } : null, 'Gagal memuat katalog.') });
    }
  }, []);

  // Deteksi kota: cache lokal → geolocation → fallback mega koloni.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = loadSavedCity();
      if (saved) {
        if (!cancelled) await load(saved);
        return;
      }
      const applyCity = async (city: CityKoloni | null) => {
        if (city) saveCity(city);
        if (!cancelled) await load(city);
      };
      try {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const cities = await fetchCities().catch(() => [] as CityKoloni[]);
              let nearest: CityKoloni | null = null;
              let best = Infinity;
              for (const city of cities) {
                const d = distanceKm(pos.coords.latitude, pos.coords.longitude, city.latitude, city.longitude);
                if (d < best) {
                  best = d;
                  nearest = city;
                }
              }
              await applyCity(nearest);
            },
            () => applyCity(null),
            { timeout: 6000, maximumAge: 600_000 },
          );
        } else {
          await applyCity(null);
        }
      } catch {
        await applyCity(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const { city, page, loading, error } = state;
  const shoppingLabel = city ? `LokalMart ${city.city}` : 'LokalMart Mega Koloni';

  return (
    <>
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="eyebrow">BELANJA DI</div>
        <h1 className="page-title" style={{ fontSize: 26, marginTop: 2 }}>{shoppingLabel}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Produk terkurasi dari UMKM koloni. Diantar kurir atau ambil di toko.</p>
      </div>

      <div className="promo-banner">
        PROMO MEMBER MINGGU INI
        <small>Harga khusus member · belanja min. Rp 50 ribu gratis ongkir s/d Rp 10 ribu</small>
      </div>

      <div className="section-title">
        <h2>Produk Pilihan</h2>
        <Link href="/katalog">Lihat semua →</Link>
      </div>

      {loading && (
        <div className="grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 210 }} />)}
        </div>
      )}

      {!loading && error && (
        <div className="empty">
          <div className="msg msg-error" style={{ textAlign: 'left' }}>{error}</div>
          <button className="btn btn-gold btn-block" style={{ marginTop: 12 }} onClick={() => load(city)}>Coba Lagi</button>
        </div>
      )}

      {!loading && !error && page && page.products.length > 0 && (
        <div className="grid">
          {page.products.map((product) => <ProductCard key={product.odooId} product={product} />)}
        </div>
      )}

      {!loading && !error && page && page.products.length === 0 && (
        <div className="empty">Katalog segera hadir untuk koloni ini.<br />Pantau terus, atau lihat katalog Mega Koloni di menu Katalog.</div>
      )}

      <footer className="site">LokalMart — bagian dari ekosistem LokalMart (PT LokalKaryaBakti)<br />Belanja UMKM lokal, untung kembali ke warga.</footer>
    </>
  );
}
