/**
 * lib/format.ts — YaMo Deals formatting utilities
 *
 * formatFCFA: always outputs French-Cameroonian style with narrow no-break space
 * as thousands separator, e.g. "1 500 FCFA"
 */

export const formatFCFA = (amount: number): string =>
  new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';

/**
 * formatDate — short localised date
 * locale: 'fr' | 'en'
 * Returns e.g. "7 août 2026" (FR) or "Aug 7, 2026" (EN)
 */
export const formatDate = (
  date: string | Date,
  locale: 'fr' | 'en' = 'fr',
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CM' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

/**
 * formatTime — short time, e.g. "14:35"
 */
export const formatTime = (
  date: string | Date,
  locale: 'fr' | 'en' = 'fr',
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CM' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * formatPrepTime — "~25 min"
 */
export const formatPrepTime = (minutes: number): string => `~${minutes} min`;
