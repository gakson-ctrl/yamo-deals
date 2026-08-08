import type { IconName } from '@/lib/icon-tokens';

export interface CategoryDef {
  id: string;
  labelKey: string;
  icon: IconName | null;
  /** Supabase `categories` array values to match against */
  match: string[];
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'all',      labelKey: 'filter_all',       icon: null,             match: [] },
  { id: 'poulet',   labelKey: 'category_poulet',  icon: 'poulet-braise',  match: ['poulet', 'grillades'] },
  { id: 'soya',     labelKey: 'category_soya',    icon: 'soya-brochette', match: ['soya'] },
  { id: 'snack',    labelKey: 'category_snack',   icon: 'sandwich',       match: ['snack', 'sandwich', 'fast-food'] },
  { id: 'pizza',    labelKey: 'category_pizza',   icon: 'pizza',          match: ['pizza', 'italien'] },
  { id: 'local',    labelKey: 'category_local',   icon: 'ndole',          match: ['cameroonian', 'traditionnel', 'pan-african', 'camerounais'] },
  { id: 'boissons', labelKey: 'category_boissons',icon: 'boissons',       match: ['drinks', 'bar-restaurant', 'boissons'] },
  { id: 'desserts', labelKey: 'category_desserts',icon: 'beignets',       match: ['breakfast', 'pâtisserie', 'desserts'] },
];

export function filterByCategory<T extends { categories: string[] }>(
  restaurants: T[],
  categoryId: string,
): T[] {
  if (categoryId === 'all') return restaurants;
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return restaurants;
  return restaurants.filter((r) =>
    r.categories.some((c) => cat.match.includes(c)),
  );
}
