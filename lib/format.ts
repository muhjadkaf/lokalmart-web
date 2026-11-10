export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTanggalID(iso: string | false | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function waLink(message: string): string {
  const base = process.env.NEXT_PUBLIC_TOKO_WA_LINK || '6281234567890';
  return `https://wa.me/${base}?text=${encodeURIComponent(message)}`;
}
