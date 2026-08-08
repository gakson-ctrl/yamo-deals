import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let is_open: boolean;
  try {
    const body = await request.json() as { is_open: boolean };
    if (typeof body.is_open !== 'boolean') throw new Error();
    is_open = body.is_open;
  } catch {
    return NextResponse.json({ error: 'is_open (boolean) requis' }, { status: 400 });
  }

  const rpc = supabase.rpc as unknown as GenericRpc;
  const { error } = await rpc('toggle_restaurant_status', {
    p_restaurant_id: params.id,
    p_owner_id:      user.id,
    p_is_open:       is_open,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, is_open });
}
