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
    .single() as { data: { id: string } | null; error: unknown };

  if (!rawRestaurant) redirect('/merchant');

  // Initial fetch — active orders only (not delivered / cancelled)
  const { data: rawOrders } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select(`
      id, status, total_amount, delivery_fee, created_at,
      prep_time_min, note_to_kitchen, customer_id,
      profiles(display_name),
      order_items(id, name, unit_price, quantity)
    `)
    .eq('restaurant_id', rawRestaurant.id)
    .not('status', 'in', '(delivered,cancelled)')
    .order('created_at', { ascending: false }) as {
      data: MerchantOrder[] | null;
      error: unknown;
    };

  return (
    <LiveOrdersClient
      restaurantId={rawRestaurant.id}
      initialOrders={rawOrders ?? []}
    />
  );
}
