'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IconArrowLeft, IconShoppingCart, IconClock } from '@tabler/icons-react';
import { RatingBadge } from '@/components/shared/RatingBadge';
import { MenuItemCard } from '@/components/customer/MenuItemCard';
import { FloatingCartBar } from '@/components/customer/FloatingCartBar';
import { useCartStore } from '@/lib/cart-store';
import { formatFCFA } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface Props {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
}

export function RestaurantClient({ restaurant, categories, items }: Props) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tRes = useTranslations('restaurant');
  const tCart = useTranslations('cart');

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'avis' | 'infos'>('menu');

  const { addItem, removeItem, items: cartItems, openDrawer } = useCartStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getQuantity = (itemId: string) =>
    cartItems.find(i => i.id === itemId)?.quantity ?? 0;

  const groupedMenu = categories
    .map(cat => ({ category: cat, items: items.filter(item => item.category_id === cat.id) }))
    .filter(g => g.items.length > 0);

  const TAB_LABELS = {
    menu: tRes('tab_menu'),
    avis: tRes('tab_reviews'),
    infos: tRes('tab_info'),
  };

  return (
    <div className="min-h-dvh bg-yamo-cream pb-32">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header
        className={`
          sticky top-0 z-30 h-14 px-4
          flex items-center gap-3
          transition-colors duration-200
          ${scrolled ? 'bg-yamo-white shadow-yamo-card' : 'bg-transparent'}
        `}
      >
        <button
          onClick={() => router.back()}
          aria-label={tCommon('back')}
          className={`
            w-9 h-9 rounded-full flex-none flex items-center justify-center
            transition-colors
            ${scrolled
              ? 'text-yamo-ebony hover:bg-yamo-fog'
              : 'bg-yamo-white/90 text-yamo-ebony shadow-sm hover:bg-yamo-white'}
          `}
        >
          <IconArrowLeft size={20} />
        </button>

        {scrolled && (
          <h1 className="flex-1 font-sora font-semibold text-base text-yamo-ebony truncate">
            {restaurant.name}
          </h1>
        )}

        {scrolled && cartCount > 0 && (
          <button
            onClick={openDrawer}
            aria-label={tCart('view_cart')}
            className="relative w-9 h-9 flex-none flex items-center justify-center"
          >
            <IconShoppingCart size={22} className="text-yamo-ebony" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 bg-yamo-red rounded-full text-yamo-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        )}
      </header>

      {/* ── Cover photo ───────────────────────────────────────────────── */}
      <div className="relative -mt-14 h-[200px] overflow-hidden">
        {restaurant.cover_url ? (
          <Image
            src={restaurant.cover_url}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="430px"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-yamo-mango-light to-yamo-red-light flex items-center justify-center">
            <span className="font-sora font-bold text-[80px] leading-none text-yamo-red/30 select-none" aria-hidden>
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Open/closed badge */}
        <span
          className={`
            absolute bottom-3 left-4
            px-2 py-0.5 rounded-yamo-chip
            text-[10px] font-bold font-sora text-yamo-white
            ${restaurant.is_open ? 'bg-yamo-fern' : 'bg-yamo-ash'}
          `}
        >
          {restaurant.is_open ? tRes('open') : tRes('closed')}
        </span>
      </div>

      {/* ── Info block ────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-sora font-bold text-xl text-yamo-ebony mb-1">
          {restaurant.name}
        </h2>

        {restaurant.description && (
          <p className="font-inter text-yamo-ash text-sm mb-3 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-inter text-yamo-ash">
          <RatingBadge rating={restaurant.rating} count={restaurant.rating_count} size="md" />
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <IconClock size={12} aria-hidden />
            ~{restaurant.avg_prep_time} {tRes('minutes')}
          </span>
          <span aria-hidden>·</span>
          <span>
            {tRes('min_order')}{' '}
            <span className="font-semibold text-yamo-mango">{formatFCFA(restaurant.min_order)}</span>
          </span>
          <span aria-hidden>·</span>
          <span>
            {tRes('delivery_fee')}{' '}
            <span className="font-semibold text-yamo-mango">{formatFCFA(restaurant.delivery_fee)}</span>
          </span>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex border-b border-yamo-fog mx-4 mt-2">
        {(['menu', 'avis', 'infos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-2.5 font-sora font-semibold text-sm transition-colors
              ${activeTab === tab
                ? 'text-yamo-red border-b-2 border-yamo-red -mb-px'
                : 'text-yamo-ash hover:text-yamo-ebony'}
            `}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className="px-4">
        {activeTab === 'menu' && (
          <div className="pt-2">
            {groupedMenu.length === 0 ? (
              <p className="text-yamo-ash font-inter text-sm py-8 text-center">
                {tRes('no_menu')}
              </p>
            ) : (
              groupedMenu.map(({ category, items: catItems }) => (
                <section key={category.id} className="mt-4 first:mt-2">
                  <h3 className="font-sora font-bold text-yamo-ebony text-base pb-1 border-b border-yamo-fog mb-0.5">
                    {category.name}
                  </h3>
                  <div className="divide-y divide-yamo-fog">
                    {catItems.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={getQuantity(item.id)}
                        onAdd={() =>
                          addItem(
                            { id: item.id, name: item.name, price: Number(item.price) },
                            restaurant.id,
                            restaurant.name,
                            Number(restaurant.delivery_fee),
                          )
                        }
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {(activeTab === 'avis' || activeTab === 'infos') && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl" aria-hidden>🔮</span>
            <p className="font-sora font-semibold text-yamo-ash text-sm">
              {tRes('coming_soon_tab')}
            </p>
          </div>
        )}
      </div>

      {/* ── Floating cart bar ─────────────────────────────────────────── */}
      {cartCount > 0 && (
        <FloatingCartBar count={cartCount} total={cartTotal} onClick={openDrawer} />
      )}
    </div>
  );
}
