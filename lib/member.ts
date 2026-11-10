/**
 * Member Lokalmart = res.partner di company LokalMart (Odoo = system of record).
 * Masuk TIDAK memakai password — cukup nomor WA (frictionless, selaras perilaku
 * pelanggan toko depan masjid). Keamanan: hanya data milik nomor itu yang ditampilkan.
 */
import { createOdooBridge } from './odooBridge';
import { odooConfigured } from './config';

const digits = (s: string) => String(s || '').replace(/\D/g, '');

export function normalizePhone(input: string): string {
  let d = digits(input);
  if (d.startsWith('62')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

export function phoneVariants(input: string): string[] {
  const core = normalizePhone(input);
  if (core.length < 8) return [digits(input)];
  return [`0${core}`, `62${core}`, `+62${core}`, core];
}

export type MemberLookup =
  | { ok: true; found: true; partner: { id: number; name: string }; orders: Array<{ id: number; name: string; date: string; total: number; state: string }> }
  | { ok: true; found: false }
  | { ok: false; error: string };

export async function lookupMemberByPhone(phone: string): Promise<MemberLookup> {
  if (!odooConfigured()) {
    return { ok: false, error: 'Toko sedang offline (Odoo belum dikonfigurasi). Coba lagi nanti atau pesan lewat WA.' };
  }
  const variants = phoneVariants(phone).filter(Boolean);
  if (!variants.length) return { ok: false, error: 'Nomor WA tidak valid.' };
  try {
    const odoo = await createOdooBridge();
    // Cocokkan ekor nomor (8 digit terakhir) agar tahan format 08.. / 628.. / +62..
    const core = normalizePhone(phone);
    const tail = core.slice(-8);
    const domain = ['|', ['phone', 'ilike', tail], ['mobile', 'ilike', tail]];
    const partners = await odoo.searchRead<{ id: number; name: string; phone?: string | false; mobile?: string | false }>(
      'res.partner',
      domain,
      ['id', 'name', 'phone', 'mobile'],
      { limit: 5 },
    );
    const partner = partners.find((p) => {
      const all = `${digits(p.phone || '')}${digits(p.mobile || '')}`;
      return all.includes(tail);
    }) ?? partners[0];

    if (!partner) return { ok: true, found: false };

    const orders = await odoo.searchRead<{ id: number; name: string; date_order: string; amount_total: number; state: string }>(
      'sale.order',
      [['partner_id', '=', partner.id]],
      ['id', 'name', 'date_order', 'amount_total', 'state'],
      { limit: 5, order: 'date_order desc' },
    ).catch(() => [] as Array<{ id: number; name: string; date_order: string; amount_total: number; state: string }>);

    return {
      ok: true,
      found: true,
      partner: { id: partner.id, name: partner.name },
      orders: orders.map((o) => ({ id: o.id, name: o.name, date: o.date_order, total: o.amount_total, state: o.state })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghubungi Odoo.';
    return { ok: false, error: message };
  }
}
