'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { prettyKoloni, roleLabel } from '@/lib/types';

type Modal = 'sapaan' | 'pin' | 'password' | null;

export default function AkunPage() {
  const { identity, logout, refresh } = useSession();
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // sapaan
  const [sapaan, setSapaan] = useState('');
  // pin
  const [pinPassword, setPinPassword] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  // password
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  const semutId = identity?.semutId ?? identity?.login ?? 'LOKALMART';
  const displayName = identity?.name ?? identity?.login ?? 'Mitra LokalMart';

  function openModal(next: Modal) {
    setMsg(null);
    setSapaan(identity?.namaSapaan ?? '');
    setPinPassword(''); setPinValue(''); setPinConfirm('');
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setModal(next);
  }

  async function saveSapaan() {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const trimmed = sapaan.trim();
      const result = trimmed
        ? await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/sapaan', { method: 'POST', body: { namaSapaan: trimmed } })
        : await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/sapaan', { method: 'DELETE' });
      if (result.ok !== true) setMsg({ kind: 'err', text: result.error ?? 'Gagal menyimpan nama sapaan.' });
      else { setMsg({ kind: 'ok', text: 'Nama sapaan tersimpan.' }); await refresh(); }
    } catch (err) {
      setMsg({ kind: 'err', text: apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal menyimpan.') });
    } finally { setBusy(false); }
  }

  async function savePin() {
    if (busy) return;
    if (pinValue.length !== 6 || !/^\d{6}$/.test(pinValue)) { setMsg({ kind: 'err', text: 'PIN harus 6 digit angka.' }); return; }
    if (pinValue !== pinConfirm) { setMsg({ kind: 'err', text: 'Konfirmasi PIN tidak cocok.' }); return; }
    setBusy(true); setMsg(null);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/pin', { method: 'POST', body: { currentPassword: pinPassword, pin: pinValue } });
      if (result.ok !== true) setMsg({ kind: 'err', text: result.error ?? 'Gagal mengatur PIN.' });
      else setMsg({ kind: 'ok', text: 'PIN berhasil diatur.' });
    } catch (err) {
      setMsg({ kind: 'err', text: apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal mengatur PIN.') });
    } finally { setBusy(false); }
  }

  async function deletePin() {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/pin', { method: 'DELETE', body: { currentPassword: pinPassword } });
      if (result.ok !== true) setMsg({ kind: 'err', text: result.error ?? 'Gagal menghapus PIN.' });
      else setMsg({ kind: 'ok', text: 'PIN dihapus.' });
    } catch (err) {
      setMsg({ kind: 'err', text: apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal menghapus PIN.') });
    } finally { setBusy(false); }
  }

  async function savePassword() {
    if (busy) return;
    if (pwNew.length < 6) { setMsg({ kind: 'err', text: 'Password baru minimal 6 karakter.' }); return; }
    if (pwNew !== pwConfirm) { setMsg({ kind: 'err', text: 'Konfirmasi password tidak cocok.' }); return; }
    setBusy(true); setMsg(null);
    try {
      const result = await apiFetch<{ ok?: boolean; error?: string }>('/api/auth/change-password', { method: 'POST', body: { currentPassword: pwCurrent, newPassword: pwNew } });
      if (result.ok !== true) setMsg({ kind: 'err', text: result.error ?? 'Gagal mengganti password.' });
      else { setMsg({ kind: 'ok', text: 'Password berhasil diganti.' }); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }
    } catch (err) {
      setMsg({ kind: 'err', text: apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal mengganti password.') });
    } finally { setBusy(false); }
  }

  const barWidths = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 3, 1, 2, 4];

  return (
    <div className="section" style={{ paddingTop: 18 }}>
      {/* Kartu member — cerminan APK */}
      <div className="member-card">
        <div className="lbl">MEMBER LOKALMART</div>
        <div className="nm">{displayName}</div>
        <div className="barcode" aria-hidden="true">{barWidths.map((w, i) => <i key={i} style={{ width: w * 2 }} />)}</div>
        <div className="semut">{semutId}</div>
        <div className="foot">
          <span>{prettyKoloni(identity?.koloniCode)}</span>
          <span>{roleLabel(identity?.roleCode).toUpperCase()}</span>
        </div>
      </div>

      <div className="eyebrow" style={{ margin: '18px 0 8px' }}>PENGATURAN &amp; BANTUAN</div>
      <div className="settings-list">
        <button className="settings-item" onClick={() => openModal('sapaan')}>
          <span className="lead"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
          <span><b>Nama Sapaan</b><small>{identity?.namaSapaan?.trim() ? `Dipanggil "${identity.namaSapaan.trim()}" — ketuk untuk mengubah.` : 'Belum diatur — ketuk untuk mengatur.'}</small></span>
          <span className="trail">›</span>
        </button>
        <button className="settings-item" onClick={() => openModal('pin')}>
          <span className="lead"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v10H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg></span>
          <span><b>PIN 6-digit</b><small>Buat/ubah PIN untuk masuk tanpa mengetik password.</small></span>
          <span className="trail">›</span>
        </button>
        <button className="settings-item" onClick={() => openModal('password')}>
          <span className="lead"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
          <span><b>Ganti Password</b><small>Perbarui password akun Anda.</small></span>
          <span className="trail">›</span>
        </button>
        <button className="settings-item" onClick={() => router.push('/info')}>
          <span className="lead"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
          <span><b>Pusat Bantuan LokalMart</b><small>Ada kendala pesanan? Hubungi layanan pelanggan.</small></span>
          <span className="trail">›</span>
        </button>
        <div className="settings-item" style={{ cursor: 'default' }}>
          <span className="lead" style={{ color: identity?.verified ? 'var(--green)' : 'var(--faint)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></span>
          <span><b>{identity?.verified ? 'Sesi terverifikasi' : 'Sesi tidak terverifikasi'}</b><small>{identity?.verified ? 'Akun Anda terhubung.' : 'Sistem verifikasi tidak terjangkau — data mungkin lawas.'}</small></span>
        </div>
      </div>

      <button className="btn btn-danger btn-block" style={{ marginTop: 16 }} onClick={() => logout()}>Keluar</button>
      <p style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--faint)', marginTop: 14 }}>LokalMart v0.2.0 · PT LokalKaryaBakti</p>

      {/* ===== MODALS ===== */}
      {modal && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,.55)' }} onClick={() => setModal(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 640, borderRadius: '22px 22px 0 0', borderBottom: 'none', padding: 18 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <b style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16 }}>{modal === 'sapaan' ? 'Nama Sapaan' : modal === 'pin' ? 'PIN 6-digit' : 'Ganti Password'}</b>
              <button className="icon-btn" onClick={() => setModal(null)} aria-label="Tutup" style={{ width: 34, height: 34 }}>✕</button>
            </div>
            {msg && <div className={`msg ${msg.kind === 'ok' ? 'msg-success' : 'msg-error'}`} style={{ marginBottom: 10 }}>{msg.text}</div>}

            {modal === 'sapaan' && (
              <div className="field">
                <label htmlFor="sapaan">Nama panggilan di kartu member</label>
                <input id="sapaan" value={sapaan} onChange={(e) => setSapaan(e.target.value)} placeholder="mis. Budi" maxLength={40} autoFocus />
                <div className="hint">Kosongkan untuk kembali pakai nama asli.</div>
                <button className="btn btn-gold btn-block" style={{ marginTop: 12 }} onClick={saveSapaan} disabled={busy}>Simpan</button>
              </div>
            )}

            {modal === 'pin' && (
              <div className="form" style={{ padding: 0 }}>
                <div className="field"><label htmlFor="pinpw">Password saat ini</label><input id="pinpw" type="password" value={pinPassword} onChange={(e) => setPinPassword(e.target.value)} autoComplete="current-password" autoFocus /></div>
                <div className="field"><label htmlFor="pinnew">PIN baru (6 digit)</label><input id="pinnew" inputMode="numeric" pattern="\\d{6}" maxLength={6} value={pinValue} onChange={(e) => setPinValue(e.target.value)} placeholder="••••••" /></div>
                <div className="field"><label htmlFor="pincf">Konfirmasi PIN</label><input id="pincf" inputMode="numeric" pattern="\\d{6}" maxLength={6} value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} placeholder="••••••" /></div>
                <button className="btn btn-gold btn-block" onClick={savePin} disabled={busy}>Simpan PIN</button>
                <button className="btn btn-ghost btn-block" onClick={deletePin} disabled={busy}>Hapus PIN</button>
              </div>
            )}

            {modal === 'password' && (
              <div className="form" style={{ padding: 0 }}>
                <div className="field"><label htmlFor="pwcur">Password saat ini</label><input id="pwcur" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" autoFocus /></div>
                <div className="field"><label htmlFor="pwnew">Password baru (min. 6 karakter)</label><input id="pwnew" type="password" minLength={6} value={pwNew} onChange={(e) => setPwNew(e.target.value)} autoComplete="new-password" /></div>
                <div className="field"><label htmlFor="pwcf">Konfirmasi password baru</label><input id="pwcf" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} autoComplete="new-password" /></div>
                <button className="btn btn-gold btn-block" onClick={savePassword} disabled={busy}>Simpan Password</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
