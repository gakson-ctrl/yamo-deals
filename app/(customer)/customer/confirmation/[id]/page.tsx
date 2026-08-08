import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { IconCheck, IconMapPin } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/server';
import { formatFCFA } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Commande confirmée — YaMo Deals' };

export default async function ConfirmationPage({ params }: Props) {
  const supabase = createClient();
  const t = await getTranslations('order');
  const tCommon = await getTranslations('common');
  const tCart = await getTranslations('cart');

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Fetch order — RLS ensures customer sees own orders only
  const { data: rawOrder } = await (
    supabase.from('orders') as ReturnType<typeof supabase.from>
  )
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single();

  const order = rawOrder as Order | null;
  if (!order) notFound();

  const estimatedMinutes = order.prep_time_min ?? 30;
  const grandTotal = Number(order.total_amount) + Number(order.delivery_fee);

  return (
    <div className="min-h-dvh bg-yamo-cream flex flex-col items-center px-4 pt-12 pb-10">

      {/* ── Green checkmark ─────────────────────────────────────────────── */}
      <div className="w-20 h-20 rounded-full bg-yamo-fern flex items-center justify-center mb-5 shadow-md">
        <IconCheck size={40} className="text-yamo-white" strokeWidth={2.5} />
      </div>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <h1 className="font-sora font-bold text-2xl text-yamo-ebony text-center mb-1">
        {t('confirmed')}
      </h1>
      <p className="font-inter text-yamo-ash text-sm text-center mb-8">
        {t('confirmed_subtitle')}
      </p>

      {/* ── Order card ──────────────────────────────────────────────────── */}
      <div className="w-full bg-yamo-white rounded-yamo-card border border-yamo-fog divide-y divide-yamo-fog overflow-hidden mb-6">
        {/* Order ID */}
        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="font-inter text-sm text-yamo-ash">{t('order_id')}</span>
          <span className="font-sora font-bold text-sm text-yamo-ebony">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Estimated time */}
        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="font-inter text-sm text-yamo-ash">{t('estimated_time')}</span>
          <span className="font-sora font-bold text-sm text-yamo-ebony">
            ~{estimatedMinutes} min
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="font-inter text-sm text-yamo-ash">{tCart('total')}</span>
          <span className="font-sora font-bold text-sm text-yamo-mango-dark">
            {formatFCFA(grandTotal)}
          </span>
        </div>

        {/* Delivery address */}
        <div className="flex items-start gap-3 px-4 py-3.5">
          <IconMapPin size={16} className="text-yamo-ash mt-0.5 flex-none" />
          <p className="font-inter text-sm text-yamo-ebony leading-relaxed">
            {order.delivery_address}
          </p>
        </div>
      </div>

      {/* ── Cash reminder ───────────────────────────────────────────────── */}
      <div className="w-full bg-yamo-mango-light rounded-yamo-card px-4 py-3 mb-8">
        <p className="font-inter text-sm text-yamo-ebony text-center">
          💵 {t('cash_reminder')}
        </p>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        <Link
          href={`/customer/orders/${order.id}`}
          className="
            block w-full h-12 rounded-yamo-pill
            bg-yamo-red hover:bg-yamo-red-hover
            text-yamo-white font-sora font-bold text-sm
            flex items-center justify-center
            transition-colors
          "
        >
          {t('track_order')}
        </Link>
        <Link
          href="/customer"
          className="
            block w-full h-12 rounded-yamo-pill
            border border-yamo-fog bg-yamo-white
            text-yamo-ebony font-sora font-semibold text-sm
            flex items-center justify-center
            hover:bg-yamo-fog transition-colors
          "
        >
          {t('back_home')}
        </Link>
      </div>
    </div>
  );
}
