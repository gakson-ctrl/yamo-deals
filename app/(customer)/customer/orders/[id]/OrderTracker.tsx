'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { IconCheck, IconPhone, IconX } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { formatFCFA, formatTime } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface Props {
  initialOrder: Order;
  restaurantName: string;
  orderItems: OrderItem[];
}

const STATUS_TO_STEP: Record<string, number> = {
  pending:   0,
  accepted:  0,
  preparing: 1,
  ready:     2,
  delivered: 4,
};

type StepState = 'completed' | 'active' | 'upcoming';

function getStepState(idx: number, status: string): StepState {
  if (status === 'cancelled') return idx === 0 ? 'active' : 'upcoming';
  const current = STATUS_TO_STEP[status] ?? 0;
  if (idx < current) return 'completed';
  if (idx === current) return 'active';
  return 'upcoming';
}

export function OrderTracker({ initialOrder, restaurantName, orderItems }: Props) {
  const t = useTranslations('order');
  const tCart = useTranslations('cart');
  const tTracking = useTranslations('tracking');
  const tToast = useTranslations('toast');
  const rawLocale = useLocale();
  const locale: 'fr' | 'en' = rawLocale === 'en' ? 'en' : 'fr';

  const [order, setOrder] = useState<Order>(initialOrder);
  const [connected, setConnected] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // Countdown (accepted_at + prep_time_min + 15 min delivery buffer)
  const [countdownMin, setCountdownMin] = useState<number | null>(null);
  useEffect(() => {
    const compute = () => {
      if (!order.accepted_at || !order.prep_time_min) {
        setCountdownMin(null);
        return;
      }
      const eta = new Date(order.accepted_at).getTime() + (order.prep_time_min + 15) * 60_000;
      setCountdownMin(Math.max(0, Math.ceil((eta - Date.now()) / 60_000)));
    };
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [order.accepted_at, order.prep_time_min]);

  // Cancel flow
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setCancelError(json.error ?? t('cancel_confirm'));
      } else {
        setShowCancelConfirm(false);
        // Realtime will push the cancelled status
      }
    } catch {
      setCancelError(t('cancelled_subtitle'));
    } finally {
      setCancelLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order:${initialOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${initialOrder.id}` },
        (payload) => {
          const updated = payload.new as Order;
          setOrder(updated);
          if (updated.status === 'accepted')  setToast(tToast('accepted'));
          if (updated.status === 'ready')     setToast(tToast('ready'));
          if (updated.status === 'delivered') setToast(tToast('delivered'));
        },
      )
      .subscribe(s => setConnected(s === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder.id]);

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const grandTotal = order.total_amount + order.delivery_fee;

  const STEPS: Array<{
    labelKey: 'step_confirmed' | 'status_preparing' | 'status_ready' | 'status_delivered';
    getTs: (o: Order) => string | null;
  }> = [
    { labelKey: 'step_confirmed',   getTs: o => o.created_at },
    { labelKey: 'status_preparing', getTs: o => o.accepted_at },
    { labelKey: 'status_ready',     getTs: o => o.ready_at },
    { labelKey: 'status_delivered', getTs: o => o.delivered_at },
  ];

  return (
    <div className="min-h-dvh bg-yamo-cream pb-10">

      {/* ── Toast ───────────────────────────────────────────────────── */}
      {toast && (
        <div className="
          fixed top-4 left-1/2 -translate-x-1/2 z-[100]
          max-w-[380px] w-[90%]
          bg-yamo-ebony text-yamo-white
          rounded-yamo-card px-4 py-3 shadow-xl
          flex items-center justify-between gap-3
          font-inter text-sm font-medium
        ">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-yamo-white border-b border-yamo-fog px-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-sora font-bold text-lg text-yamo-ebony">
            {t('tracking_title')}
          </h1>
          <span className={`
            px-2.5 py-1 rounded-yamo-chip text-[10px] font-sora font-bold
            flex items-center gap-1.5
            ${connected
              ? 'bg-yamo-fern-light text-yamo-fern'
              : 'bg-yamo-fog text-yamo-ash animate-pulse'}
          `}>
            {connected && <span className="w-1.5 h-1.5 rounded-full bg-yamo-fern" />}
            {connected ? t('live_badge') : t('connecting')}
          </span>
        </div>
        <p className="font-inter text-xs text-yamo-ash mt-1">
          {t('order_id')} {order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* ── Cancelled banner ────────────────────────────────────────── */}
        {isCancelled && (
          <div className="bg-yamo-red-light rounded-yamo-card p-4 flex items-start gap-3">
            <span className="text-2xl" aria-hidden>❌</span>
            <div>
              <p className="font-sora font-bold text-sm text-yamo-error">{t('cancelled_title')}</p>
              <p className="font-inter text-xs text-yamo-ash mt-0.5">{t('cancelled_subtitle')}</p>
            </div>
          </div>
        )}

        {/* ── Stepper ─────────────────────────────────────────────────── */}
        <div className="bg-yamo-white rounded-yamo-card border border-yamo-fog p-4">
          {STEPS.map((step, idx) => {
            const state = getStepState(idx, order.status);
            const ts = step.getTs(order);
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step.labelKey} className="flex gap-3.5">
                <div className="flex flex-col items-center flex-none">
                  <div className={`
                    w-6 h-6 rounded-full flex-none flex items-center justify-center
                    ${state === 'completed' ? 'bg-yamo-fern' : ''}
                    ${state === 'active' && !isCancelled ? 'bg-yamo-red' : ''}
                    ${state === 'active' && isCancelled ? 'bg-yamo-error' : ''}
                    ${state === 'upcoming' ? 'bg-yamo-fog' : ''}
                  `}>
                    {state === 'completed' && (
                      <IconCheck size={13} className="text-yamo-white" strokeWidth={2.5} />
                    )}
                    {state === 'active' && (
                      <span className="w-2 h-2 rounded-full bg-yamo-white animate-pulse" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 my-1 ${state === 'completed' ? 'bg-yamo-fern' : 'bg-yamo-fog'}`}
                      style={{ height: '2.5rem' }}
                    />
                  )}
                </div>
                <div className="flex-1 flex items-start justify-between pt-0.5">
                  <span className={`
                    font-sora font-semibold text-sm leading-none
                    ${state === 'completed' ? 'text-yamo-fern' : ''}
                    ${state === 'active' && !isCancelled ? 'text-yamo-red' : ''}
                    ${state === 'active' && isCancelled ? 'text-yamo-error' : ''}
                    ${state === 'upcoming' ? 'text-yamo-ash' : ''}
                  `}>
                    {t(step.labelKey)}
                  </span>
                  {ts && state !== 'upcoming' && (
                    <span className="font-inter text-xs text-yamo-ash ml-2 shrink-0">
                      {formatTime(ts, locale)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── ETA / countdown ─────────────────────────────────────────── */}
        {!isDelivered && !isCancelled && (
          <div className="bg-yamo-mango-light rounded-yamo-card px-4 py-3 flex items-center justify-between">
            {countdownMin !== null ? (
              <>
                <span className="font-inter text-sm text-yamo-ebony">
                  {tTracking('estimated')}
                </span>
                <span className="font-sora font-bold text-sm text-amber-700">
                  ~{countdownMin} {tTracking('countdown_unit')}
                </span>
              </>
            ) : (
              <span className="font-inter text-sm text-yamo-ash italic">
                {tTracking('waiting')}
              </span>
            )}
          </div>
        )}

        {/* ── Cancel (pending only) ────────────────────────────────────── */}
        {order.status === 'pending' && !showCancelConfirm && (
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="
              w-full h-11 rounded-yamo-pill
              border border-yamo-fog bg-yamo-white
              text-yamo-ash font-inter font-medium text-sm
              hover:border-yamo-error hover:text-yamo-error
              transition-colors
            "
          >
            {t('cancel_order')}
          </button>
        )}

        {order.status === 'pending' && showCancelConfirm && (
          <div className="bg-yamo-red-light rounded-yamo-card p-4">
            <p className="font-sora font-semibold text-sm text-yamo-error mb-3">
              {t('cancel_confirm')}
            </p>
            {cancelError && (
              <p className="text-xs text-yamo-error mb-2 font-inter">{cancelError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={cancelLoading}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 h-10 rounded-yamo-pill bg-yamo-white border border-yamo-fog text-yamo-ebony font-inter font-medium text-sm disabled:opacity-50"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancel}
                className="flex-1 h-10 rounded-yamo-pill bg-yamo-error text-yamo-white font-inter font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {cancelLoading ? '…' : t('cancel_order')}
              </button>
            </div>
          </div>
        )}

        {/* ── Order summary ───────────────────────────────────────────── */}
        <section>
          <h2 className="font-sora font-bold text-sm text-yamo-ebony mb-2">
            {t('items_ordered')}
          </h2>
          <div className="bg-yamo-white rounded-yamo-card border border-yamo-fog divide-y divide-yamo-fog overflow-hidden">
            <div className="px-4 py-2.5">
              <p className="font-inter text-xs text-yamo-ash">{restaurantName}</p>
            </div>
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center px-4 py-2.5">
                <span className="font-inter text-sm text-yamo-ebony">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-inter text-sm text-yamo-ash">
                  {formatFCFA(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="font-sora font-bold text-sm text-yamo-ebony">
                {tCart('total')}
              </span>
              <span className="font-sora font-bold text-sm text-yamo-red">
                {formatFCFA(grandTotal)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Contact restaurant ───────────────────────────────────────── */}
        <button
          disabled
          className="
            w-full h-12 rounded-yamo-pill
            border border-yamo-fog bg-yamo-white
            text-yamo-ash font-sora font-semibold text-sm
            flex items-center justify-center gap-2
            cursor-not-allowed opacity-60
          "
        >
          <IconPhone size={17} />
          {t('contact_restaurant')}
          <span className="ml-1 px-1.5 py-0.5 rounded-yamo-chip bg-yamo-fog text-yamo-ash text-[10px] font-inter">
            {t('coming_soon_contact')}
          </span>
        </button>

      </div>
    </div>
  );
}
