'use client';

/**
 * Register page — phone OTP flow.
 *
 * Step 1: name + phone + role → "Recevoir le code"
 * Step 2: 6-digit OTP → create account + profile → role redirect
 *
 * Demo mode: any 6-digit code accepted (no SMS provider required).
 * Production: replace signInWithOtp / verifyOtp with Africa's Talking or HelloDuty.
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
  display_name: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  phone: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\+?[0-9\s]{8,15}$/, 'Numéro invalide (format : +237 6XX XXX XXX)'),
  role: z.enum(['customer', 'merchant'] as const, {
    required_error: 'Veuillez choisir un type de compte',
  }),
});

const otpSchema = z.object({
  token: z
    .string()
    .min(4, 'Code trop court')
    .max(6, 'Code trop long')
    .regex(/^\d+$/, 'Chiffres uniquement'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [pending, setPending] = useState<{ display_name: string; role: 'customer' | 'merchant' }>({
    display_name: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { role: 'customer' },
  });

  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  // ── Step 1: "send" OTP ────────────────────────────────────────────────────

  const handleSendOtp = async (values: PhoneForm) => {
    setLoading(true);
    setError(null);

    const normalised = values.phone.replace(/\s/g, '');
    setPhone(normalised);
    setPending({ display_name: values.display_name, role: values.role });

    // Attempt real Supabase phone OTP — silently ignore "not configured" in demo.
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalised });
    if (otpError) {
      const msg = otpError.message.toLowerCase();
      if (!msg.includes('not configured') && !msg.includes('phone provider')) {
        setError(otpError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setStep('otp');
  };

  // ── Step 2: verify OTP + create account ───────────────────────────────────

  const handleVerifyOtp = async ({ token }: OtpForm) => {
    setLoading(true);
    setError(null);

    // Try real Supabase SMS OTP first (no-op in demo — verify will fail).
    const { data: verifyData } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    // Demo fallback: signUp with derived email + phone-based password.
    if (!verifyData?.user) {
      const demoEmail = `demo_${phone.replace(/\D/g, '')}@yamo.demo`;
      const demoPassword = 'yamo_demo_2026';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
      });

      if (signUpError && !signUpError.message.toLowerCase().includes('already registered')) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If no session (email confirmation enabled), sign in explicitly.
      if (!signUpData?.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        if (signInError) {
          setError(
            'Désactivez "Confirm email" dans Supabase Dashboard → Auth → Settings, puis réessayez.',
          );
          setLoading(false);
          return;
        }
      }
    }

    // Upsert profile with confirmed user id.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Session introuvable. Veuillez réessayer.');
      setLoading(false);
      return;
    }

    // Cast needed: hand-written DB types don't fully satisfy Supabase's
    // internal GenericSchema shape, so upsert() infers Row=never without it.
    const { error: profileError } = await (
      supabase.from('profiles') as ReturnType<typeof supabase.from>
    ).upsert({
      id: user.id,
      phone,
      display_name: pending.display_name,
      role: pending.role,
      avatar_url: null,
      locale: 'fr',
    } as Record<string, unknown>);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push(pending.role === 'merchant' ? '/merchant' : '/customer');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <h1 className="font-sora font-bold text-xl text-yamo-ebony mb-1">
        {t('register_title')}
      </h1>
      <p className="font-inter text-sm text-yamo-ash mb-6">
        {t('register_subtitle')}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-yamo-error rounded-yamo-chip text-sm text-yamo-error">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        /* ── Step 1: Name + Phone + Role ─────────────────────────────────── */
        <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">

          {/* Name */}
          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium font-inter text-yamo-ebony mb-1"
            >
              {t('name_label')}
            </label>
            <input
              id="display_name"
              type="text"
              placeholder={t('name_placeholder')}
              {...phoneForm.register('display_name')}
              className="
                w-full px-3 py-2.5 rounded-yamo-input
                border border-yamo-fog
                font-inter text-sm text-yamo-ebony placeholder:text-yamo-ash
                focus:outline-none focus:border-yamo-red focus:ring-1 focus:ring-yamo-red
                transition-colors
              "
            />
            {phoneForm.formState.errors.display_name && (
              <p className="mt-1 text-xs text-yamo-error">
                {phoneForm.formState.errors.display_name.message}
              </p>
            )}
          </div>

          {/* Phone */}
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
                font-inter text-sm text-yamo-ebony placeholder:text-yamo-ash
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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium font-inter text-yamo-ebony mb-2">
              {t('role_label')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['customer', 'merchant'] as const).map((role) => (
                <label key={role} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={role}
                    {...phoneForm.register('role')}
                    className="sr-only peer"
                  />
                  <div className="
                    p-3 rounded-yamo-chip border-2 border-yamo-fog
                    peer-checked:border-yamo-red peer-checked:bg-yamo-red-light
                    text-center transition-all duration-150
                  ">
                    <span className="block text-lg mb-0.5">
                      {role === 'customer' ? '🛵' : '🍽️'}
                    </span>
                    <span className="font-inter text-xs font-semibold text-yamo-ebony">
                      {role === 'customer' ? t('role_customer_short') : t('role_merchant_short')}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {phoneForm.formState.errors.role && (
              <p className="mt-1 text-xs text-yamo-error">
                {phoneForm.formState.errors.role.message}
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
        /* ── Step 2: OTP entry ───────────────────────────────────────────── */
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
              autoComplete="one-time-code"
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
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? '…' : t('create_account')}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); otpForm.reset(); }}
            className="w-full text-sm font-inter text-yamo-ash hover:text-yamo-ebony underline"
          >
            {t('change_number')}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm font-inter text-yamo-ash">
        {t('already_account')}{' '}
        <Link href="/login" className="text-yamo-red font-semibold hover:underline">
          {t('login_link')}
        </Link>
      </p>
    </>
  );
}
