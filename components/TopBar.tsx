import CartButton from '@/components/CartButton';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="logo-badge" aria-hidden="true">L</div>
        <div>
          <h1>LokalMart</h1>
          <div className="tagline">Belanja produk UMKM lokal</div>
        </div>
        <CartButton />
      </div>
    </header>
  );
}
