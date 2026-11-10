import { tokoInfo, waLink } from '@/lib/config-public';

export default function TopBar() {
  const toko = tokoInfo();
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="logo-badge" aria-hidden="true">L</div>
        <div>
          <h1>{toko.nama}</h1>
          <div className="tagline">{toko.tagline}</div>
        </div>
        <a className="topbar-wa" href={waLink(`Halo ${toko.nama}! Saya mau tanya.`)} target="_blank" rel="noopener noreferrer">WA {toko.wa}</a>
      </div>
      <div className="topbar-addr">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" stroke="#ffd98a" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.6" fill="#ffd98a"/></svg>
        <span>{toko.alamat} · {toko.jam}</span>
      </div>
    </header>
  );
}
