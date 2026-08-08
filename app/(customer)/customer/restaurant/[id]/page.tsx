import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import { RestaurantClient } from './RestaurantClient';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  // Cast needed: hand-written DB types cause .eq().single() chain to resolve as never.
  const { data } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('*')
    .eq('id', params.id)
    .single();

  const restaurant = data as Restaurant | null;
  return {
    title: restaurant?.name ?? 'Restaurant',
    description: restaurant?.description ?? undefined,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const supabase = createClient();

  // Cast needed: hand-written DB types cause filtered queries to resolve as never.
  const { data: rawRestaurant } = await (
    supabase.from('restaurants') as ReturnType<typeof supabase.from>
  )
    .select('*')
    .eq('id', params.id)
    .single();

  const restaurant = rawRestaurant as Restaurant | null;
  if (!restaurant) notFound();

  const [{ data: rawCategories }, { data: rawItems }] = await Promise.all([
    (supabase.from('menu_categories') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('restaurant_id', params.id)
      .order('display_order', { ascending: true }),
    (supabase.from('menu_items') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('restaurant_id', params.id)
      .order('name', { ascending: true }),
  ]);

  return (
    <RestaurantClient
      restaurant={restaurant}
      categories={(rawCategories as MenuCategory[] | null) ?? []}
      items={(rawItems as MenuItem[] | null) ?? []}
    />
  );
}
