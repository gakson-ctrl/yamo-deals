'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { formatFCFA, formatTime } from '@/lib/format';
import { PrepTimeModal } from '@/components/merchant/PrepTimeModal';
import type { OrderStatus } from '@/lib/supabase/types';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

interface Timestamp {
  labelKey: string;
  value: string | null;
}

export interface OrderDetailProps {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  note_to_kitchen: string | null;
  prep_time_min: number | null;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  customer_id: string;
  customer_name: string | null;
  restaurant_name: string;
  items: OrderItem[];
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

export function OrderDetailClient(props: OrderDetailProps) {
  const t = useTranslations('merchant');
  const tCommon = useTranslations('common');

  const [status, setStatus] = useState<OrderStatus>(props.status);
  const [prepTimeMin, setPrepTimeMin] = useState<number | null>(props.prep_time_min);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const callApi = async (body: Record<string, unknown>) => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/orders/${props.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(json.error ?? t('error_action'));
        return false;
      }
      return true;
    } catch {
      setErr(t('error_action'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (prepTime: number) => {
    const ok = await callApi({ action: 'accept', prep_time_min: prepTime });
    if (ok) { setStatus('accepted'); setPrepTimeMin(prepTime); }
  };

  const handleUpdateStatus = async (next: OrderStatus) => {
    const ok = await callApi({ action: 'update_status', new_status: next });
    if (ok) setStatus(next);
  };

  const handleCancel = async () => {
    const ok = await callApi({ action: 'cancel' });
    if (ok) setStatus('cancelled');
  };

  const subtotal = props.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const grandTotal = subtotal + Number(props.delivery_fee);

  const timestamps: Timestamp[] = [
    { labelKey: 'step_confirmed',    value: props.created_at },
    { labelKey: 'status_accepting',  value: props.accepted_at },
    { labelKey: 'status_ready_ts',   value: props.ready_at },
    { labelKey: 'status_delivered_ts', value: props.delivered_at },
  ];

  const tsLabel: Record<string, string> = {
    step_confirmed:      'Confirmée',
    status_accepting:    'Acceptée',
    status_ready_ts:     'Prête',
    status_delivered_ts: 'Livrée',
  };

  return (
    <>
      <div className="min-h-dvh bg-yamo-cream pb-10">
        {/* Header */}
        <div className="sticky top-14 z-20 bg-yamo-white border-b border-yamo-fog px-4 h-12 flex items-center gap-3">
          <Link href="/merchant/orders" className="text-yamo-ash hover:text-yamo-ebony transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <span className="font-sora font-bold text-base text-yamo-ebony flex-1">
            #{props.id.slice(-6).toUpperCase()}
          </span>
          <span className={`rounded-yamo-chip px-2 py-1 text-xs font-inter font-semibold ${STATUS_CHIP[status]}`}>
            {status}
          </span>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Customer */}
          <div className="bg-yamo-white rounded-yamo-card p-4">
            <p className="text-yamo-ash font-inter text-xs mb-1">{t('customer')}</p>
            <p className="font-inter font-semibold text-sm text-yamo-ebony">
              {props.customer_name ?? `#${props.customer_id.slice(-6).toUpperCase()}`}
            </p>
          </div>

          {/* Items */}
          <div className="bg-yamo-white rounded-yamo-card overflow-hidden">
            <div className="px-4 py-3 border-b border-yamo-fog">
              <p className="font-sora font-bold text-sm text-yamo-ebony">{props.restaurant_name}</p>
            </div>
            {props.items.map(item => (
              <div key={item.id} className="flex justify-between items-center px-4 py-2.5 border-b border-yamo-fog last:border-0">
                <div>
                  <span className="font-inter text-sm text-yamo-ebony">×{item.quantity} {item.name}</span>
                  <p className="font-inter text-xs text-yamo-ash">{formatFCFA(item.unit_price)} / u.</p>
                </div>
                <span className="font-inter text-sm font-medium text-yamo-ebony ml-4">
                  {formatFCFA(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
            {/* Totals */}
            <div className="px-4 py-2.5 border-t border-yamo-fog space-y-1.5 bg-yamo-cream/30">
              <div className="flex justify-between font-inter text-sm text-yamo-ash">
                <span>Sous-total</span>
                <span>{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between font-inter text-sm text-yamo-ash">
                <span>Livraison</span>
                <span>{formatFCFA(Number(props.delivery_fee))}</span>
              </div>
              <div className="flex justify-between font-sora font-bold text-sm text-yamo-ebony pt-1 border-t border-yamo-fog">
                <span>Total</span>
                <span className="text-yamo-red">{formatFCFA(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-yamo-white rounded-yamo-card p-4">
            <p className="text-yamo-ash font-inter text-xs mb-1">Adresse de livraison</p>
            <p className="font-inter text-sm text-yamo-ebony">{props.delivery_address}</p>
          </div>

          {/* Kitchen note */}
          {props.note_to_kitchen && (
            <div className="bg-yamo-white rounded-yamo-card p-4">
              <p className="text-yamo-ash font-inter text-xs mb-1">Note cuisine</p>
              <p className="font-inter text-sm text-yamo-ebony italic">&ldquo;{props.note_to_kitchen}&rdquo;</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-yamo-white rounded-yamo-card p-4">
            <p className="text-yamo-ash font-inter text-xs mb-3">Historique</p>
            <div className="space-y-2">
              {timestamps
                .filter(ts => ts.value !== null)
                .map(ts => (
                  <div key={ts.labelKey} className="flex justify-between items-center">
                    <span className="font-inter text-sm text-yamo-ebony">{tsLabel[ts.labelKey]}</span>
                    <span className="font-inter text-xs text-yamo-ash">
                      {formatTime(ts.value!, 'fr')}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Prep time chip */}
          {prepTimeMin && (
            <div className="bg-yamo-mango-light rounded-yamo-card px-4 py-3 flex justify-between items-center">
              <span className="font-inter text-sm text-yamo-ebony">{t('prep_time_label')}</span>
              <span className="font-sora font-bold text-sm text-amber-700">{prepTimeMin} min</span>
            </div>
          )}

          {/* Error */}
          {err && (
            <p className="text-xs text-yamo-error font-inter text-center">{err}</p>
          )}

          {/* Action buttons */}
          {status === 'pending' && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPrepModal(true)}
                className="flex-1 h-11 rounded-yamo-pill bg-yamo-red hover:bg-yamo-red-hover text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {t('accept_order')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCancel}
                className="flex-1 h-11 rounded-yamo-pill bg-yamo-fog text-yamo-ebony font-inter font-semibold text-sm hover:bg-yamo-red-light transition-colors disabled:opacity-50"
              >
                {loading ? '…' : t('reject_order')}
              </button>
            </div>
          )}

          {status === 'accepted' && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus('preparing')}
                className="flex-1 h-11 rounded-yamo-pill bg-yamo-red hover:bg-yamo-red-hover text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? '…' : t('start_preparing')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCancel}
                className="flex-1 h-11 rounded-yamo-pill bg-yamo-fog text-yamo-ebony font-inter font-semibold text-sm hover:bg-yamo-red-light transition-colors disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
            </div>
          )}

          {status === 'preparing' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('ready')}
              className="w-full h-11 rounded-yamo-pill bg-yamo-fern hover:bg-green-700 text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '…' : t('mark_ready')}
            </button>
          )}

          {status === 'ready' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('delivered')}
              className="w-full h-11 rounded-yamo-pill bg-yamo-fern hover:bg-green-700 text-yamo-white font-inter font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '…' : t('mark_delivered')}
            </button>
          )}
        </div>
      </div>

      <PrepTimeModal
        isOpen={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        onConfirm={prepTime => { void handleAccept(prepTime); }}
      />
    </>
  );
}
