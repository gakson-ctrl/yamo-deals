'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IconClock, IconMotorbike } from '@tabler/icons-react';
import { RatingBadge } from '@/components/shared/RatingBadge';
import { formatFCFA } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

interface RestaurantCardProps {
  restaurant: Restaurant;
  /** 'full' (default grid card) | 'compact' (narrow horizontal-scroll card) */
  variant?: 'full' | 'compact';
}

export function RestaurantCard({
  restaurant,
  variant = 'full',
}: RestaurantCardProps) {
  const t = useTranslations('restaurant');
  const {
    id, name, cover_url, rating, rating_count,
    avg_prep_time, min_order, delivery_fee, categories, is_open,
  } = restaurant;

  const isCompact = variant === 'compact';

  return (
    <Link
      href={`/customer/restaurant/${id}`}
      className={`block group ${isCompact ? 'w-56 flex-none' : 'w-full'}`}
    >
      <div className="bg-yamo-white rounded-yamo-card shadow-yamo-card overflow-hidden h-full">
        {/* Cover image */}
        <div className={`relative ${isCompact ? 'h-32' : 'h-40'} bg-yamo-fog`}>
          {cover_url ? (
            <Image
              src={cover_url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-yamo-mango-light to-yamo-red-light flex items-center justify-center">
              <span
                className="font-sora font-bold leading-none select-none text-yamo-red/30"
                style={{ fontSize: isCompact ? '3rem' : '3.5rem' }}
                aria-hidden
              >
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Open / closed badge */}
          <span
            className={`
              absolute top-2 left-2
              px-2 py-0.5 rounded-yamo-chip
              text-[10px] font-bold font-sora text-yamo-white
              ${is_open ? 'bg-yamo-fern' : 'bg-yamo-ash'}
            `}
          >
            {is_open ? t('open') : t('closed')}
          </span>
        </div>

        {/* Card body */}
        <div className="p-3">
          {/* Name + rating row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-sora font-semibold text-yamo-ebony text-sm leading-tight line-clamp-1 flex-1">
              {name}
            </h3>
            <RatingBadge rating={rating} count={rating_count} />
          </div>

          {/* Category tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-[10px] font-inter text-yamo-ash bg-yamo-fog px-1.5 py-0.5 rounded-yamo-chip capitalize"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Meta: ETA · min order · delivery fee */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-inter text-yamo-ash">
            <span className="flex items-center gap-0.5">
              <IconClock size={11} aria-hidden />
              ~{avg_prep_time} {t('minutes')}
            </span>
            <span aria-hidden>·</span>
            <span>
              {t('min_order')}{' '}
              <span className="font-semibold text-yamo-mango">
                {formatFCFA(min_order)}
              </span>
            </span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-0.5">
              <IconMotorbike size={11} aria-hidden />
              <span className="font-semibold text-yamo-mango">
                {formatFCFA(delivery_fee)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
