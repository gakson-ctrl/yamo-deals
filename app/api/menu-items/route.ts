import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MenuItemPayload {
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
}

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body: MenuItemPayload;
  try {
    body = await req.json() as MenuItemPayload;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { restaurant_id, category_id, name, description, price, image_url, is_available } = body;
  if (!restaurant_id || !name?.trim() || price === undefined) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const rpc = supabase.rpc.bind(supabase) as unknown as GenericRpc;
  const { data, error } = await rpc('insert_menu_item', {
    p_restaurant_id: restaurant_id,
    p_owner_id:      user.id,
    p_category_id:   category_id ?? null,
    p_name:          name.trim(),
    p_description:   description?.trim() || null,
    p_price:         price,
    p_image_url:     image_url ?? null,
    p_is_available:  is_available ?? true,
  });

  if (error) {
    console.error('[insert_menu_item]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item_id: data as string });
}
