'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { useSession } from '@/components/SessionProvider';

const SAVED_KEY = 'lokalmart-saved-accounts';

type SavedAccount = { identifier: string; name: string };

function loadSaved(): SavedAccount[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedAccount[]).slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveAccount(account: SavedAccount) {
  try {
    const next = [account, ...loadSaved().filter((a) => a.identifier !== account.identifier)].slice(0, 5);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    /* abaikan */
  }
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { refresh } = useSession();
  const [usePin, setUsePin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved] = useState<SavedAccount[]>(() => (typeof window === 'undefined' ? [] : loadSaved()));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/login', {
        method: 'POST',
        body: usePin ? { identifier: identifier.trim(), pin: secret.trim() } : { identifier: identifier.trim(), password: secret },
      });
      if (result.ok !== true) {
        setError(result.error || 'Login gagal.');
        setBusy(false);
        return;
      }
      saveAccount({ identifier: identifier.trim(), name: identifier.trim() });
      await refresh();
      router.replace(next);
    } catch (err) {
      setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Login gagal karena gangguan koneksi.'));
      setBusy(false);
    }
  }

  return (
    <div className="section" style={{ paddingTop: 34 }}>
      <div className="hero-card" style={{ textAlign: 'center', padding: '26px 20px' }}>
        <div className="logo-badge" style={{ margin: '0 auto 12px', width: 56, height: 56, fontSize: 26, borderRadius: 16 }}>L</div>
        <div className="eyebrow">SELAMAT DATANG</div>
        <h1 className="page-title" style={{ fontSize: 26, margin: '6px 0 4px' }}>Masuk LokalMart</h1>
        <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>Login dengan email, nomor HP/WA, atau Semut-ID kamu.</p>
      </div>

      <form onSubmit={onSubmit} className="form" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {error && <div className="msg msg-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="identifier">Email / Nomor HP / Semut-ID</label>
          <input id="identifier" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="mis. 0812-xxxx-xxxx" autoComplete="username" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="secret">{usePin ? 'PIN 6 digit' : 'Password'}</label>
          <input id="secret" required type={usePin ? 'password' : 'password'} inputMode={usePin ? 'numeric' : 'text'} pattern={usePin ? '\\d{6}' : undefined} maxLength={usePin ? 6 : undefined} value={secret} onChange={(e) => setSecret(secret)} placeholder={usePin ? '••••••' : 'Password akun'} autoComplete={usePin ? 'one-time-code' : 'current-password'} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={() => { setUsePin(!usePin); setSecret(''); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>
            {usePin ? 'Gunakan password' : 'Masuk dengan PIN'}
          </button>
          <Link href="/register" style={{ color: 'var(--ink)', fontSize: 12, fontWeight: 700 }}>Daftar akun →</Link>
        </div>

        <button className="btn btn-gold btn-block" type="submit" disabled={busy} style={{ padding: 15 }}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>

      {saved.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>AKUN TERSIMPAN</div>
          {saved.map((account) => (
            <button key={account.identifier} className="settings-item card" style={{ marginBottom: 8 }} onClick={() => { setIdentifier(account.identifier); setSecret(''); }}>
              <span className="lead" style={{ color: 'var(--gold)' }}>{account.identifier.slice(0, 1).toUpperCase()}</span>
              <span><b>{account.identifier}</b><small>Ketuk untuk mengisi otomatis</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="empty">Memuat…</div>}>
      <LoginInner />
    </Suspense>
  );
}
