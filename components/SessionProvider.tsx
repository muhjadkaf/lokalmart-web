'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import type { SessionIdentity } from '@/lib/types';

type SessionContextValue = {
  identity: SessionIdentity | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const PUBLIC_PATHS = ['/login', '/register', '/info'];

export function SessionProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<SessionIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const session = await apiFetch<Record<string, unknown>>('/api/auth/session');
      if (session['authenticated'] !== true) {
        setIdentity({ authenticated: false, verified: false });
        return;
      }
      const identityRes = await apiFetch<Record<string, unknown>>('/api/auth/identity');
      const user = (session['user'] as Record<string, unknown> | undefined) ?? {};
      const merged: SessionIdentity = {
        authenticated: true,
        semutId: (identityRes['semutId'] as string | undefined) ?? null,
        koloniCode: (identityRes['koloniCode'] as string | undefined) ?? null,
        roleCode: (identityRes['roleCode'] as string | undefined) ?? null,
        partnerId: typeof identityRes['partnerId'] === 'number' ? (identityRes['partnerId'] as number) : null,
        uid: typeof identityRes['uid'] === 'number' ? (identityRes['uid'] as number) : typeof user.uid === 'number' ? (user.uid as number) : null,
        name: (identityRes['name'] as string | undefined) ?? (user.name as string | undefined) ?? (user.login as string | undefined) ?? null,
        login: (identityRes['login'] as string | undefined) ?? (user.login as string | undefined) ?? null,
        verified: identityRes['ok'] === true,
        namaSapaan: (identityRes['namaSapaan'] as string | undefined) ?? null,
      };
      setIdentity(merged);
    } catch {
      setIdentity({ authenticated: false, verified: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setIdentity({ authenticated: false, verified: false });
    router.push('/login');
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Gerbang login: selain path publik wajib login.
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!identity?.authenticated && !isPublic) {
      const next = encodeURIComponent(pathname + (typeof window !== 'undefined' ? window.location.search : ''));
      router.replace(`/login?next=${next}`);
    }
  }, [identity, loading, pathname, router]);

  return <SessionContext.Provider value={{ identity, loading, refresh, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession harus dipakai di dalam SessionProvider');
  return ctx;
}
