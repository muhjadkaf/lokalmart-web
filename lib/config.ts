const clean = (v: string | undefined) => v?.trim() || '';
const boolEnv = (name: string) => ['1', 'true', 'yes', 'on'].includes(clean(process.env[name]).toLowerCase());

export function odooConfigured() {
  return Boolean(clean(process.env.ODOO_URL) && clean(process.env.ODOO_DB) && clean(process.env.ODOO_USERNAME) && clean(process.env.ODOO_PASSWORD));
}

export function getOdooApiMode(): 'xmlrpc' | 'json2' {
  return clean(process.env.ODOO_API_MODE).toLowerCase() === 'json2' ? 'json2' : 'xmlrpc';
}

export function getOdooConfig() {
  const url = clean(process.env.ODOO_URL).replace(/\/+$/, '');
  if (!odooConfigured()) {
    throw new Error('Odoo belum dikonfigurasi. Isi ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD di Environment Variables.');
  }
  return {
    url,
    db: clean(process.env.ODOO_DB),
    username: clean(process.env.ODOO_USERNAME),
    password: clean(process.env.ODOO_PASSWORD),
    apiMode: getOdooApiMode(),
    companyId: Number(clean(process.env.ODOO_COMPANY_ID) || '1'),
    writesEnabled: boolEnv('ODOO_WRITES'),
    enrichCatalog: boolEnv('ODOO_ENRICH_CATALOG'),
  };
}

export function tokoInfo() {
  return {
    nama: clean(process.env.NEXT_PUBLIC_TOKO_NAMA) || 'LOKALMART',
    tagline: clean(process.env.NEXT_PUBLIC_TOKO_TAGLINE) || 'Mitra Belanja Keluarga Indonesia',
    alamat: clean(process.env.NEXT_PUBLIC_TOKO_ALAMAT) || 'Depan Masjid, Jl. Raya Toko Kelontong No. 88',
    wa: clean(process.env.NEXT_PUBLIC_TOKO_WA) || '0812-3456-7890',
    waLinkNumber: clean(process.env.NEXT_PUBLIC_TOKO_WA_LINK) || '6281234567890',
    jam: clean(process.env.NEXT_PUBLIC_TOKO_JAM) || 'Senin–Sabtu 07.00–21.00 WIB · Minggu 07.00–12.00 WIB',
  };
}
