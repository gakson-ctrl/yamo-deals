/**
 * lib/db.ts — typed query helpers (server-side only)
 * All helpers return typed rows. Use in Server Components + Route Handlers.
 * Never import in Client Components.
 */
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// ─── Restaurants ──────────────────────────────────────────────────────────────

export async function getOpenRestaurants(): Promise<Restaurant[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_open', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Returns the owner's primary (oldest) restaurant, or null.
 * Uses limit(1)+maybeSingle so it never throws when an owner has
 * multiple restaurants (e.g. the demo merchant owns all 8).
 */
export async function getRestaurantByOwner(ownerId: string): Promise<Restaurant | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

/** Returns all restaurants owned by a merchant (newest first). */
export async function getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenuCategories(
  restaurantId: string,
): Promise<MenuCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_order');

  if (error) throw error;
  return data ?? [];
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category_id');

  if (error) throw error;
  return data ?? [];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getMerchantOrders(restaurantId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}
