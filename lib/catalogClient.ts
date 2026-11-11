'use client';

/** Fetch helpers & state persistence (localStorage) untuk client. */
import { apiFetch } from './apiFetch';
import { shoppingKoloniCode, type CatalogPage, type CityKoloni } from './types';

const CITY_KEY = 'lokalmart-city-v1';

export function loadSavedCity(): CityKoloni | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CityKoloni>;
    if (typeof parsed.code !== 'string' || typeof parsed.city !== 'string') return null;
    return {
      code: parsed.code,
      city: parsed.city,
      province: String(parsed.province ?? ''),
      latitude: Number(parsed.latitude ?? 0),
      longitude: Number(parsed.longitude ?? 0),
    };
  } catch {
    return null;
  }
}

export function saveCity(city: CityKoloni) {
  try {
    window.localStorage.setItem(CITY_KEY, JSON.stringify(city));
  } catch {
    /* abaikan */
  }
}

export async function fetchCities(): Promise<CityKoloni[]> {
  const data = await apiFetch<{ ok?: boolean; cities?: Array<Record<string, unknown>> }>('/api/koloni/cities');
  if (data.ok !== true || !Array.isArray(data.cities)) return [];
  return data.cities.map((raw) => ({
    code: String(raw.code ?? ''),
    city: String(raw.city ?? raw.name ?? ''),
    province: String(raw.province ?? ''),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
  })).filter((c) => c.code && c.city);
}

function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function catalogScopeParams(city: CityKoloni | null): string[] {
  const code = shoppingKoloniCode(city);
  if (code === 'mega_lokalkaryabakti') return ['scope=mega'];
  return ['scope=koloni', `koloni=${encodeURIComponent(code)}`];
}

export async function fetchCatalogPage(opts: { offset?: number; limit?: number; category?: string; q?: string; city: CityKoloni | null }): Promise<CatalogPage> {
  const params = [...catalogScopeParams(opts.city), `offset=${opts.offset ?? 0}`, `limit=${opts.limit ?? 24}`];
  const category = (opts.category ?? '').trim();
  const q = (opts.q ?? '').trim();
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (q) params.push(`q=${encodeURIComponent(q)}`);
  const data = await apiFetch<Record<string, unknown>>(`/api/catalog/products?${params.join('&')}`);
  if (data.ok !== true) {
    throw new Error(String(data.error ?? 'Gagal memuat katalog.'));
  }
  const products = Array.isArray(data.products) ? (data.products as Array<Record<string, unknown>>) : [];
  const categories = Array.isArray(data.categories) ? (data.categories as Array<Record<string, unknown>>) : [];
  return {
    products: products.map((p) => ({
      odooId: Number(p.odooId ?? 0),
      name: String(p.name ?? 'Produk'),
      code: String(p.code ?? ''),
      price: Number(p.price ?? 0),
      formattedPrice: String(p.formattedPrice ?? ''),
      category: String(p.category ?? ''),
      uom: String(p.uom ?? 'Pc'),
      stock: typeof p.stock === 'number' ? p.stock : null,
      image: typeof p.image === 'string' && p.image ? p.image : null,
      storeName: String(p.storeName ?? ''),
    })),
    total: Number(data.total ?? products.length),
    hasMore: data.hasMore === true,
    categories: categories.map((c) => ({ name: String(c.name ?? ''), count: Number(c.count ?? 0) })),
  };
}
