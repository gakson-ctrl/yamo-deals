/**
 * Customer layout — bottom navigation bar.
 * Replaced page content slot renders /customer/* routes.
 */
import Link from 'next/link';
import { IconChip } from '@/components/SpriteIcon';
import { CartDrawer } from '@/components/customer/CartDrawer';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-yamo-cream flex flex-col">
      {/* Page content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Cart drawer — rendered here so it persists across page navigations */}
      <CartDrawer />

      {/* Bottom navigation */}
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
        <NavItem href="/customer" label="Accueil" icon="poulet-braise" />
        <NavItem href="/customer/search" label="Rechercher" icon="sandwich" />
        <NavItem href="/customer/orders" label="Commandes" icon="commande-confirmee" />
        <NavItem href="/customer/profile" label="Profil" icon="adresse-livraison" />
      </nav>
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
