'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CategoryPillRow } from './CategoryPillRow';
import { RestaurantCard } from './RestaurantCard';
import { filterByCategory } from './categories';
import type { Database } from '@/lib/supabase/types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

interface HomeClientProps {
  restaurants: Restaurant[];
}

export function HomeClient({ restaurants }: HomeClientProps) {
  const t = useTranslations('home');
  const tRestaurant = useTranslations('restaurant');

  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(
    () => filterByCategory(restaurants, activeCategory),
    [restaurants, activeCategory],
  );

  // Derive from `filtered` so the category pill also scopes the top-rated section
  const topRated = useMemo(
    () =>
      [...filtered]
        .filter((r) => r.rating != null && r.rating > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6),
    [filtered],
  );

  return (
    <div>
      {/* Category pill row */}
      <section className="px-4 pt-4 pb-2">
        <CategoryPillRow activeId={activeCategory} onSelect={setActiveCategory} />
      </section>

      {/* "Près de vous" section */}
      <section className="px-4 pt-4">
        <h2 className="font-sora font-bold text-yamo-ebony text-lg mb-3">
          {t('section_nearby')}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-yamo-ash font-inter text-sm py-8 text-center">
            {tRestaurant('no_results')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} variant="full" />
            ))}
          </div>
        )}
      </section>

      {/* "Les mieux notés" section — horizontal scroll, ignores category filter */}
      {topRated.length > 0 && (
        <section className="pt-8 pb-4">
          <h2 className="font-sora font-bold text-yamo-ebony text-lg mb-3 px-4">
            {t('section_toprated')}
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
            {topRated.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
