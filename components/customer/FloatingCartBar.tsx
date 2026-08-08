'use client';
import { useTranslations } from 'next-intl';
import { IconShoppingCart } from '@tabler/icons-react';
import { formatFCFA } from '@/lib/format';

interface FloatingCartBarProps {
  count: number;
  total: number;
  onClick?: () => void;
}

export function FloatingCartBar({ count, total, onClick }: FloatingCartBarProps) {
  const tCart = useTranslations('cart');

  return (
    <div className="fixed bottom-[4.5rem] z-40 left-1/2 -translate-x-1/2 w-full max-w-[398px] px-4">
      <button
        onClick={onClick}
        className="
          w-full py-3.5 px-4 rounded-yamo-pill
          bg-yamo-red shadow-lg
          flex items-center justify-between gap-3
          hover:bg-yamo-red-hover transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <span className="relative flex items-center justify-center w-8 h-8 bg-yamo-white/20 rounded-full flex-none">
            <IconShoppingCart size={17} className="text-yamo-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yamo-mango rounded-full text-yamo-ebony text-[9px] font-bold flex items-center justify-center">
              {count}
            </span>
          </span>
          <span className="font-sora font-semibold text-yamo-white text-sm">
            {tCart('view_cart')}
          </span>
        </div>
        <span className="font-sora font-semibold text-yamo-white text-sm">
          {formatFCFA(total)}
        </span>
      </button>
    </div>
  );
}
