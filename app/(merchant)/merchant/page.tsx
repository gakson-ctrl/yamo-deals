import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatFCFA } from '@/lib/format';
import { StatCard } from '@/components/merchant/StatCard';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = { title: 'Tableau de bord' };

type RawRestaurant = { id: string; name: string; is_open: boolean };
type RawOrder = { id: string; total_amount: number; prep_time_min: number | null; status: string; created_at: string };

export default async function MerchantDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const t = await getTranslations('merchant');
  const tCommon = await getTranslations('common');

  // Merchant's restaurant
  const { data: rawRestaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id, name, is_open')
    .eq('owner_id', user.id)
    .single() as { data: RawRestaurant | null; error: unknown };

  if (!rawRestaurant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <p className="text-yamo-ash font-inter text-sm text-center">{tCommon('error')}</p>
      </div>
    );
  }

  const restaurant = rawRestaurant;

  // Today's orders
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: rawTodayOrders } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select('id, total_amount, prep_time_min, status, created_at')
    .eq('restaurant_id', restaurant.id)
    .gte('created_at', todayStart.toISOString()) as { data: RawOrder[] | null; error: unknown };

  const todayOrders = rawTodayOrders ?? [];
  const delivered = todayOrders.filter(o => o.status === 'delivered');
  const revenue = delivered.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const prepTimes = todayOrders.filter(o => o.prep_time_min != null).map(o => o.prep_time_min!);
  const avgPrep = prepTimes.length > 0
    ? Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length)
    : 0;

  // Recent pending orders (latest 3)
  const { data: rawPending } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select('id, total_amount, created_at, status')
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3) as { data: RawOrder[] | null; error: unknown };

  const pendingOrders = rawPending ?? [];

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Restaurant online/offline toggle */}
      <DashboardClient
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        initialIsOpen={restaurant.is_open}
        tOnline={t('online')}
        tOffline={t('offline')}
      />

      {/* Today's stats */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label={t('today_orders')} value={todayOrders.length} />
          <StatCard label={t('today_revenue')} value={formatFCFA(revenue)} />
          <StatCard
            label={t('avg_prep_time')}
            value={avgPrep > 0 ? `${avgPrep} min` : '—'}
          />
        </div>
      </section>

      {/* Pending orders preview */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sora font-bold text-base text-yamo-ebony">{t('live_orders')}</h2>
          <Link
            href="/merchant/orders"
            className="text-yamo-red font-inter text-sm font-medium"
          >
            {t('see_all_orders')}
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-yamo-white rounded-yamo-card p-6 text-center shadow-sm">
            <p className="text-yamo-ash font-inter text-sm">{t('no_pending')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingOrders.map(order => (
              <Link
                key={order.id}
                href="/merchant/orders"
                className="flex justify-between items-center bg-yamo-white rounded-yamo-card p-3 shadow-sm"
              >
                <div>
                  <span className="font-inter font-semibold text-sm text-yamo-ebony">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <p className="text-yamo-ash font-inter text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="font-inter font-bold text-sm text-yamo-red">
                  {formatFCFA(Number(order.total_amount))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-sora font-bold text-base text-yamo-ebony mb-3">{t('quick_actions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/merchant/earnings"
            className="bg-yamo-white rounded-yamo-card p-4 text-center shadow-sm hover:bg-yamo-red-light transition-colors"
          >
            <p className="font-inter font-semibold text-sm text-yamo-ebony">{t('see_earnings')}</p>
          </Link>
          <Link
            href="/merchant/menu"
            className="bg-yamo-white rounded-yamo-card p-4 text-center shadow-sm hover:bg-yamo-red-light transition-colors"
          >
            <p className="font-inter font-semibold text-sm text-yamo-ebony">{t('update_hours')}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
