import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface OrderPayload {
  restaurant_id: string;
  items: Array<{ id: string; quantity: number }>;
  delivery_address: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // Auth guard — user must be authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: OrderPayload;
  try {
    body = await req.json() as OrderPayload;
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { restaurant_id, items, delivery_address, note } = body;

  if (!restaurant_id || !Array.isArray(items) || items.length === 0 || !delivery_address?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  // Cast needed: hand-written DB types cause rpc() args to resolve as undefined.
  // .bind(supabase) is REQUIRED — a detached supabase.rpc loses its `this`
  // binding and throws "Cannot read properties of undefined (reading 'rest')".
  type RpcResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;
  type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult<unknown>;
  const rpc = supabase.rpc.bind(supabase) as unknown as GenericRpc;

  const { data, error } = await rpc('place_order', {
    p_customer_id: user.id,
    p_restaurant_id: restaurant_id,
    p_items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
    p_delivery_address: delivery_address.trim(),
    p_note: note?.trim() || undefined,
  });

  if (error) {
    console.error('[place_order]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data as { order_id: string; total_amount: number } | null;
  if (!result?.order_id) {
    return NextResponse.json({ error: 'Commande non créée' }, { status: 500 });
  }

  return NextResponse.json({ order_id: result.order_id, total_amount: result.total_amount });
}
