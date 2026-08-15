import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReviewClient } from './ReviewClient';

export const metadata: Metadata = { title: 'Laisser un avis — YaMo Deals' };

type RawOrder = {
  id: string;
  status: string;
  restaurant_id: string;
  customer_id: string;
};

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify order belongs to customer and is delivered
  const { data: rawOrder } = await (supabase.from('orders') as ReturnType<typeof supabase.from>)
    .select('id, status, restaurant_id, customer_id')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .maybeSingle() as { data: RawOrder | null; error: unknown };

  if (!rawOrder || rawOrder.status !== 'delivered') {
    redirect('/customer/orders');
  }

  // Check if already reviewed
  const { data: existingReview } = await (supabase.from('reviews') as ReturnType<typeof supabase.from>)
    .select('id')
    .eq('order_id', params.id)
    .maybeSingle() as { data: { id: string } | null; error: unknown };

  // Fetch restaurant name
  const { data: rawRestaurant } = await (supabase.from('restaurants') as ReturnType<typeof supabase.from>)
    .select('name')
    .eq('id', rawOrder.restaurant_id)
    .single() as { data: { name: string } | null; error: unknown };

  return (
    <ReviewClient
      orderId={rawOrder.id}
      restaurantId={rawOrder.restaurant_id}
      restaurantName={rawRestaurant?.name ?? ''}
      alreadyReviewed={!!existingReview}
    />
  );
}
