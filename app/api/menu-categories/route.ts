import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body: { restaurant_id: string; name: string };
  try {
    body = await req.json() as { restaurant_id: string; name: string };
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  if (!body.restaurant_id || !body.name?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const rpc = supabase.rpc as unknown as GenericRpc;
  const { data, error } = await rpc('insert_menu_category', {
    p_restaurant_id: body.restaurant_id,
    p_owner_id:      user.id,
    p_name:          body.name.trim(),
  });

  if (error) {
    console.error('[insert_menu_category]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category_id: data as string });
}
