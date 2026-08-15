import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileClient } from './ProfileClient';
import type { SavedAddress } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Mon profil — YaMo Deals' };

type ProfileRow = {
  display_name: string;
  phone: string;
  locale: 'fr' | 'en';
  saved_addresses: SavedAddress[];
};

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
    .select('display_name, phone, locale, saved_addresses')
    .eq('id', user.id)
    .single() as { data: ProfileRow | null; error: unknown };

  if (!profile) redirect('/login');

  return (
    <ProfileClient
      profile={{
        display_name: profile.display_name,
        phone: profile.phone,
        locale: profile.locale,
        saved_addresses: (profile.saved_addresses as SavedAddress[]) ?? [],
      }}
    />
  );
}
