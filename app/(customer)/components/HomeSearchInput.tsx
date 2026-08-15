'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconSearch } from '@tabler/icons-react';

export function HomeSearchInput() {
  const t = useTranslations('home');
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 bg-yamo-white rounded-yamo-input px-3 py-2.5 shadow-sm cursor-text">
      <IconSearch size={16} className="text-yamo-ash flex-shrink-0" aria-hidden />
      <input
        type="search"
        placeholder={t('search_placeholder')}
        onChange={e => {
          const q = e.target.value.trim();
          router.push(
            q
              ? `/customer/search?q=${encodeURIComponent(q)}`
              : '/customer/search',
          );
        }}
        className="flex-1 bg-transparent text-sm text-yamo-ebony placeholder:text-yamo-ash focus:outline-none"
      />
    </label>
  );
}
