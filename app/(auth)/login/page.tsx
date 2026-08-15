'use client';

/**
 * Login page — demo mode (no SMS provider).
 *
 * Flow: phone number → derive demo email → signInWithPassword.
 * Production path: swap handleLogin for real OTP (signInWithOtp + verifyOtp).
 *
 * Demo email format: demo_{digits}@yamo.demo  (matches register page)
 * Demo password:     YamoDemo2026!
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

// ─── Schema ───────────────────────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\+?[0-9\s]{8,15}$/, 'Numéro invalide'),
});

type PhoneForm = z.infer<typeof phoneSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  const handleLogin = async ({ phone: rawPhone }: PhoneForm) => {
    setLoading(true);
    setError(null);

    // Strip all non-digits then derive the demo email
    const digits = rawPhone.replace(/\D/g, '');
    const demoEmail = `demo_${digits}@yamo.demo`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'YamoDemo2026!',
    });

    if (signInError) {
      setError('Numéro non reconnu, veuillez vous inscrire.');
      setLoading(false);
      return;
    }

    // Fetch role and redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Erreur de connexion, réessayez.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: unknown };

    router.push(profile?.role === 'merchant' ? '/merchant' : '/customer');
  };

  return (
    <>
      <h1 className="font-sora font-bold text-xl text-yamo-ebony mb-1">
        {t('login_title')}
      </h1>
      <p className="font-inter text-sm text-yamo-ash mb-6">
        {t('login_subtitle')}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-yamo-error rounded-yamo-chip text-sm text-yamo-error">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium font-inter text-yamo-ebony mb-1"
          >
            {t('phone_label')}
          </label>
          <input
            id="phone"
            type="tel"
            placeholder={t('phone_placeholder')}
            {...form.register('phone')}
            className="
              w-full px-3 py-2.5 rounded-yamo-input
              border border-yamo-fog
              font-inter text-sm text-yamo-ebony
              placeholder:text-yamo-ash
              focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red
              transition-colors
            "
          />
          {form.formState.errors.phone && (
            <p className="mt-1 text-xs text-yamo-error">
              {form.formState.errors.phone.message}
            </p>
          )}
          <p className="mt-2 text-xs text-yamo-ash">
            {t('otp_demo_hint')}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-yamo-pill
            bg-yamo-red hover:bg-yamo-red-hover
            text-yamo-white font-sora font-semibold text-sm
            transition-colors duration-150
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? '…' : t('login_button')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-inter text-yamo-ash">
        {t('no_account')}{' '}
        <Link
          href="/register"
          className="text-yamo-red font-semibold hover:underline"
        >
          {t('register_link')}
        </Link>
      </p>
    </>
  );
}
