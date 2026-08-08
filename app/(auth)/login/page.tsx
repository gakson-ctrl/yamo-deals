'use client';

/**
 * Login page — phone number → OTP flow.
 *
 * Demo mode: any 6-digit code is accepted (no real SMS sent).
 * In production: replace signInWithOtp with Africa's Talking / HelloDuty SMS.
 *
 * Flow:
 *  1. User enters phone number → sends OTP (demo: logs to console)
 *  2. User enters 6-digit code → verifyOtp → profile fetched → role redirect
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\+?[0-9\s]{8,15}$/, 'Numéro invalide'),
});

const otpSchema = z.object({
  token: z
    .string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d{6}$/, 'Chiffres uniquement'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone form
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  // OTP form
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  // Step 1: send OTP
  const handleSendOtp = async ({ phone: rawPhone }: PhoneForm) => {
    setLoading(true);
    setError(null);

    const normalised = rawPhone.replace(/\s/g, '');
    setPhone(normalised);

    // Demo mode — Supabase phone auth requires a real SMS provider in prod.
    // We trigger it anyway; if no provider is configured Supabase will error,
    // but in demo we accept any 6-digit code in step 2.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalised,
    });

    // In demo, ignore "phone provider not configured" errors
    if (otpError && !otpError.message.includes('not configured')) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep('otp');
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async ({ token }: OtpForm) => {
    setLoading(true);
    setError(null);

    // Demo mode: any 6-digit code → create/retrieve session via magic link workaround
    // In production: replace with real verifyOtp call below
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (verifyError || !data.user) {
      // Demo fallback: if OTP verify fails (no SMS provider), we sign in
      // with a demo email derived from the phone number so the app stays functional.
      const demoEmail = `demo_${phone.replace(/\D/g, '')}@yamo.demo`;
      const { error: demoError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'yamo_demo_2026',
      });

      if (demoError) {
        setError('Code invalide. En mode démo, entrez n\'importe quels 6 chiffres.');
        setLoading(false);
        return;
      }
    }

    // Fetch role and redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

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

      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
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
              {...phoneForm.register('phone')}
              className="
                w-full px-3 py-2.5 rounded-yamo-input
                border border-yamo-fog
                font-inter text-sm text-yamo-ebony
                placeholder:text-yamo-ash
                focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red
                transition-colors
              "
            />
            {phoneForm.formState.errors.phone && (
              <p className="mt-1 text-xs text-yamo-error">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
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
            {loading ? '…' : t('send_otp')}
          </button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
          <p className="text-sm font-inter text-yamo-ash">
            {t('code_sent_to')}{' '}
            <strong className="text-yamo-ebony">{phone}</strong>
          </p>
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium font-inter text-yamo-ebony mb-1"
            >
              {t('otp_label')}
            </label>
            <input
              id="token"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={t('otp_placeholder')}
              {...otpForm.register('token')}
              className="
                w-full px-3 py-2.5 rounded-yamo-input text-center
                border border-yamo-fog
                font-sora text-2xl tracking-[0.5em] text-yamo-ebony
                placeholder:text-yamo-fog placeholder:tracking-normal
                focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red
                transition-colors
              "
            />
            {otpForm.formState.errors.token && (
              <p className="mt-1 text-xs text-yamo-error">
                {otpForm.formState.errors.token.message}
              </p>
            )}
            <p className="mt-2 text-xs text-yamo-ash text-center">
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
              disabled:opacity-60
            "
          >
            {loading ? '…' : t('verify_otp')}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-sm text-yamo-ash hover:text-yamo-ebony underline"
          >
            {t('resend_otp')}
          </button>
        </form>
      )}

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
