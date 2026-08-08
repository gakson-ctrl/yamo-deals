'use client';

/**
 * LanguageToggle — switches FR ↔ EN by setting the NEXT_LOCALE cookie
 * and triggering a full page reload so the server picks up the new locale.
 *
 * Usage: place anywhere in the header / profile page.
 */

import { useTransition } from 'react';

interface LanguageToggleProps {
  currentLocale: 'fr' | 'en';
}

export function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(() => {
      const next = currentLocale === 'fr' ? 'en' : 'fr';
      // Set cookie (30-day expiry)
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={
        currentLocale === 'fr' ? 'Switch to English' : 'Passer en français'
      }
      className="
        inline-flex items-center gap-1
        text-xs font-semibold font-inter
        text-yamo-ash hover:text-yamo-ebony
        transition-colors duration-150
        disabled:opacity-50
      "
    >
      <span
        className={`px-1.5 py-0.5 rounded-yamo-chip ${
          currentLocale === 'fr'
            ? 'bg-yamo-red text-yamo-white'
            : 'text-yamo-ash'
        }`}
      >
        FR
      </span>
      <span className="text-yamo-fog">/</span>
      <span
        className={`px-1.5 py-0.5 rounded-yamo-chip ${
          currentLocale === 'en'
            ? 'bg-yamo-red text-yamo-white'
            : 'text-yamo-ash'
        }`}
      >
        EN
      </span>
    </button>
  );
}
