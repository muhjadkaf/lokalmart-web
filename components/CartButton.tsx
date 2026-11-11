'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function CartButton() {
  const { count } = useCart();
  return (
    <Link className="icon-btn" href="/keranjang" aria-label={`Keranjang, ${count} item`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 9H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11.5" cy="20.4" r="1.3" fill="currentColor"/><circle cx="16.5" cy="20.4" r="1.3" fill="currentColor"/>
      </svg>
      {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
