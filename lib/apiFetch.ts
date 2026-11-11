'use client';

/** Fetch helper untuk browser → route proxy /api/* di domain ini. */
export async function apiFetch<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(path, {
    method: init.method ?? 'GET',
    headers: init.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const text = await response.text();
  let parsed: unknown = {};
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = { ok: false, error: 'Respons tidak valid.' }; }
  }
  return parsed as T;
}

export function apiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string' && obj.error) return obj.error;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
  }
  return fallback;
}
