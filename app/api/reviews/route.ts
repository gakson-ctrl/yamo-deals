import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

interface ReviewPayload {
  order_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body: ReviewPayload;
  try {
    body = await req.json() as ReviewPayload;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { order_id, restaurant_id, rating, comment } = body;
  if (!order_id || !restaurant_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Données manquantes ou invalides' }, { status: 400 });
  }

  const rpc = supabase.rpc.bind(supabase) as unknown as GenericRpc;
  const { data, error } = await rpc('insert_review', {
    p_order_id:      order_id,
    p_customer_id:   user.id,
    p_restaurant_id: restaurant_id,
    p_rating:        rating,
    p_comment:       comment?.trim() || null,
  });

  if (error) {
    console.error('[insert_review]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ review_id: data as string });
}
