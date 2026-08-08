/**
 * Merchant layout — top header + bottom navigation.
 */
import Link from 'next/link';

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-yamo-cream flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-yamo-white border-b border-yamo-fog px-4 h-14 flex items-center justify-between">
        <span className="font-sora font-bold text-lg text-yamo-ebony">
          <span className="text-yamo-red">YaMo</span> Merchant
        </span>
        {/* Restaurant online/offline toggle comes in S5 */}
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav
        aria-label="Navigation marchand"
        className="
          fixed bottom-0 z-50 h-16
          left-1/2 -translate-x-1/2 w-full max-w-[430px]
          bg-yamo-white border-t border-yamo-fog
          flex items-center justify-around
          pb-safe
        "
      >
        <MerchantNavItem href="/merchant" label="Tableau de bord" />
        <MerchantNavItem href="/merchant/orders" label="Commandes" />
        <MerchantNavItem href="/merchant/menu" label="Menu" />
        <MerchantNavItem href="/merchant/earnings" label="Revenus" />
      </nav>
    </div>
  );
}

function MerchantNavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-yamo-ash hover:text-yamo-red transition-colors"
    >
      <span className="text-[10px] font-inter font-medium">{label}</span>
    </Link>
  );
}
