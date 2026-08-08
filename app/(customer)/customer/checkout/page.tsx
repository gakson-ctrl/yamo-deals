'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  IconArrowLeft,
  IconMapPin,
  IconNotes,
  IconCash,
  IconLock,
} from '@tabler/icons-react';
import { useCartStore } from '@/lib/cart-store';
import { formatFCFA } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tCheckout = useTranslations('checkout');
  const tPayment = useTranslations('payment');
  const tCart = useTranslations('cart');
  const tOrder = useTranslations('order');

  const { items, restaurantId, deliveryFee, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Redirect to home when cart is empty (after hydration)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/customer');
    }
  }, [mounted, items.length, router]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    if (!restaurantId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          delivery_address: address,
          note: note || undefined,
        }),
      });

      const data = await res.json() as { order_id?: string; error?: string };

      if (!res.ok || !data.order_id) {
        setError(data.error ?? tCommon('error'));
        return;
      }

      clearCart();
      router.push(`/customer/confirmation/${data.order_id}`);
    } catch {
      setError(tCommon('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hydration loading state
  if (!mounted) {
    return <div className="min-h-dvh bg-yamo-cream" />;
  }

  // Guard: if empty after hydration, render nothing (redirect fires in useEffect)
  if (items.length === 0) return null;

  return (
    <div className="min-h-dvh bg-yamo-cream pb-28">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-yamo-white border-b border-yamo-fog h-14 px-4 flex items-center gap-3">
        <Link
          href="/customer"
          aria-label={tCommon('back')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-yamo-fog transition-colors flex-none"
        >
          <IconArrowLeft size={20} className="text-yamo-ebony" />
        </Link>
        <h1 className="font-sora font-bold text-base text-yamo-ebony flex-1 truncate">
          {tCheckout('title')}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">

        {/* ── Delivery address ────────────────────────────────────────── */}
        <section>
          <label className="flex items-center gap-2 font-sora font-bold text-sm text-yamo-ebony mb-2">
            <IconMapPin size={16} className="text-yamo-red flex-none" />
            {tCheckout('delivery_address')}
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={tCheckout('address_placeholder')}
            className="
              w-full h-11 px-3 rounded-yamo-input
              border border-yamo-fog
              font-inter text-sm text-yamo-ebony placeholder:text-yamo-ash
              bg-yamo-white
              focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red/30
              transition
            "
          />
        </section>

        {/* ── Note to kitchen ──────────────────────────────────────────── */}
        <section>
          <label className="flex items-center gap-2 font-sora font-bold text-sm text-yamo-ebony mb-2">
            <IconNotes size={16} className="text-yamo-ash flex-none" />
            {tCheckout('note_label')}
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={tCheckout('note_placeholder')}
            rows={3}
            className="
              w-full px-3 py-2.5 rounded-yamo-input
              border border-yamo-fog
              font-inter text-sm text-yamo-ebony placeholder:text-yamo-ash
              bg-yamo-white resize-none
              focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red/30
              transition
            "
          />
        </section>

        {/* ── Payment method ──────────────────────────────────────────── */}
        <section>
          <p className="font-sora font-bold text-sm text-yamo-ebony mb-2">
            {tCheckout('payment_method')}
          </p>
          <div className="space-y-2">
            {/* Cash — active */}
            <div className="flex items-center gap-3 p-3 rounded-yamo-card bg-yamo-white border-2 border-yamo-red">
              <div className="w-9 h-9 rounded-full bg-yamo-red-light flex items-center justify-center flex-none">
                <IconCash size={18} className="text-yamo-red" />
              </div>
              <div className="flex-1">
                <p className="font-sora font-semibold text-sm text-yamo-ebony">{tPayment('cash')}</p>
                <p className="font-inter text-xs text-yamo-ash">{tPayment('cash_description')}</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-yamo-red flex-none flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yamo-red" />
              </div>
            </div>

            {/* Disabled methods */}
            {(['possa', 'momo', 'om'] as const).map(method => (
              <div
                key={method}
                className="flex items-center gap-3 p-3 rounded-yamo-card bg-yamo-white border border-yamo-fog opacity-50 cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-full bg-yamo-fog flex items-center justify-center flex-none">
                  <IconLock size={16} className="text-yamo-ash" />
                </div>
                <div className="flex-1">
                  <p className="font-sora font-semibold text-sm text-yamo-ash">{tPayment(method)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-yamo-chip bg-yamo-fog text-yamo-ash font-inter text-[10px] font-medium whitespace-nowrap">
                  {tPayment('coming_soon')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Order recap ─────────────────────────────────────────────── */}
        <section>
          <p className="font-sora font-bold text-sm text-yamo-ebony mb-2">
            {tCheckout('order_summary')}
          </p>
          <div className="bg-yamo-white rounded-yamo-card border border-yamo-fog divide-y divide-yamo-fog overflow-hidden">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center px-4 py-2.5">
                <span className="font-inter text-sm text-yamo-ebony">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-inter text-sm text-yamo-ash">
                  {formatFCFA(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="font-inter text-sm text-yamo-ash">{tCart('subtotal')}</span>
              <span className="font-inter text-sm text-yamo-ash">{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="font-inter text-sm text-yamo-ash">{tCart('delivery_fee')}</span>
              <span className="font-inter text-sm text-yamo-ash">{formatFCFA(deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="font-sora font-bold text-sm text-yamo-ebony">{tCart('total')}</span>
              <span className="font-sora font-bold text-sm text-yamo-red">{formatFCFA(total)}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="font-inter text-sm text-yamo-error text-center">{error}</p>
        )}
      </form>

      {/* ── Fixed bottom CTA ────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-yamo-white border-t border-yamo-fog px-4 py-4">
        <button
          type="button"
          disabled={isSubmitting || !address.trim()}
          onClick={handleSubmit}
          className="
            w-full h-12 rounded-yamo-pill
            bg-yamo-red hover:bg-yamo-red-hover
            text-yamo-white font-sora font-bold text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isSubmitting ? tCommon('loading') : tCheckout('place_order')}
        </button>
      </div>
    </div>
  );
}
