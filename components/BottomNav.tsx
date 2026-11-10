'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

const items = [
  { href: '/', label: 'Beranda', icon: <path d="M4 11.5 12 4l8 7.5M6.5 10v9h11v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/katalog', label: 'Katalog', icon: <path d="M5 7h14l-1.2 12a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Zm3.5 0a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/member', label: 'Member', icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6.5 8a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/> },
  { href: '/info', label: 'Toko', icon: <path d="M5 10v9h14v-9M4 10l1.8-5h12.4L20 10M4 10h16M9.5 19v-5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {items.slice(0, 2).map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
          {item.label}
        </Link>
      ))}
      <Link href="/keranjang" className={pathname === '/keranjang' ? 'active cart-badge' : 'cart-badge'}>
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 9H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="11.5" cy="21" r="1.3" fill="currentColor"/><circle cx="16.5" cy="21" r="1.3" fill="currentColor"/>
        </svg>
        Keranjang
        {count > 0 && <b>{count > 99 ? '99+' : count}</b>}
      </Link>
      {items.slice(2).map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
