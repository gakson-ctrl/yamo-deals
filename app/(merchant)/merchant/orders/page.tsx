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

  // Get merchant's restaurant
  const { data: rawRestaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as { data: { id: string } | null; error: unknown };

  if (!rawRestaurant) redirect('/merchant');

  // Initial fetch — active orders only
  const { data: rawOrders, error: ordersError } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
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

  if (ordersError) console.error('[merchant/orders] fetch failed:', ordersError.message);

  return (
    <LiveOrdersClient
      restaurantId={rawRestaurant.id}
      initialOrders={rawOrders ?? []}
    />
  );
}
