'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  IconMapPin,
  IconShoppingBag,
  IconLanguage,
  IconLogout,
  IconChevronRight,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { AddressSheet } from '@/components/customer/AddressSheet';
import type { SavedAddress } from '@/lib/supabase/types';

interface ProfileData {
  display_name: string;
  phone: string;
  locale: 'fr' | 'en';
  saved_addresses: SavedAddress[];
}

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<'fr' | 'en'>(profile.locale);

  const initial = profile.display_name.charAt(0).toUpperCase();

  const handleLocaleSwitch = async (newLocale: 'fr' | 'en') => {
    if (newLocale === currentLocale) return;
    setCurrentLocale(newLocale);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-dvh bg-yamo-cream pb-24">

      {/* Header */}
      <div className="bg-yamo-white border-b border-yamo-fog px-4 pt-14 pb-4">
        <h1 className="font-sora font-bold text-xl text-yamo-ebony">{t('title')}</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-yamo-red flex items-center justify-center mb-3">
          <span className="font-sora font-bold text-2xl text-yamo-white leading-none">
            {initial}
          </span>
        </div>
        <p className="font-sora font-bold text-lg text-yamo-ebony">{profile.display_name}</p>
        <p className="font-inter text-sm text-yamo-ash mt-0.5">{profile.phone}</p>
      </div>

      {/* Settings rows */}
      <div className="px-4 space-y-3">

        {/* Addresses */}
        <button
          type="button"
          onClick={() => setShowAddressSheet(true)}
          className="w-full flex items-center gap-3 bg-yamo-white rounded-yamo-card p-4"
        >
          <IconMapPin size={20} className="text-yamo-red flex-shrink-0" />
          <span className="flex-1 text-left font-inter text-sm font-medium text-yamo-ebony">
            {t('addresses')}
          </span>
          <IconChevronRight size={18} className="text-yamo-ash" />
        </button>

        {/* Orders */}
        <button
          type="button"
          onClick={() => router.push('/customer/orders')}
          className="w-full flex items-center gap-3 bg-yamo-white rounded-yamo-card p-4"
        >
          <IconShoppingBag size={20} className="text-yamo-red flex-shrink-0" />
          <span className="flex-1 text-left font-inter text-sm font-medium text-yamo-ebony">
            {t('orders')}
          </span>
          <IconChevronRight size={18} className="text-yamo-ash" />
        </button>

        {/* Language toggle */}
        <div className="flex items-center gap-3 bg-yamo-white rounded-yamo-card p-4">
          <IconLanguage size={20} className="text-yamo-red flex-shrink-0" />
          <span className="flex-1 font-inter text-sm font-medium text-yamo-ebony">
            {t('language')}
          </span>
          <div className="flex rounded-full overflow-hidden border border-yamo-fog">
            {(['fr', 'en'] as const).map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => void handleLocaleSwitch(loc)}
                className={`px-3 py-1 text-xs font-semibold font-inter transition-colors ${
                  currentLocale === loc
                    ? 'bg-yamo-red text-yamo-white'
                    : 'text-yamo-ash hover:text-yamo-ebony'
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        {showLogoutConfirm ? (
          <div className="bg-yamo-white rounded-yamo-card p-4 space-y-3">
            <p className="font-inter text-sm text-yamo-ebony">{t('logout_confirm')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex-1 py-2.5 bg-yamo-error text-yamo-white rounded-yamo-pill text-sm font-semibold font-inter"
              >
                {tCommon('confirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-yamo-fog text-yamo-ebony rounded-yamo-pill text-sm font-semibold font-inter"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 bg-yamo-white rounded-yamo-card p-4"
          >
            <IconLogout size={20} className="text-yamo-error flex-shrink-0" />
            <span className="font-inter text-sm font-medium text-yamo-error">{t('logout')}</span>
          </button>
        )}
      </div>

      {/* Version */}
      <p className="text-center text-[11px] font-inter text-yamo-ash mt-8">
        {t('version')}
      </p>

      {/* Address sheet */}
      {showAddressSheet && (
        <AddressSheet
          initialAddresses={profile.saved_addresses}
          onClose={() => setShowAddressSheet(false)}
        />
      )}
    </div>
  );
}
