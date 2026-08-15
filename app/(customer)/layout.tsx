'use client';
/**
 * Customer layout — bottom navigation bar.
 * Client component so usePathname() can hide the nav on focused flows
 * (checkout, confirmation). Server-rendered children are passed through
 * as props per Next.js App Router convention — no RSC functionality lost.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconChip } from '@/components/SpriteIcon';
import { CartDrawer } from '@/components/customer/CartDrawer';

// Routes where the bottom nav should be hidden (focused flows)
const HIDE_NAV_ON: string[] = ['/customer/checkout'];
const HIDE_NAV_PREFIX: string[] = ['/customer/confirmation/'];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const hideNav =
    HIDE_NAV_ON.includes(pathname) ||
    HIDE_NAV_PREFIX.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="min-h-dvh bg-yamo-cream flex flex-col">
      {/* Page content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Cart drawer — persists across page navigations */}
      <CartDrawer />

      {/* Bottom navigation — hidden on checkout + confirmation */}
      {!hideNav && (
        <nav
          aria-label="Navigation principale"
          className="
            fixed bottom-0 z-50 h-16
            left-1/2 -translate-x-1/2 w-full max-w-[430px]
            bg-yamo-white border-t border-yamo-fog
            flex items-center justify-around
            pb-safe shadow-yamo-nav
          "
        >
          <NavItem href="/customer" label={t('home')} icon="poulet-braise" />
          <NavItem href="/customer/search" label={t('search')} icon="sandwich" />
          <NavItem href="/customer/orders" label={t('orders')} icon="commande-confirmee" />
          <NavItem href="/customer/profile" label={t('profile')} icon="adresse-livraison" />
        </nav>
      )}
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: Parameters<typeof IconChip>[0]['name'];
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-yamo-ash hover:text-yamo-red transition-colors"
    >
      <IconChip name={icon} size={28} />
      <span className="text-[10px] font-inter font-medium">{label}</span>
    </Link>
  );
}
