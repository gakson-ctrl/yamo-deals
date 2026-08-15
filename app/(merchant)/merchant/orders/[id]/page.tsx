import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderDetailClient, type OrderDetailProps } from './OrderDetailClient';
import type { OrderStatus } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Détail commande — YaMo Merchant' };

interface Props {
  params: { id: string };
}

type RawOrder = {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  note_to_kitchen: string | null;
  prep_time_min: number | null;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  customer_id: string;
  restaurant_id: string;
};

type RawItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

export default async function MerchantOrderDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get merchant's restaurant
  const { data: rawRestaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as { data: { id: string; name: string } | null; error: unknown };

  if (!rawRestaurant) redirect('/merchant');

  // Fetch order — must belong to this restaurant
  const { data: rawOrder } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select(`
      id, status, total_amount, delivery_fee, delivery_address,
      note_to_kitchen, prep_time_min, created_at,
      accepted_at, ready_at, delivered_at,
      customer_id, restaurant_id
    `)
    .eq('id', params.id)
    .eq('restaurant_id', rawRestaurant.id)
    .single() as { data: RawOrder | null; error: unknown };

  if (!rawOrder) notFound();

  // Fetch order items
  const { data: rawItems } = await (supabase.from('order_items') as ReturnType<typeof supabase.from>)
    .select('id, name, quantity, unit_price')
    .eq('order_id', params.id) as { data: RawItem[] | null; error: unknown };

  // Customer name — may fail due to RLS; treated as optional
  const { data: rawProfile } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
    .select('display_name')
    .eq('id', rawOrder.customer_id)
    .maybeSingle() as { data: { display_name: string } | null; error: unknown };

  const detail: OrderDetailProps = {
    id:               rawOrder.id,
    status:           rawOrder.status as OrderStatus,
    total_amount:     Number(rawOrder.total_amount),
    delivery_fee:     Number(rawOrder.delivery_fee),
    delivery_address: rawOrder.delivery_address,
    note_to_kitchen:  rawOrder.note_to_kitchen,
    prep_time_min:    rawOrder.prep_time_min,
    created_at:       rawOrder.created_at,
    accepted_at:      rawOrder.accepted_at,
    ready_at:         rawOrder.ready_at,
    delivered_at:     rawOrder.delivered_at,
    customer_id:      rawOrder.customer_id,
    customer_name:    rawProfile?.display_name ?? null,
    restaurant_name:  rawRestaurant.name,
    items:            rawItems ?? [],
  };

  return <OrderDetailClient {...detail} />;
}
