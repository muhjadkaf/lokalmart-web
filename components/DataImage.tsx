'use client';

import { useState } from 'react';

/** Gambar produk dengan fallback inisial bila src kosong/gagal dimuat. */
export default function DataImage({ image, name }: { image: string | null | undefined; name: string }) {
  const [failed, setFailed] = useState(false);
  const src = image ?? null;
  if (!src || failed) {
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    return <span className="thumb-fallback" aria-hidden="true">{initials}</span>;
  }
  const isData = src.startsWith('data:');
  return <img src={isData ? src : `data:image/jpeg;base64,${src}`} alt={name} loading="lazy" onError={() => setFailed(true)} />;
}
