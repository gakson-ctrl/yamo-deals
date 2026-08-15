import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UpdatePayload {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  category_id?: string | null;
}

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body: UpdatePayload;
  try {
    body = await req.json() as UpdatePayload;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const rpc = supabase.rpc.bind(supabase) as unknown as GenericRpc;
  const { error } = await rpc('update_menu_item', {
    p_item_id:      params.id,
    p_owner_id:     user.id,
    p_name:         body.name?.trim(),
    p_description:  body.description?.trim() || null,
    p_price:        body.price,
    p_image_url:    body.image_url ?? null,
    p_is_available: body.is_available ?? true,
    p_category_id:  body.category_id ?? null,
  });

  if (error) {
    console.error('[update_menu_item]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const rpc = supabase.rpc.bind(supabase) as unknown as GenericRpc;
  const { error } = await rpc('delete_menu_item', {
    p_item_id:  params.id,
    p_owner_id: user.id,
  });

  if (error) {
    console.error('[delete_menu_item]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
