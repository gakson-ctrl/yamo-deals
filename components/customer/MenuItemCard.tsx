'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { formatFCFA } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  const t = useTranslations('menu');

  return (
    <div className={`flex gap-3 py-3 ${!item.is_available ? 'opacity-50' : ''}`}>
      {/* Photo / gradient placeholder */}
      <div className="relative w-20 h-20 flex-none rounded-xl overflow-hidden bg-gradient-to-br from-yamo-mango-light to-yamo-red-light">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sora font-bold text-2xl text-yamo-red/30 select-none" aria-hidden>
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="font-sora font-semibold text-yamo-ebony text-sm leading-tight line-clamp-1">
            {item.name}
          </h4>
          {item.description && (
            <p className="font-inter text-yamo-ash text-xs mt-0.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-2">
          {/* Price chip */}
          <span className="font-sora font-bold text-sm text-yamo-mango-dark bg-yamo-mango-light px-2 py-0.5 rounded-yamo-chip">
            {formatFCFA(item.price)}
          </span>

          {/* Quantity controls */}
          {!item.is_available ? (
            <span className="text-[10px] font-sora font-semibold text-yamo-ash bg-yamo-fog px-2 py-0.5 rounded-yamo-chip">
              {t('unavailable')}
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={onAdd}
              aria-label={t('add_to_cart')}
              className="w-8 h-8 rounded-full bg-yamo-red hover:bg-yamo-red-hover flex items-center justify-center transition-colors"
            >
              <IconPlus size={16} className="text-yamo-white" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                aria-label={t('remove_item')}
                className="w-7 h-7 rounded-full border border-yamo-fog hover:bg-yamo-fog flex items-center justify-center transition-colors"
              >
                <IconMinus size={14} className="text-yamo-ebony" />
              </button>
              <span className="font-sora font-bold text-yamo-ebony text-sm w-4 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                aria-label={t('add_to_cart')}
                className="w-7 h-7 rounded-full bg-yamo-red hover:bg-yamo-red-hover flex items-center justify-center transition-colors"
              >
                <IconPlus size={14} className="text-yamo-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
