'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import {
  MerchantOrderCard,
  type MerchantOrder,
} from '@/components/merchant/MerchantOrderCard';
import type { OrderStatus } from '@/lib/supabase/types';

type Tab = 'new' | 'preparing' | 'ready' | 'all';

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  new:       ['pending', 'accepted'],
  preparing: ['preparing'],
  ready:     ['ready'],
  all:       ['pending', 'accepted', 'preparing', 'ready'],
};

interface LiveOrdersClientProps {
  restaurantId: string;
  initialOrders: MerchantOrder[];
}

function playNewOrderBeep() {
  if (typeof window === 'undefined' || document.hidden) return;
  try {
    const ctx = new AudioContext();
    const note = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.start(start);
      osc.stop(start + 0.15);
    };
    void ctx.resume().then(() => {
      note(880, ctx.currentTime);
      note(1108, ctx.currentTime + 0.22);
    });
  } catch {
    // AudioContext may be unavailable — ignore
  }
}

export function LiveOrdersClient({ restaurantId, initialOrders }: LiveOrdersClientProps) {
  const t = useTranslations('merchant');
  const [orders, setOrders] = useState<MerchantOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<Tab>('new');
  const [connected, setConnected] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Tab title badge — reflects pending order count
  useEffect(() => {
    const count = orders.filter(o => o.status === 'pending').length;
    document.title = count > 0
      ? `🔴 ${count} nouvelles — YaMo Merchant`
      : 'YaMo Deals';
    return () => { document.title = 'YaMo Deals'; };
  }, [orders]);

  // Realtime subscription: re-fetch the full order row on any change
  useEffect(() => {
    const channel = supabase
      .channel(`merchant:orders:${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          if (payload.eventType === 'DELETE') return;

          const orderId = (payload.new as { id: string }).id;
          const newStatus = (payload.new as { status: string }).status;

          // New order → beep
          if (payload.eventType === 'INSERT') {
            playNewOrderBeep();
          }

          // Terminal statuses: remove from live list
          if (newStatus === 'delivered' || newStatus === 'cancelled') {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            return;
          }

          // Re-fetch with joins (no profiles join — RLS blocks merchant reading customer profiles)
          const { data } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
            .select(`
              id, status, total_amount, delivery_fee, created_at,
              prep_time_min, note_to_kitchen, customer_id,
              order_items(id, name, unit_price, quantity)
            `)
            .eq('id', orderId)
            .single() as { data: MerchantOrder | null; error: unknown };

          if (!data) return;

          setOrders(prev => {
            const idx = prev.findIndex(o => o.id === orderId);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data;
              return next;
            }
            // New order not yet in list
            return [data, ...prev];
          });
        },
      )
      .subscribe(status => setConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, supabase]);

  const callApi = async (orderId: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      throw new Error(json.error ?? 'Erreur');
    }
  };

  const handleAccept = (orderId: string, prepTime: number) =>
    callApi(orderId, { action: 'accept', prep_time_min: prepTime });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) =>
    callApi(orderId, { action: 'update_status', new_status: newStatus });

  const handleCancel = (orderId: string) =>
    callApi(orderId, { action: 'cancel' });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'new',       label: t('tab_new') },
    { key: 'preparing', label: t('tab_preparing') },
    { key: 'ready',     label: t('tab_ready') },
    { key: 'all',       label: t('tab_all') },
  ];

  const filteredOrders = orders.filter(o =>
    (TAB_STATUSES[activeTab] as string[]).includes(o.status),
  );

  const newCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Sticky tab bar — sits below the 56px layout header */}
      <div className="sticky top-14 z-30 bg-yamo-cream px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-sora font-bold text-xl text-yamo-ebony">{t('live_orders')}</h1>
          <span className={`
            text-xs font-inter font-medium px-2 py-1 rounded-yamo-chip
            ${connected ? 'bg-yamo-fern-light text-yamo-fern' : 'bg-yamo-fog text-yamo-ash'}
          `}>
            {connected ? '● Live' : '○ …'}
          </span>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-3 border-b border-yamo-fog"
          style={{ scrollbarWidth: 'none' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-shrink-0 rounded-yamo-pill px-4 py-1.5
                font-inter font-medium text-sm
                transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? 'bg-yamo-red text-yamo-white'
                  : 'bg-yamo-white text-yamo-ash hover:text-yamo-ebony'
                }
              `}
            >
              {tab.label}
              {tab.key === 'new' && newCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yamo-mango text-white text-[10px] font-bold align-middle">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 px-4 pt-4 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-yamo-ash font-inter text-sm">{t('no_pending')}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <MerchantOrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onUpdateStatus={handleUpdateStatus}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  );
}
