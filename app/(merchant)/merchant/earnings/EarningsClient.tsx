'use client';
import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatFCFA, formatDate } from '@/lib/format';

type OrderData = { id: string; total_amount: number; created_at: string };
type Period = 'today' | 'week' | 'month';

interface Props {
  restaurantName: string;
  orders: OrderData[];
}

function periodStart(p: Period): Date {
  const d = new Date();
  if (p === 'today') {
    d.setHours(0, 0, 0, 0);
  } else if (p === 'week') {
    d.setDate(d.getDate() - 7);
  } else {
    d.setDate(d.getDate() - 30);
  }
  return d;
}

export function EarningsClient({ restaurantName, orders }: Props) {
  const t = useTranslations('earnings');
  const rawLocale = useLocale();
  const locale: 'fr' | 'en' = rawLocale === 'en' ? 'en' : 'fr';

  const [activePeriod, setActivePeriod] = useState<Period>('week');

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: t('today') },
    { key: 'week',  label: t('week') },
    { key: 'month', label: t('month') },
  ];

  const filteredOrders = useMemo(() => {
    const cutoff = periodStart(activePeriod);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, activePeriod]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((s, o) => s + Number(o.total_amount), 0),
    [filteredOrders],
  );
  const orderCount = filteredOrders.length;
  const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  // Bar chart: always last 7 days
  const dailyData = useMemo(() => {
    const result: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dayRevenue = orders
        .filter(o => {
          const t = new Date(o.created_at);
          return t >= start && t < end;
        })
        .reduce((s, o) => s + Number(o.total_amount), 0);

      result.push({
        label: start.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' })
          .slice(0, 2)
          .toUpperCase(),
        revenue: dayRevenue,
      });
    }
    return result;
  }, [orders, locale]);

  const maxBarRevenue = Math.max(...dailyData.map(d => d.revenue), 1);

  const handleExportCSV = () => {
    const periodLabel = activePeriod === 'today' ? 'aujourd-hui' : activePeriod === 'week' ? '7-jours' : '30-jours';
    const filename = `yamo-revenus-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`;

    const header = locale === 'fr'
      ? ['Date', 'Commande #', 'Montant FCFA']
      : ['Date', 'Order #', 'Amount FCFA'];

    const rows = filteredOrders.map(o => [
      formatDate(o.created_at, locale),
      `#${o.id.slice(-6).toUpperCase()}`,
      String(Math.round(Number(o.total_amount))),
    ]);

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const recentOrders = filteredOrders.slice(0, 10);

  return (
    <div className="px-4 pt-4 pb-8">

      {/* Page title */}
      <h1 className="font-sora font-bold text-xl text-yamo-ebony mb-1">{t('title')}</h1>
      <p className="font-inter text-xs text-yamo-ash mb-4">{restaurantName}</p>

      {/* Period tabs */}
      <div className="flex gap-2 mb-5">
        {PERIODS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActivePeriod(p.key)}
            className={`flex-1 py-2 rounded-yamo-pill font-inter font-semibold text-sm transition-colors ${
              activePeriod === p.key
                ? 'bg-yamo-red text-yamo-white'
                : 'bg-yamo-white text-yamo-ash hover:text-yamo-ebony border border-yamo-fog'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Hero revenue card */}
      <div className="rounded-yamo-card bg-yamo-red p-5 mb-4">
        <p className="font-inter text-sm font-medium text-yamo-white/80 mb-1">{t('revenue')}</p>
        <p className="font-sora font-bold text-[32px] text-yamo-white leading-tight">
          {formatFCFA(totalRevenue)}
        </p>
        <p className="font-inter text-sm text-yamo-white/70 mt-1">
          {orderCount} {orderCount === 1 ? 'commande' : 'commandes'}
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-yamo-white rounded-yamo-card p-4 border border-yamo-fog">
          <p className="font-inter text-xs text-yamo-ash mb-1">{t('orders')}</p>
          <p className="font-sora font-bold text-2xl text-yamo-ebony">{orderCount}</p>
        </div>
        <div className="bg-yamo-white rounded-yamo-card p-4 border border-yamo-fog">
          <p className="font-inter text-xs text-yamo-ash mb-1">{t('avg')}</p>
          <p className="font-sora font-bold text-2xl text-yamo-ebony">
            {avgOrder > 0 ? formatFCFA(avgOrder) : '—'}
          </p>
        </div>
      </div>

      {/* Bar chart — last 7 days */}
      <div className="bg-yamo-white rounded-yamo-card p-4 border border-yamo-fog mb-6">
        <p className="font-inter text-xs font-semibold text-yamo-ash mb-3">{t('chart_title')}</p>
        <div className="flex items-end gap-1.5 h-[100px]">
          {dailyData.map((day, i) => {
            const heightPct = Math.max((day.revenue / maxBarRevenue) * 100, day.revenue > 0 ? 6 : 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-[4px] transition-all ${day.revenue > 0 ? 'bg-yamo-red' : 'bg-yamo-fog'}`}
                    style={{ height: `${heightPct}%` }}
                    title={formatFCFA(day.revenue)}
                  />
                </div>
                <span className="text-[9px] font-inter text-yamo-ash leading-none">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mb-6">
        <h2 className="font-sora font-bold text-base text-yamo-ebony mb-3">{t('recent_orders')}</h2>

        {recentOrders.length === 0 ? (
          <div className="bg-yamo-white rounded-yamo-card p-6 text-center border border-yamo-fog">
            <p className="font-inter text-sm text-yamo-ash">{t('no_data')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recentOrders.map(order => (
              <li key={order.id} className="flex items-center justify-between bg-yamo-white rounded-yamo-card px-4 py-3 border border-yamo-fog">
                <div>
                  <span className="font-inter font-semibold text-sm text-yamo-ebony">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <p className="font-inter text-xs text-yamo-ash mt-0.5">
                    {formatDate(order.created_at, locale)}
                  </p>
                </div>
                <span className="font-sora font-bold text-sm text-yamo-red">
                  {formatFCFA(Number(order.total_amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Export CSV */}
      {filteredOrders.length > 0 && (
        <button
          type="button"
          onClick={handleExportCSV}
          className="w-full h-11 rounded-yamo-pill border-2 border-yamo-red text-yamo-red font-sora font-semibold text-sm hover:bg-yamo-red-light transition-colors"
        >
          ↓ {t('export')}
        </button>
      )}

    </div>
  );
}
