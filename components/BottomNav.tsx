'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Beranda', icon: <path d="M4 11.5 12 4l8 7.5M6.5 10v9h11v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/peta', label: 'Peta', icon: <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Zm0-8.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/promo', label: 'Promo', icon: <path d="M4 9.5 9.5 4H20v10.5L14.5 20h-10zM14.5 9.5a1.5 1.5 0 1 0 0 .01" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/pesanan', label: 'Pesanan', icon: <path d="M6 3h9l4 4v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 21V4.5A1.5 1.5 0 0 1 6.5 3Zm3 7h6M9 14h6M9 17.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none"/> },
  { href: '/akun', label: 'Akun', icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8.5a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
