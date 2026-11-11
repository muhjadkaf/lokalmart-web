'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { useSession } from '@/components/SessionProvider';

type JoinableKoloni = { code: string; name: string };

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [kolonis, setKolonis] = useState<JoinableKoloni[]>([]);
  const [koloniCode, setKoloniCode] = useState('');
  const [loadingKolonis, setLoadingKolonis] = useState(true);
  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ semutId: string; portalLogin: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ kolonis?: Array<Record<string, unknown>> }>('/api/koloni/joinable');
        const list = (data.kolonis ?? []).map((k) => ({ code: String(k.code ?? '').trim(), name: String(k.name ?? '').trim() })).filter((k) => k.code);
        setKolonis(list);
        setKoloniCode(list[0]?.code ?? 'mega_lokalkaryabakti');
      } catch {
        setKolonis([{ code: 'mega_lokalkaryabakti', name: 'PT LokalKaryaBakti (Mega Koloni)' }]);
        setKoloniCode('mega_lokalkaryabakti');
      } finally {
        setLoadingKolonis(false);
      }
    })();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (!agreed) {
      setError('Centang persetujuan dulu ya.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string; semutId?: string; portalLogin?: string }>('/api/semut/register', {
        method: 'POST',
        body: { displayName: nama.trim(), phone: phone.trim(), koloniCode, password },
      });
      if (result.ok !== true) {
        setError(result.error ?? 'Pendaftaran gagal. Coba lagi.');
        setBusy(false);
        return;
      }
      setCredentials({ semutId: result.semutId ?? '', portalLogin: result.portalLogin ?? '' });
    } catch (err) {
      setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Pendaftaran gagal karena gangguan koneksi.'));
      setBusy(false);
    }
  }

  async function masukSekarang() {
    if (!credentials) return;
    setBusy(true);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/login', {
        method: 'POST',
        body: { identifier: credentials.portalLogin, password },
      });
      if (result.ok === true) {
        await refresh();
        router.replace('/');
        return;
      }
      setError(`Akun dibuat, tapi auto-login gagal: ${result.error ?? 'coba masuk manual.'}`);
      setBusy(false);
    } catch {
      setError('Akun dibuat, tapi auto-login gagal. Masuk manual dengan kredensial di atas.');
      setBusy(false);
    }
  }

  if (credentials) {
    return (
      <div className="form" style={{ paddingTop: 30 }}>
        <div className="msg msg-success" role="status">
          <strong style={{ fontSize: 15 }}>Akun berhasil dibuat</strong><br />
          Simpan data masuk ini baik-baik:
        </div>
        <div className="card card-pad">
          <div className="field">
            <label>Semut-ID</label>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.1em', color: 'var(--gold)', fontSize: 17 }}>{credentials.semutId}</div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Login portal</label>
            <div style={{ fontFamily: 'monospace', fontSize: 15 }}>{credentials.portalLogin}</div>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12 }}>Password yang kamu buat dipakai untuk masuk. Jangan dibagikan ke siapa pun.</p>
        </div>
        {error && <div className="msg msg-error">{error}</div>}
        <button className="btn btn-gold btn-block" onClick={masukSekarang} disabled={busy}>{busy ? 'Masuk…' : 'Masuk Sekarang'}</button>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: 18 }}>
      <div className="eyebrow">DAFTAR MEMBER</div>
      <h1 className="page-title" style={{ fontSize: 24, margin: '4px 0 2px' }}>Jadi Member LokalMart</h1>
      <p style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 14 }}>Pilih koloni kamu, isi data, langsung dapat akun belanja.</p>

      <form onSubmit={onSubmit} className="form" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {error && <div className="msg msg-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="nama">Nama lengkap</label>
          <input id="nama" required minLength={3} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. Budi Santoso" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="phone">Nomor HP/WA</label>
          <input id="phone" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812-3456-7890" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="koloni">Koloni</label>
          <select id="koloni" value={koloniCode} onChange={(e) => setKoloniCode(e.target.value)} disabled={loadingKolonis}>
            {kolonis.map((k) => <option key={k.code} value={k.code}>{k.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="password">Password (min. 6 karakter)</label>
          <input id="password" required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="confirm">Ulangi password</label>
          <input id="confirm" required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
          Saya setuju data (nama, WA, alamat) dipakai untuk transaksi &amp; pembukuan koloni sesuai aturan, dan tidak diperjualbelikan.
        </label>
        <button className="btn btn-gold btn-block" type="submit" disabled={busy || loadingKolonis} style={{ padding: 15 }}>
          {busy ? 'Mendaftarkan…' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
