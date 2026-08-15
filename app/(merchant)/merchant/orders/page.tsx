import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LiveOrdersClient } from './LiveOrdersClient';
import type { MerchantOrder } from '@/components/merchant/MerchantOrderCard';

export const metadata: Metadata = { title: 'Commandes en direct' };

export default async function MerchantOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get merchant's restaurant — SSR best-effort; client fetches on mount as fallback
  const { data: rawRestaurant, error: restaurantError } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as { data: { id: string } | null; error: { message: string } | null };

  if (restaurantError) {
    console.error('[merchant/orders] restaurant fetch error:', restaurantError.message);
  }

  // Initial fetch — active orders only; empty if restaurant not yet found (client will retry)
  let rawOrders: MerchantOrder[] | null = null;
  if (rawRestaurant) {
    const { data, error: ordersError } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
      .select(`
        id, status, total_amount, delivery_fee, created_at,
        prep_time_min, note_to_kitchen, customer_id,
        order_items(id, name, unit_price, quantity)
      `)
      .eq('restaurant_id', rawRestaurant.id)
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('created_at', { ascending: false }) as {
        data: MerchantOrder[] | null;
        error: { message: string } | null;
      };
    if (ordersError) console.error('[merchant/orders] orders fetch error:', ordersError.message);
    rawOrders = data;
  }

  return (
    <LiveOrdersClient
      restaurantId={rawRestaurant?.id ?? ''}
      initialOrders={rawOrders ?? []}
    />
  );
}
