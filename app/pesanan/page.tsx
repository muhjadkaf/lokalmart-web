'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import { apiFetch, apiErrorMessage } from '@/lib/apiFetch';
import { rupiah, shortDate, type CustomerOrder, type CustomerSummary } from '@/lib/types';

export default function PesananPage() {
  const { identity, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [summary, setSummary] = useState<CustomerSummary>({ count: 0, total: 0, waiting: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!identity?.authenticated) {
      router.replace('/login?next=/pesanan');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ ok?: boolean; orders?: Array<Record<string, unknown>>; summary?: Record<string, unknown>; error?: string }>('/api/orders/mine');
        if (data.ok !== true) throw new Error(data.error || 'Gagal memuat pesanan.');
        const list = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list.map((o) => ({
          id: Number(o.id ?? 0),
          name: String(o.name ?? ''),
          dateOrder: String(o.dateOrder ?? ''),
          amountTotal: Number(o.amountTotal ?? 0),
          state: String(o.state ?? 'draft'),
          items: Number(o.items ?? 0),
          note: String(o.note ?? ''),
        })));
        const s = data.summary ?? {};
        setSummary({
          count: Number(s.count ?? 0),
          total: Number(s.total ?? 0),
          waiting: Number(s.waiting ?? 0),
          done: Number(s.done ?? 0),
        });
      } catch (err) {
        setError(apiErrorMessage(err instanceof Error ? { error: err.message } : null, 'Gagal memuat pesanan.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [identity, sessionLoading, router]);

  if (sessionLoading || loading) {
    return <div className="empty" style={{ paddingTop: 60 }}>Memuat pesanan…</div>;
  }

  return (
    <>
      <div className="section-title" style={{ paddingTop: 16 }}>
        <h2>Pesanan Saya</h2>
        <small>{summary.count} pesanan</small>
      </div>

      <div className="summary-grid">
        <div className="summary-cell"><b>{summary.count}</b><span>Total pesanan</span></div>
        <div className="summary-cell"><b style={{ fontSize: 14 }}>{rupiah(summary.total)}</b><span>Total belanja</span></div>
        <div className="summary-cell"><b style={{ color: 'var(--gold)' }}>{summary.waiting}</b><span>Menunggu</span></div>
      </div>

      {error && <div className="msg msg-error" style={{ margin: '0 16px' }}>{error}</div>}

      {!error && orders.length === 0 && (
        <div className="empty">Belum ada pesanan.<br />Yuk mulai belanja dari katalog.</div>
      )}

      {!error && orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <b>{order.name}</b>
            <span className={`state${order.state === 'sale' ? ' sale' : ''}`}>{order.state === 'sale' ? 'selesai' : order.state}</span>
          </div>
          <div style={{ marginTop: 6, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span>{shortDate(order.dateOrder)} · {order.items} item</span>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{rupiah(order.amountTotal)}</span>
          </div>
          {order.note && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--faint)', borderTop: '1px dashed var(--line)', paddingTop: 6 }}>{order.note}</div>}
        </article>
      ))}
    </>
  );
}
