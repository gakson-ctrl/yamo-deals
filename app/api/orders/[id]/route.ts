import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/lib/supabase/types';

type RpcResult = Promise<{ data: unknown; error: { message: string } | null }>;
type GenericRpc = (fn: string, args?: Record<string, unknown>) => RpcResult;

interface PatchBody {
  action: 'accept' | 'update_status' | 'cancel';
  prep_time_min?: number;
  new_status?: OrderStatus;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await request.json() as PatchBody;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { action, prep_time_min, new_status } = body;
  const orderId = params.id;
  const rpc = supabase.rpc as unknown as GenericRpc;

  try {
    if (action === 'accept') {
      if (!prep_time_min || prep_time_min < 1) {
        return NextResponse.json({ error: 'prep_time_min requis (≥ 1)' }, { status: 400 });
      }
      const { error } = await rpc('accept_order', {
        p_order_id:      orderId,
        p_merchant_id:   user.id,
        p_prep_time_min: prep_time_min,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'update_status') {
      if (!new_status) {
        return NextResponse.json({ error: 'new_status requis' }, { status: 400 });
      }
      const { error } = await rpc('update_order_status', {
        p_order_id:   orderId,
        p_merchant_id: user.id,
        p_new_status:  new_status,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'cancel') {
      const { error } = await rpc('cancel_order', {
        p_order_id: orderId,
        p_actor_id: user.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
