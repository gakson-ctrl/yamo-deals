'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { IconShoppingBag, IconRotate } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/cart-store';
import { formatFCFA, formatDate } from '@/lib/format';

type OrderStatus =
  | 'pending' | 'accepted' | 'preparing' | 'ready'
  | 'delivering' | 'delivered' | 'cancelled';

type HistoryOrder = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  restaurant_id: string;
  created_at: string;
  restaurants: { name: string } | null;
  order_items: Array<{
    id: string;
    menu_item_id: string | null;
    name: string;
    unit_price: number;
    quantity: number;
  }>;
};

const STATUS_CHIP: Record<OrderStatus, string> = {
  pending:    'bg-yamo-mango-light text-yamo-mango-dark',
  accepted:   'bg-yamo-fog text-yamo-ebony',
  preparing:  'bg-yamo-fog text-yamo-ebony',
  ready:      'bg-yamo-fern-light text-yamo-fern',
  delivering: 'bg-yamo-fog text-yamo-ebony',
  delivered:  'bg-yamo-fern-light text-yamo-fern',
  cancelled:  'bg-yamo-red-light text-yamo-error',
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const rawLocale = useLocale();
  const locale: 'fr' | 'en' = rawLocale === 'en' ? 'en' : 'fr';

  const { addItem } = useCartStore();
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }

        const { data: rawOrders } = await (
          supabase.from('orders') as ReturnType<typeof supabase.from>
        )
          .select(`
            id, status, total_amount, delivery_fee, restaurant_id, created_at,
            restaurants(name),
            order_items(id, menu_item_id, name, unit_price, quantity)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        setOrders((rawOrders as HistoryOrder[] | null) ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [router]);

  const handleReorder = (order: HistoryOrder) => {
    const restaurantName = order.restaurants?.name ?? '';

    order.order_items.forEach(item => {
      if (!item.menu_item_id) return;
      for (let n = 0; n < item.quantity; n++) {
        addItem(
          { id: item.menu_item_id, name: item.name, price: Number(item.unit_price) },
          order.restaurant_id,
          restaurantName,
          Number(order.delivery_fee),
        );
      }
    });

    router.push(`/customer/restaurant/${order.restaurant_id}`);
  };

  return (
    <div className="min-h-dvh bg-yamo-cream pb-24">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-yamo-white border-b border-yamo-fog px-4 pt-14 pb-4">
        <h1 className="font-sora font-bold text-xl text-yamo-ebony">
          {t('history_title')}
        </h1>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-4">

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-24 bg-yamo-white rounded-yamo-card border border-yamo-fog animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-center font-inter text-sm text-yamo-ash py-12">
            {tCommon('error')}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-yamo-fog flex items-center justify-center">
              <IconShoppingBag size={30} className="text-yamo-ash" />
            </div>
            <p className="font-sora font-semibold text-yamo-ash text-sm text-center">
              {t('no_orders')}
            </p>
            <Link
              href="/customer"
              className="text-yamo-red font-sora font-semibold text-sm"
            >
              {t('back_home')}
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map(order => {
              const grandTotal = Number(order.total_amount) + Number(order.delivery_fee);
              const chipStyle = STATUS_CHIP[order.status] ?? 'bg-yamo-fog text-yamo-ash';

              return (
                <li key={order.id}>
                  <Link
                    href={`/customer/orders/${order.id}`}
                    className="block bg-yamo-white rounded-yamo-card border border-yamo-fog p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Restaurant name + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-sora font-bold text-sm text-yamo-ebony truncate flex-1">
                        {order.restaurants?.name ?? '—'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-yamo-chip text-[10px] font-sora font-bold flex-none ${chipStyle}`}>
                        {t(`status_${order.status}` as Parameters<typeof t>[0])}
                      </span>
                    </div>

                    {/* Date + total */}
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-xs text-yamo-ash">
                        {formatDate(order.created_at, locale)}
                      </span>
                      <span className="font-sora font-semibold text-sm text-yamo-mango-dark">
                        {formatFCFA(grandTotal)}
                      </span>
                    </div>
                  </Link>

                  {/* Reorder CTA — outside the Link to avoid nested interactive elements */}
                  {order.status === 'delivered' && order.order_items.length > 0 && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="
                        mt-1.5 w-full h-9 rounded-yamo-pill
                        border border-yamo-red text-yamo-red
                        font-sora font-semibold text-xs
                        flex items-center justify-center gap-1.5
                        hover:bg-yamo-red-light transition-colors
                      "
                    >
                      <IconRotate size={14} />
                      {t('reorder')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
