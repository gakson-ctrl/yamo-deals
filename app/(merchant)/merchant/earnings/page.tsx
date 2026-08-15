import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EarningsClient } from './EarningsClient';

export const metadata: Metadata = { title: 'Mes revenus — YaMo Merchant' };

type OrderData = {
  id: string;
  total_amount: number;
  created_at: string;
};

export default async function EarningsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rawRestaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as { data: { id: string; name: string } | null; error: unknown };

  if (!rawRestaurant) redirect('/merchant');

  // Fetch all delivered orders in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: rawOrders, error: ordersError } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select('id, total_amount, created_at')
    .eq('restaurant_id', rawRestaurant.id)
    .eq('status', 'delivered')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false }) as {
      data: OrderData[] | null;
      error: { message: string } | null;
    };

  if (ordersError) console.error('[earnings] fetch failed:', ordersError.message);

  return (
    <EarningsClient
      restaurantName={rawRestaurant.name}
      orders={rawOrders ?? []}
    />
  );
}
