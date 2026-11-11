/** Tipe data API — cerminan models.dart APK. */
export type SessionIdentity = {
  authenticated: boolean;
  semutId?: string | null;
  koloniCode?: string | null;
  roleCode?: string | null;
  partnerId?: number | null;
  uid?: number | null;
  name?: string | null;
  login?: string | null;
  verified: boolean;
  namaSapaan?: string | null;
};

export type CityKoloni = {
  code: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
};

export type CatalogCategory = { name: string; count: number };

export type CatalogProduct = {
  odooId: number;
  name: string;
  code: string;
  price: number;
  formattedPrice: string;
  category: string;
  uom: string;
  stock?: number | null;
  image?: string | null;
  storeName: string;
};

export type CatalogPage = {
  products: CatalogProduct[];
  total: number;
  hasMore: boolean;
  categories: CatalogCategory[];
};

export type CartItem = {
  odooId: number;
  name: string;
  price: number;
  image?: string | null;
  storeName: string;
  uom: string;
  qty: number;
};

export type MapPointProduct = {
  submissionId: number;
  name: string;
  price: number;
  uom: string;
  sellOnLokalmart: boolean;
  image?: string | null;
};

export type MapPoint = {
  partnerId: number;
  koloniCode: string;
  roleKind: string;
  name: string;
  phone: string;
  street: string;
  openHours: string;
  storeDescription: string;
  latitude: number | null;
  longitude: number | null;
  image?: string | null;
  products: MapPointProduct[];
};

export type CustomerOrder = {
  id: number;
  name: string;
  dateOrder: string;
  amountTotal: number;
  state: string;
  items: number;
  note: string;
};

export type CustomerSummary = {
  count: number;
  total: number;
  waiting: number;
  done: number;
};

export type CompareRow = {
  odooId: number;
  name: string;
  price: number;
  storeName: string;
  storeKind: string;
  inStock: boolean;
  matchScore: number;
};

export function prettyKoloni(code?: string | null): string {
  if (!code?.trim()) return 'Mega Koloni';
  const trimmed = code.trim();
  if (trimmed === 'mega_lokalkaryabakti') return 'Mega Koloni';
  const stripped = trimmed
    .replace(/^koloni_kota_/, '')
    .replace(/^koloni_/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  return words ? `Koloni ${words}` : 'Mega Koloni';
}

export function roleLabel(role?: string | null): string {
  switch (role) {
    case 'admin':
    case 'ratu':
      return 'Ratu Semut';
    case 'koperasi':
      return 'Koperasi';
    case 'kurir':
      return 'Kurir';
    case 'angkutan':
      return 'Angkutan';
    case 'kasir':
      return 'Kasir';
    case 'surveyor':
      return 'Surveyor';
    case 'umkm':
      return 'UMKM';
    default:
      return 'Member';
  }
}

/** shopping koloni: Jember → Mega Koloni; lainnya kota masing-masing */
export function shoppingKoloniCode(city?: Pick<CityKoloni, 'code' | 'city'> | null): string {
  if (city && city.city.trim().toLowerCase() === 'jember') return 'mega_lokalkaryabakti';
  return city?.code || 'mega_lokalkaryabakti';
}

export function rupiah(value: number): string {
  return `Rp ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
