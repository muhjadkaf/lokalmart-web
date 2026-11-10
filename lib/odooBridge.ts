/**
 * Minimal Odoo bridge untuk Lokalmart — HANYA server-side.
 * Pola sama dengan namlah-superapp (XML-RPC / JSON-2), disederhanakan:
 * read (search_read/read) + create + write, tanpa Studio/schema-gate.
 */
import * as xmlrpc from 'xmlrpc';
import { getOdooConfig, odooConfigured } from './config';

export type OdooDomain = unknown[];

export type OdooBridge = {
  uid: number;
  companyId: number;
  health(): Promise<Record<string, unknown>>;
  searchRead<T = Record<string, unknown>>(model: string, domain?: OdooDomain, fields?: string[], options?: { limit?: number; offset?: number; order?: string }): Promise<T[]>;
  read<T = Record<string, unknown>>(model: string, ids: number[], fields?: string[]): Promise<T[]>;
  create(model: string, values: Record<string, unknown>): Promise<number>;
  write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean>;
};

function makeXmlClient(url: string): xmlrpc.XmlRpcClient {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('ODOO_URL harus memakai http/https.');
  }
  const factory = parsed.protocol === 'https:' ? xmlrpc.createSecureClient : xmlrpc.createClient;
  return factory({ url, cookies: true, encoding: 'utf-8' });
}

function xmlCallAttempt(client: xmlrpc.XmlRpcClient, method: string, params: unknown[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

const RETRYABLE = /tag 'TITLE'|socket hang up|ECONNRESET|ETIMEDOUT|EAI_AGAIN|no response|parse error|status of 5/i;
const SAFE_TO_RETRY = new Set(['authenticate', 'version', 'search', 'search_read', 'search_count', 'read', 'fields_get']);

async function xmlCall(client: xmlrpc.XmlRpcClient, method: string, params: unknown[]): Promise<unknown> {
  const odooMethod = method === 'execute_kw' ? String(params[4] || '').toLowerCase() : method.toLowerCase();
  const retryable = SAFE_TO_RETRY.has(odooMethod);
  const delays = [0, 150, 450];
  let lastError: unknown;
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      return await xmlCallAttempt(client, method, params);
    } catch (error) {
      lastError = error;
      if (!retryable) break;
      const msg = String(error instanceof Error ? error.message : error || '');
      if (!RETRYABLE.test(msg) && !/XML-RPC fault/i.test(msg)) break;
    }
  }
  throw lastError;
}

export async function createOdooBridge(): Promise<OdooBridge> {
  const cfg = getOdooConfig();

  if (cfg.apiMode === 'json2') {
    return createJson2Bridge(cfg);
  }

  const common = makeXmlClient(`${cfg.url}/xmlrpc/2/common`);
  const object = makeXmlClient(`${cfg.url}/xmlrpc/2/object`);
  const uidRaw = await xmlCall(common, 'authenticate', [cfg.db, cfg.username, cfg.password, {}]);
  const uid = typeof uidRaw === 'number' ? uidRaw : 0;
  if (!uid) {
    throw new Error('Autentikasi Odoo gagal. Periksa ODOO_DB / ODOO_USERNAME / ODOO_PASSWORD (bot internal).');
  }

  const executeKw = <T,>(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}) =>
    xmlCall(object, 'execute_kw', [cfg.db, uid, cfg.password, model, method, args, kwargs]) as Promise<T>;

  return {
    uid,
    companyId: cfg.companyId,
    health: async () => {
      const version = await xmlCall(common, 'version', []).catch((e) => ({ error: String(e) }));
      return { authenticated: true, uid, apiMode: cfg.apiMode, version };
    },
    searchRead: async (model, domain = [], fields = [], options = {}) =>
      executeKw(model, 'search_read', [domain], {
        limit: options.limit ?? 200,
        offset: options.offset ?? 0,
        ...(fields.length ? { fields } : {}),
        ...(options.order ? { order: options.order } : {}),
      }),
    read: async (model, ids, fields = []) => executeKw(model, 'read', [ids], fields.length ? { fields } : {}),
    create: (model, values) => executeKw<number>(model, 'create', [values], {}),
    write: (model, ids, values) => executeKw<boolean>(model, 'write', [ids, values], {}),
  };
}

type Json2Cfg = ReturnType<typeof getOdooConfig>;

async function json2<T>(cfg: Json2Cfg, model: string, method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${cfg.url}/json/2/${model}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${cfg.password}`,
      'Content-Type': 'application/json; charset=utf-8',
      'X-Odoo-Database': cfg.db,
      'User-Agent': 'lokalmart-web-odoo-bridge',
    },
    body: JSON.stringify({ context: { lang: 'en_US' }, ...body }),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload ? String(payload.message) : res.statusText;
    throw new Error(`Odoo JSON-2 ${model}/${method} gagal: ${message}`);
  }
  return payload as T;
}

async function createJson2Bridge(cfg: Json2Cfg): Promise<OdooBridge> {
  const exec = <T,>(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}): Promise<T> => {
    if (method === 'search_read') return json2<T>(cfg, model, 'search_read', { domain: args[0] || [], fields: kwargs.fields, limit: kwargs.limit ?? 200, offset: kwargs.offset ?? 0, order: kwargs.order });
    if (method === 'read') return json2<T>(cfg, model, 'read', { ids: args[0] || [], fields: kwargs.fields });
    if (method === 'create') return json2<T>(cfg, model, 'create', { vals_list: [args[0]] });
    if (method === 'write') return json2<T>(cfg, model, 'write', { ids: args[0], values: args[1] });
    return json2<T>(cfg, model, method, { args, ...kwargs });
  };
  const context = await json2<{ uid?: number }>(cfg, 'res.users', 'context_get', {});
  const uid = Number(context?.uid) || 0;
  return {
    uid,
    companyId: cfg.companyId,
    health: async () => ({ authenticated: true, uid, apiMode: cfg.apiMode }),
    searchRead: (model, domain = [], fields = [], options = {}) =>
      exec(model, 'search_read', [domain], { fields, limit: options.limit ?? 200, offset: options.offset ?? 0, order: options.order }),
    read: (model, ids, fields = []) => exec(model, 'read', [ids], { fields }),
    create: (model, values) => exec<number>(model, 'create', [values]),
    write: (model, ids, values) => exec<boolean>(model, 'write', [ids, values]),
  };
}

/** Status ringkas tanpa melempar — aman untuk endpoint /api/health. */
export function odooBridgeStatus() {
  return {
    configured: odooConfigured(),
    apiMode: getOdooConfigSafe(),
    writes: ['1', 'true', 'yes', 'on'].includes((process.env.ODOO_WRITES || '').toLowerCase()),
  };
}

function getOdooConfigSafe(): 'xmlrpc' | 'json2' {
  return (process.env.ODOO_API_MODE || 'xmlrpc').toLowerCase() === 'json2' ? 'json2' : 'xmlrpc';
}
