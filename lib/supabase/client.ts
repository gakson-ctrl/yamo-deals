/**
 * lib/supabase/client.ts
 * Browser-side Supabase client — use in Client Components only.
 * Singleton pattern: safe to call multiple times.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
