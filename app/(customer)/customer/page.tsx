import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { IconMapPin } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/server';
import { HomeClient } from '@/app/(customer)/components/HomeClient';
import { HomeSearchInput } from '@/app/(customer)/components/HomeSearchInput';

export const metadata: Metadata = { title: 'Accueil' };

export default async function CustomerHomePage() {
  const t = await getTranslations('home');

  const supabase = createClient();
  const { data: restaurants = [] } = await supabase
    .from('restaurants')
    .select('*')
    .order('rating', { ascending: false });

  return (
    <div className="min-h-dvh bg-yamo-cream">
      {/* ── Hero banner ── */}
      <header className="bg-gradient-to-br from-yamo-red to-yamo-red-hover pt-10 pb-6 px-4">
        {/* Location pill */}
        <div className="flex items-center gap-1 mb-4">
          <IconMapPin size={14} className="text-yamo-white/70" aria-hidden />
          <span className="text-yamo-white/90 font-inter text-xs font-medium">
            Yaoundé, Cameroun
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-sora font-bold text-yamo-white text-2xl leading-tight mb-1">
          YaMo Deals
        </h1>
        <p className="font-inter text-yamo-white/80 text-sm mb-5">
          {t('hero_subtitle')}
        </p>

        {/* Search bar — navigates to /customer/search?q=… as user types */}
        <HomeSearchInput />
      </header>

      {/* ── Interactive section (category pills + restaurant lists) ── */}
      <HomeClient restaurants={restaurants ?? []} />
    </div>
  );
}
