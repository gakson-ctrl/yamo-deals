'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatFCFA } from '@/lib/format';
import { PrepTimeModal } from './PrepTimeModal';
import type { OrderStatus } from '@/lib/supabase/types';

export interface MerchantOrder {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  created_at: string;
  prep_time_min: number | null;
  note_to_kitchen: string | null;
  customer_id: string;
  profiles: { display_name: string } | null;
  order_items: Array<{ id: string; name: string; quantity: number; unit_price: number }>;
}

interface MerchantOrderCardProps {
  order: MerchantOrder;
  onAccept: (orderId: string, prepTime: number) => Promise<void>;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
}

const STATUS_CHIP: Record<OrderStatus, string> = {
  pending:   'bg-yamo-mango-light text-amber-700',
  accepted:  'bg-yamo-mango-light text-amber-700',
  preparing: 'bg-blue-50 text-blue-600',
  ready:     'bg-yamo-fern-light text-yamo-fern',
  delivering:'bg-yamo-fern-light text-yamo-fern',
  delivered: 'bg-yamo-fern-light text-yamo-fern',
  cancelled: 'bg-yamo-fog text-yamo-ash',
};

export function MerchantOrderCard({
  order,
  onAccept,
  onUpdateStatus,
  onCancel,
}: MerchantOrderCardProps) {
  const t = useTranslations('merchant');
  const tCommon = useTranslations('common');
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const minutesAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const timeAgoStr = minutesAgo < 1 ? '< 1 min' : `${minutesAgo} min ${t('time_ago')}`;

  const wrap = async (fn: () => Promise<void>) => {
    setLoading(true);
    setErr('');
    try {
      await fn();
    } catch {
      setErr(t('error_action'));
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = Number(order.total_amount) + Number(order.delivery_fee);

  return (
    <>
      <div className="bg-yamo-white rounded-yamo-card shadow-sm p-4 mb-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-sora font-bold text-yamo-ebony text-base">
              {t('order_number')} #{order.id.slice(-6).toUpperCase()}
            </span>
            <p className="text-yamo-ash font-inter text-xs mt-0.5">{timeAgoStr}</p>
          </div>
          <span className={`rounded-yamo-chip px-2 py-1 text-xs font-inter font-semibold shrink-0 ml-2 ${STATUS_CHIP[order.status]}`}>
            {order.status}
          </span>
        </div>

        {/* Customer name */}
        {order.profiles && (
          <p className="text-yamo-ash font-inter text-xs mb-3">
            {t('customer')}&nbsp;:{' '}
            <span className="text-yamo-ebony font-medium">{order.profiles.display_name}</span>
          </p>
        )}

        {/* Items */}
        <div className="border-t border-yamo-fog pt-2 mb-2 space-y-1">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <span className="font-inter text-sm text-yamo-ebony">
                ×{item.quantity} {item.name}
              </span>
              <span className="font-inter text-sm text-yamo-ash shrink-0 ml-2">
                {formatFCFA(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Grand total */}
        <div className="flex justify-between items-center font-inter font-bold text-sm text-yamo-ebony border-t border-yamo-fog pt-2 mb-3">
          <span>Total</span>
          <span className="text-yamo-red">{formatFCFA(grandTotal)}</span>
        </div>

        {/* Kitchen note */}
        {order.note_to_kitchen && (
          <p className="text-xs font-inter text-yamo-ash italic mb-3 bg-yamo-cream rounded-yamo-chip px-2 py-1">
            &ldquo;{order.note_to_kitchen}&rdquo;
          </p>
        )}

        {/* Error */}
        {err && <p className="text-xs text-yamo-error mb-2 font-inter">{err}</p>}

        {/* Actions per status */}
        {order.status === 'pending' && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPrepModal(true)}
              className="flex-1 h-10 rounded-yamo-pill bg-yamo-red hover:bg-yamo-red-hover text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {t('accept_order')}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => wrap(() => onCancel(order.id))}
              className="flex-1 h-10 rounded-yamo-pill bg-yamo-fog text-yamo-ebony font-inter font-semibold text-sm transition-colors hover:bg-yamo-red-light disabled:opacity-50"
            >
              {loading ? '…' : t('reject_order')}
            </button>
          </div>
        )}

        {order.status === 'accepted' && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => wrap(() => onUpdateStatus(order.id, 'preparing'))}
              className="flex-1 h-10 rounded-yamo-pill bg-yamo-red hover:bg-yamo-red-hover text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '…' : t('start_preparing')}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => wrap(() => onCancel(order.id))}
              className="flex-1 h-10 rounded-yamo-pill bg-yamo-fog text-yamo-ebony font-inter font-semibold text-sm transition-colors hover:bg-yamo-red-light disabled:opacity-50"
            >
              {tCommon('cancel')}
            </button>
          </div>
        )}

        {order.status === 'preparing' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => wrap(() => onUpdateStatus(order.id, 'ready'))}
            className="w-full h-10 rounded-yamo-pill bg-yamo-fern hover:bg-green-700 text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '…' : t('mark_ready')}
          </button>
        )}

        {order.status === 'ready' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => wrap(() => onUpdateStatus(order.id, 'delivered'))}
            className="w-full h-10 rounded-yamo-pill bg-yamo-fern hover:bg-green-700 text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '…' : t('mark_delivered')}
          </button>
        )}
      </div>

      <PrepTimeModal
        isOpen={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        onConfirm={(prepTime) => { wrap(() => onAccept(order.id, prepTime)); }}
      />
    </>
  );
}
