/**
 * Auth layout — centered card, no bottom nav.
 * Shared by /login and /register.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-yamo-cream flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <span className="font-sora font-bold text-3xl text-yamo-red tracking-tight">
          YaMo
        </span>
        <span className="font-sora font-bold text-3xl text-yamo-ebony tracking-tight">
          Deals
        </span>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm bg-yamo-white rounded-yamo-card shadow-yamo-card p-6">
        {children}
      </div>
    </main>
  );
}
