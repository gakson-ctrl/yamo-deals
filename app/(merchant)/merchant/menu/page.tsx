import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MenuManagerClient } from './MenuManagerClient';

export const metadata: Metadata = { title: 'Mon menu — YaMo Merchant' };

type RawCategory = { id: string; name: string; display_order: number };
type RawItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string | null;
};

export default async function MenuPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: restaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id, name')
    .eq('owner_id', user.id)
    .single() as { data: { id: string; name: string } | null; error: unknown };

  if (!restaurant) redirect('/merchant');

  const { data: rawCategories } = await (supabase.from('menu_categories') as ReturnType<typeof supabase.from>)
    .select('id, name, display_order')
    .eq('restaurant_id', restaurant.id)
    .order('display_order', { ascending: true }) as { data: RawCategory[] | null; error: unknown };

  // Owner can read all items (including unavailable) via menu_items_select_owner RLS policy
  const { data: rawItems } = await (supabase.from('menu_items') as ReturnType<typeof supabase.from>)
    .select('id, name, description, price, image_url, is_available, category_id')
    .eq('restaurant_id', restaurant.id) as { data: RawItem[] | null; error: unknown };

  const items = rawItems ?? [];

  const categories = (rawCategories ?? []).map(cat => ({
    id:            cat.id,
    name:          cat.name,
    display_order: cat.display_order,
    items:         items
      .filter(i => i.category_id === cat.id)
      .map(i => ({ ...i, price: Number(i.price) })),
  }));

  return (
    <main className="px-4 pt-5">
      <MenuManagerClient
        restaurantId={restaurant.id}
        initialCategories={categories}
      />
    </main>
  );
}
