'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconSearch, IconX } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { RestaurantCard } from '@/app/(customer)/components/RestaurantCard';
import { CATEGORIES } from '@/app/(customer)/components/categories';
import type { Database } from '@/lib/supabase/types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

const CUISINE_FILTERS = CATEGORIES.filter(c => c.id !== 'all');

const RATING_OPTIONS: { value: number; key: string }[] = [
  { value: 3,   key: 'rating_3' },
  { value: 4,   key: 'rating_4' },
  { value: 4.5, key: 'rating_4_5' },
];

const FEE_OPTIONS: { value: number; key: string }[] = [
  { value: 200,  key: 'fee_200' },
  { value: 500,  key: 'fee_500' },
  { value: 1000, key: 'fee_1000' },
];

function SkeletonCard() {
  return (
    <div className="bg-yamo-white rounded-yamo-card overflow-hidden animate-pulse">
      <div className="h-32 bg-yamo-fog" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-yamo-fog rounded-full w-3/4" />
        <div className="h-2 bg-yamo-fog rounded-full w-1/2" />
        <div className="h-2 bg-yamo-fog rounded-full w-full" />
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

function Chip({ label, active, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-yamo-pill text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
        active
          ? 'bg-yamo-red text-yamo-white'
          : 'bg-yamo-white text-yamo-ash border border-yamo-fog'
      }`}
    >
      {label}
      {active && <IconX size={11} />}
    </button>
  );
}

function FilterSep() {
  return <span className="h-5 w-px bg-yamo-fog flex-shrink-0" aria-hidden />;
}

export default function SearchPageClient() {
  const t = useTranslations('search');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [cuisine, setCuisine] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(false);

  const anyFilter = Boolean(query || cuisine || rating !== null || maxFee !== null || openNow);

  // Fetch all restaurants once on mount
  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false })
      .then(({ data }) => {
        setRestaurants(data ?? []);
        setLoading(false);
      });
  }, []);

  // Auto-focus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep URL in sync with query (for shareable links)
  useEffect(() => {
    const url = query.trim()
      ? `/customer/search?q=${encodeURIComponent(query)}`
      : '/customer/search';
    router.replace(url, { scroll: false });
  }, [query, router]);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      // Text match: restaurant name or category string
      if (query.trim()) {
        const lower = query.toLowerCase();
        const nameMatch = r.name.toLowerCase().includes(lower);
        const catMatch = r.categories.some(c => c.toLowerCase().includes(lower));
        if (!nameMatch && !catMatch) return false;
      }
      // Cuisine filter
      if (cuisine) {
        const cat = CATEGORIES.find(c => c.id === cuisine);
        if (cat && !r.categories.some(c => cat.match.includes(c))) return false;
      }
      // Min rating
      if (rating !== null && (r.rating ?? 0) < rating) return false;
      // Max delivery fee
      if (maxFee !== null && Number(r.delivery_fee) > maxFee) return false;
      // Open now
      if (openNow && !r.is_open) return false;
      return true;
    });
  }, [restaurants, query, cuisine, rating, maxFee, openNow]);

  const reset = () => {
    setQuery('');
    setCuisine('');
    setRating(null);
    setMaxFee(null);
    setOpenNow(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-dvh bg-yamo-cream">
      {/* Sticky search + filter header */}
      <div className="sticky top-0 z-30 bg-yamo-white shadow-sm">
        {/* Search input row */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-yamo-cream rounded-yamo-input px-3 py-2.5 border border-yamo-fog focus-within:border-yamo-red transition-colors">
            <IconSearch size={16} className="text-yamo-ash flex-shrink-0" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('placeholder')}
              className="flex-1 bg-transparent text-sm text-yamo-ebony placeholder:text-yamo-ash focus:outline-none min-w-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-yamo-ash flex-shrink-0"
                aria-label={tCommon('close')}
              >
                <IconX size={14} />
              </button>
            )}
          </div>
          {anyFilter && (
            <button
              type="button"
              onClick={reset}
              className="text-yamo-red text-xs font-semibold flex-shrink-0"
            >
              {t('reset')}
            </button>
          )}
        </div>

        {/* Filter chips — horizontal scroll */}
        <div
          className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar"
          role="group"
          aria-label={t('filters')}
        >
          {/* Cuisine */}
          {CUISINE_FILTERS.map(cat => (
            <Chip
              key={cat.id}
              label={tHome(cat.labelKey as Parameters<typeof tHome>[0])}
              active={cuisine === cat.id}
              onToggle={() => setCuisine(v => (v === cat.id ? '' : cat.id))}
            />
          ))}

          <FilterSep />

          {/* Min rating */}
          {RATING_OPTIONS.map(opt => (
            <Chip
              key={opt.key}
              label={t(opt.key as Parameters<typeof t>[0])}
              active={rating === opt.value}
              onToggle={() => setRating(v => (v === opt.value ? null : opt.value))}
            />
          ))}

          <FilterSep />

          {/* Max delivery fee */}
          {FEE_OPTIONS.map(opt => (
            <Chip
              key={opt.key}
              label={t(opt.key as Parameters<typeof t>[0])}
              active={maxFee === opt.value}
              onToggle={() => setMaxFee(v => (v === opt.value ? null : opt.value))}
            />
          ))}

          <FilterSep />

          {/* Open now */}
          <Chip
            label={t('open_now')}
            active={openNow}
            onToggle={() => setOpenNow(v => !v)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 pb-8">
        {loading ? (
          /* Skeleton: 2 columns × 3 rows */
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-4xl" aria-hidden>🔍</span>
            <p className="text-yamo-ash font-inter text-sm px-6">
              {query.trim()
                ? t('no_results', { query: query.trim() })
                : t('no_results_plain')
              }
            </p>
            {anyFilter && (
              <button
                type="button"
                onClick={reset}
                className="text-yamo-red font-semibold text-sm underline underline-offset-2"
              >
                {t('reset')}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-yamo-ash font-inter mb-3">
              {t('results_count', { count: filtered.length })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(r => (
                <RestaurantCard key={r.id} restaurant={r} variant="full" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
