'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconX, IconShoppingCart, IconTrash } from '@tabler/icons-react';
import { useCartStore } from '@/lib/cart-store';
import { formatFCFA } from '@/lib/format';

export function CartDrawer() {
  const router = useRouter();
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');

  const { items, restaurantName, deliveryFee, isDrawerOpen, updateQuantity, closeDrawer } =
    useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (deliveryFee ?? 0);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  const handleCheckout = () => {
    closeDrawer();
    router.push('/customer/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={closeDrawer}
        className={`
          fixed inset-0 z-[60] bg-yamo-ebony/50
          transition-opacity duration-300
          ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tCart('title')}
        className={`
          fixed bottom-0 left-1/2 -translate-x-1/2
          w-full max-w-[430px]
          z-[70] bg-yamo-white rounded-t-[20px]
          flex flex-col
          max-h-[80dvh]
          transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-none">
          <div className="w-10 h-1 rounded-full bg-yamo-fog" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-yamo-fog flex-none">
          <div>
            <h2 className="font-sora font-bold text-base text-yamo-ebony">{tCart('title')}</h2>
            {restaurantName && (
              <p className="font-inter text-yamo-ash text-xs mt-0.5">{restaurantName}</p>
            )}
          </div>
          <button
            onClick={closeDrawer}
            aria-label={tCommon('close')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yamo-fog transition-colors"
          >
            <IconX size={18} className="text-yamo-ash" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-yamo-fog flex items-center justify-center">
                <IconShoppingCart size={28} className="text-yamo-ash" />
              </div>
              <div className="text-center">
                <p className="font-sora font-semibold text-yamo-ebony text-sm mb-1">
                  {tCart('empty')}
                </p>
                <p className="font-inter text-yamo-ash text-xs">{tCart('empty_hint')}</p>
              </div>
              <Link
                href="/customer"
                onClick={closeDrawer}
                className="text-yamo-red font-sora font-semibold text-sm"
              >
                {tCart('browse_restaurants')}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-yamo-fog px-5">
              {items.map(item => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sora font-semibold text-sm text-yamo-ebony truncate">
                      {item.name}
                    </p>
                    <p className="font-inter text-xs text-yamo-mango-dark font-semibold mt-0.5">
                      {formatFCFA(item.price)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Retirer un"
                      className="w-7 h-7 rounded-full bg-yamo-red-light text-yamo-red font-bold text-base flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-inter font-semibold text-sm text-yamo-ebony">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Ajouter un"
                      className="w-7 h-7 rounded-full bg-yamo-red text-yamo-white font-bold text-base flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      aria-label={`Supprimer ${item.name}`}
                      className="w-7 h-7 flex items-center justify-center text-yamo-ash hover:text-yamo-error transition-colors"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — always visible when items exist */}
        {items.length > 0 && (
          <div className="flex-none border-t border-yamo-fog px-5 pt-4 pb-6">
            {/* Subtotal / fee / total */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between font-inter text-sm text-yamo-ash">
                <span>{tCart('subtotal')}</span>
                <span>{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between font-inter text-sm text-yamo-ash">
                <span>{tCart('delivery_fee')}</span>
                <span>{formatFCFA(deliveryFee ?? 0)}</span>
              </div>
              <div className="flex justify-between font-sora font-bold text-base text-yamo-ebony pt-1 border-t border-yamo-fog">
                <span>{tCart('total')}</span>
                <span className="text-yamo-red">{formatFCFA(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="
                w-full h-12 rounded-yamo-pill
                bg-yamo-red hover:bg-yamo-red-hover
                text-yamo-white font-sora font-bold text-sm
                transition-colors
              "
            >
              {tCart('checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
