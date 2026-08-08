'use client';
import { useTranslations } from 'next-intl';
import { SpriteIcon } from '@/components/SpriteIcon';
import { CATEGORIES } from './categories';
import type { IconName } from '@/lib/icon-tokens';

interface CategoryPillRowProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryPillRow({ activeId, onSelect }: CategoryPillRowProps) {
  const t = useTranslations('home');

  return (
    <div
      role="group"
      aria-label="Catégories de cuisine"
      className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            aria-pressed={isActive}
            className={`
              flex-none inline-flex items-center gap-1.5
              px-3 py-2 rounded-yamo-pill
              text-sm font-inter font-medium
              transition-colors whitespace-nowrap
              ${
                isActive
                  ? 'bg-yamo-red text-yamo-white shadow-sm'
                  : 'bg-yamo-white text-yamo-ash border border-yamo-fog hover:border-yamo-red hover:text-yamo-red'
              }
            `}
          >
            {cat.icon && (
              <SpriteIcon
                name={cat.icon as IconName}
                className={`w-4 h-4 ${isActive ? 'text-yamo-white' : 'text-yamo-red'}`}
                aria-hidden
              />
            )}
            {t(cat.labelKey as Parameters<typeof t>[0])}
          </button>
        );
      })}
    </div>
  );
}
