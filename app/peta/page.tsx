'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { rupiah, type MapPoint } from '@/lib/types';

export default function PetaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ ok?: boolean; points?: Array<Record<string, unknown>>; error?: string }>('/api/umkm/map-points');
        if (data.ok !== true) throw new Error(data.error || 'Gagal memuat titik toko.');
        const list = Array.isArray(data.points) ? data.points : [];
        setPoints(list.map((p) => ({
          partnerId: Number(p.partnerId ?? 0),
          koloniCode: String(p.koloniCode ?? ''),
          roleKind: String(p.roleKind ?? ''),
          name: String(p.name ?? 'Toko'),
          phone: String(p.phone ?? ''),
          street: String(p.street ?? ''),
          openHours: String(p.openHours ?? ''),
          storeDescription: String(p.storeDescription ?? ''),
          latitude: typeof p.latitude === 'number' ? p.latitude : null,
          longitude: typeof p.longitude === 'number' ? p.longitude : null,
          image: typeof p.image === 'string' ? p.image : null,
          products: Array.isArray(p.products) ? (p.products as Array<Record<string, unknown>>).map((pr) => ({
            submissionId: Number(pr.submissionId ?? 0),
            name: String(pr.name ?? 'Produk'),
            price: Number(pr.price ?? 0),
            uom: String(pr.uom ?? 'PCS'),
            sellOnLokalmart: pr.sellOnLokalmart !== false,
            image: typeof pr.image === 'string' ? pr.image : null,
          })) : [],
        })));
      } catch (err) {
        setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal memuat peta.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const located = useMemo(() => points.filter((p) => p.latitude != null && p.longitude != null), [points]);

  // Init Leaflet sekali (client-only)
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView([-8.172, 113.7], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      for (const point of located) {
        const marker = L.marker([point.latitude as number, point.longitude as number]).addTo(map);
        marker.bindTooltip(point.name, { direction: 'top' });
        marker.on('click', () => setSelected(point));
      }
      if (located.length) {
        const group = L.featureGroup(located.map((p) => L.marker([p.latitude as number, p.longitude as number])));
        map.fitBounds(group.getBounds().pad(0.2));
      }
      mapInstance.current = map;
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, located]);

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <div>
          <div className="eyebrow">PETA UMKM</div>
          <h2 style={{ marginTop: 2 }}>Titik toko di sekitar kamu</h2>
        </div>
        <small>{located.length} toko</small>
      </div>

      {error && <div className="msg msg-error" style={{ margin: '0 16px' }}>{error}</div>}

      <div className="peta-wrap">
        <div ref={mapRef} aria-label="Peta titik toko UMKM" />
      </div>

      <div className="section" style={{ paddingTop: 10 }}>
        {loading && [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
        {!loading && located.length === 0 && !error && <div className="empty">Belum ada toko yang terdaftar di peta.</div>}
        {!loading && located.map((point) => (
          <button key={point.partnerId} className="settings-item card" style={{ marginBottom: 8, width: '100%', textAlign: 'left' }} onClick={() => setSelected(point)}>
            <span className="lead" style={{ color: 'var(--gold)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{point.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
            <span><b>{point.name}</b><small>{point.street || 'Alamat belum diisi'}{point.openHours ? ` · ${point.openHours}` : ''}</small></span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.55)' }} onClick={() => setSelected(null)} />
          <div className="point-sheet" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 640, zIndex: 61, margin: 0, borderRadius: '22px 22px 0 0', maxHeight: '72dvh', overflowY: 'auto' }}>
            <div className="point-sheet-head">
              <div className="ava">{selected.image ? <img src={selected.image.startsWith('data:') ? selected.image : `data:image/jpeg;base64,${selected.image}`} alt={selected.name} /> : selected.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
                <div className="point-meta">{selected.street || 'Alamat belum diisi'}{selected.openHours ? <><br />{selected.openHours}</> : null}{selected.phone ? <><br />WA: {selected.phone}</> : null}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Tutup" style={{ width: 34, height: 34, flexShrink: 0 }}>✕</button>
            </div>
            {selected.storeDescription && <div style={{ padding: '0 14px 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, borderBottom: '1px solid var(--line)' }}>{selected.storeDescription}</div>}
            <div className="section" style={{ paddingTop: 10 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>PRODUK TOKO INI</div>
              {selected.products.length === 0 && <div className="empty" style={{ padding: '12px 4px' }}>Toko belum memajang produk di LokalMart.</div>}
              {selected.products.map((product) => (
                <div key={product.submissionId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div style={{ flex: 1, fontSize: 12.5 }}>{product.name}<div className="unit">per {product.uom}{product.sellOnLokalmart ? '' : ' · tidak dijual di LokalMart'}</div></div>
                  <div className="price" style={{ fontSize: 14 }}>{rupiah(product.price)}</div>
                </div>
              ))}
              <Link href="/katalog" className="btn btn-gold btn-block" style={{ marginTop: 12 }} onClick={() => setSelected(null)}>Belanja di Katalog</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
