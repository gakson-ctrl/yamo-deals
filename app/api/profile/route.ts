import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SavedAddress } from '@/lib/supabase/types';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
    .select('id, display_name, phone, locale, saved_addresses')
    .eq('id', user.id)
    .single() as {
      data: {
        id: string;
        display_name: string;
        phone: string;
        locale: 'fr' | 'en';
        saved_addresses: SavedAddress[];
      } | null;
      error: { message: string } | null;
    };

  if (error || !data) {
    console.error('[profile/GET]', error?.message);
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  }

  return NextResponse.json(data);
}

interface ProfilePatch {
  display_name?: string;
  locale?: 'fr' | 'en';
  saved_addresses?: SavedAddress[];
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  let body: ProfilePatch;
  try {
    body = await req.json() as ProfilePatch;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const update: Partial<{ display_name: string; locale: 'fr' | 'en'; saved_addresses: SavedAddress[] }> = {};
  if (body.display_name !== undefined) update.display_name = body.display_name.trim();
  if (body.locale !== undefined) update.locale = body.locale;
  if (body.saved_addresses !== undefined) update.saved_addresses = body.saved_addresses;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { error } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
    .update(update)
    .eq('id', user.id) as { error: { message: string } | null };

  if (error) {
    console.error('[profile/PATCH]', error.message);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
