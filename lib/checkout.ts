/**
 * Checkout Lokalmart → Odoo `sale.order` di company LokalMart.
 * Harga & nama produk divalidasi di server dari seed (bukan dari client).
 * Produk Odoo dicocokkan via default_code (LM-*) lalu fallback ke nama.
 */
import { createOdooBridge } from './odooBridge';
import { getOdooConfig, odooConfigured } from './config';
import { getSeedProduct, type SeedProduct } from './seed-products';
import { waLink } from './format';

export type CheckoutItemInput = { id: string; qty: number };
export type CheckoutInput = {
  items: CheckoutItemInput[];
  member: { nama: string; wa: string; alamat: string };
  metode: 'pickup' | 'antar';
  catatan?: string;
};
export type CheckoutResult =
  | { ok: true; orderName: string; orderId: number; unmatched: string[]; waUrl: string; writesEnabled: boolean }
  | { ok: false; error: string };

const WA_REGEX = /^(0|62|\+62)8[0-9]{7,13}$/;

export async function runCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const cfg = (() => {
    try { return getOdooConfig(); } catch { return null; }
  })();
  if (!odooConfigured() || !cfg) {
    return { ok: false, error: 'Checkout online belum aktif (Odoo belum dikonfigurasi). Silakan pesan lewat WA.' };
  }
  if (!cfg.writesEnabled) {
    return { ok: false, error: 'Penulisan ke Odoo sedang dimatikan (ODOO_WRITES=false). Aktifkan setelah bot siap.' };
  }

  const member = input?.member;
  const nama = String(member?.nama || '').trim();
  const wa = String(member?.wa || '').replace(/[\s()-]/g, '');
  const alamat = String(member?.alamat || '').trim();
  const metode = input?.metode === 'antar' ? 'antar' : 'pickup';
  const catatan = String(input?.catatan || '').trim().slice(0, 500);

  if (nama.length < 3) return { ok: false, error: 'Nama minimal 3 karakter.' };
  if (!WA_REGEX.test(wa)) return { ok: false, error: 'Nomor WA tidak valid (contoh: 0812-3456-7890).' };
  if (metode === 'antar' && alamat.length < 10) return { ok: false, error: 'Untuk diantar, isi alamat lengkap minimal 10 karakter.' };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: 'Keranjang kosong.' };

  // Validasi item di server (harga tidak dipercaya dari client)
  const lines: Array<{ product: SeedProduct; qty: number; subtotal: number }> = [];
  for (const item of input.items.slice(0, 50)) {
    const qty = Math.floor(Number(item?.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 999) return { ok: false, error: 'Jumlah produk tidak wajar.' };
    const product = getSeedProduct(String(item?.id || ''));
    if (!product) return { ok: false, error: `Produk tidak dikenal: ${item?.id}` };
    lines.push({ product, qty, subtotal: product.hargaPromo * qty });
  }
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);

  try {
    const odoo = await createOdooBridge();

    // 1) Cari / buat partner (kunci: nomor WA, 8 digit terakhir)
    const tail = wa.replace(/\D/g, '').slice(-8);
    const existing = await odoo.searchRead<{ id: number; name: string }>(
      'res.partner',
      ['|', ['phone', 'ilike', tail], ['mobile', 'ilike', tail]],
      ['id', 'name'],
      { limit: 1 },
    );
    let partnerId: number;
    if (existing.length) {
      partnerId = existing[0].id;
      // Segarkan alamat/nama bila berubah (best effort)
      await odoo.write('res.partner', [partnerId], { name: nama, phone: wa, ...(metode === 'antar' ? { street: alamat } : {}) }).catch(() => true);
    } else {
      partnerId = await odoo.create('res.partner', {
        name: nama,
        phone: wa,
        mobile: wa,
        street: metode === 'antar' ? alamat : false,
        company_id: cfg.companyId,
        customer_rank: 1,
        type: 'contact',
        comment: 'Member Lokalmart — registrasi via web (lokalmart-web)',
      });
    }

    // 2) Cocokkan produk seed → product.product (default_code, fallback nama)
    const unmatched: string[] = [];
    const orderLines: Array<[number, number, Record<string, unknown>]> = [];
    for (const { product, qty } of lines) {
      let productId: number | null = null;
      if (product.defaultCode) {
        const byCode = await odoo.searchRead<{ id: number }>(
          'product.product',
          [['default_code', 'ilike', product.defaultCode], ['active', '=', true]],
          ['id'],
          { limit: 1 },
        ).catch(() => [] as Array<{ id: number }>);
        productId = byCode[0]?.id ?? null;
      }
      if (!productId) {
        const byName = await odoo.searchRead<{ id: number }>(
          'product.product',
          [['name', 'ilike', product.nama.split(' ').slice(0, 3).join(' ')], ['active', '=', true]],
          ['id'],
          { limit: 1 },
        ).catch(() => [] as Array<{ id: number }>);
        productId = byName[0]?.id ?? null;
      }
      if (!productId) {
        unmatched.push(product.nama);
        continue;
      }
      orderLines.push([0, 0, {
        product_id: productId,
        product_uom_qty: qty,
        price_unit: product.hargaPromo,
        name: `${product.nama} ${product.satuan} (promo member)`,
      }]);
    }

    const ringkasan = lines.map((l) => `${l.qty}× ${l.product.nama} @Rp ${l.product.hargaPromo.toLocaleString('id-ID')}`).join('\n');
    const note = [
      'Pesanan dari Lokalmart Web (lokalmart-web)',
      `Metode: ${metode === 'antar' ? 'Diantar ke alamat' : 'Pickup di toko (depan masjid)'}`,
      `WA: ${wa}`,
      alamat ? `Alamat: ${alamat}` : null,
      `Total (promo member): Rp ${total.toLocaleString('id-ID')}`,
      catatan ? `Catatan member: ${catatan}` : null,
      unmatched.length ? `Produk belum tertaut ke Odoo (manual saat dikasir): ${unmatched.join(', ')}` : null,
      '',
      ringkasan,
    ].filter(Boolean).join('\n');

    const orderId = await odoo.create('sale.order', {
      partner_id: partnerId,
      company_id: cfg.companyId,
      order_line: orderLines,
      note,
      client_order_ref: `LOKALMART-WEB-${Date.now().toString(36).toUpperCase()}`,
    });
    const [order] = await odoo.read<{ name: string }>('sale.order', [orderId], ['name']).catch(() => [{ name: `SO-${orderId}` }]);

    const waMessage = [
      `Halo Lokalmart! Saya ${nama}.`,
      `Saya baru saja order lewat web:`,
      ringkasan,
      `Total: Rp ${total.toLocaleString('id-ID')}`,
      `No. order Odoo: ${order?.name || orderId}`,
      `Metode: ${metode === 'antar' ? 'Diantar' : 'Ambil di toko'}`,
    ].join('\n');

    return { ok: true, orderName: order?.name || String(orderId), orderId, unmatched, waUrl: waLink(waMessage), writesEnabled: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan pesanan ke Odoo.';
    return { ok: false, error: `Pesanan belum tersimpan: ${message}` };
  }
}
