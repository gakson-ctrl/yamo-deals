import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import { OrderTracker } from './OrderTracker';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export const metadata: Metadata = { title: 'Suivi commande — YaMo Deals' };

interface Props {
  params: { id: string };
}

export default async function OrderTrackingPage({ params }: Props) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Fetch order — RLS ensures customer sees own orders only
  const { data: rawOrder } = await (
    supabase.from('orders') as ReturnType<typeof supabase.from>
  )
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single();

  const order = rawOrder as Order | null;
  if (!order) notFound();

  // Fetch restaurant name
  const { data: rawRestaurant } = await (
    supabase.from('restaurants') as ReturnType<typeof supabase.from>
  )
    .select('name')
    .eq('id', order.restaurant_id)
    .single();

  const restaurantName = (rawRestaurant as { name: string } | null)?.name ?? '';

  // Fetch order items
  const { data: rawItems } = await (
    supabase.from('order_items') as ReturnType<typeof supabase.from>
  )
    .select('*')
    .eq('order_id', params.id);

  const orderItems = (rawItems as OrderItem[] | null) ?? [];

  return (
    <OrderTracker
      initialOrder={order}
      restaurantName={restaurantName}
      orderItems={orderItems}
    />
  );
}
