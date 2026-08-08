import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  IconLayoutDashboard,
  IconClipboardList,
  IconToolsKitchen2,
  IconReportMoney,
} from '@tabler/icons-react';

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('nav');
  const tCommon = await getTranslations('common');

  return (
    <div className="min-h-dvh bg-yamo-cream flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-yamo-white border-b border-yamo-fog px-4 h-14 flex items-center justify-between">
        <span className="font-sora font-bold text-lg text-yamo-ebony">
          <span className="text-yamo-red">YaMo</span> Merchant
        </span>
        <span className="text-[10px] font-inter font-bold text-yamo-red border border-yamo-red rounded-yamo-chip px-2 py-0.5 tracking-wider">
          {tCommon('demo_badge')}
        </span>
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
        <MerchantNavItem href="/merchant" label={t('dashboard')}>
          <IconLayoutDashboard size={22} stroke={1.75} />
        </MerchantNavItem>
        <MerchantNavItem href="/merchant/orders" label={t('orders')}>
          <IconClipboardList size={22} stroke={1.75} />
        </MerchantNavItem>
        <MerchantNavItem href="/merchant/menu" label={t('menu')}>
          <IconToolsKitchen2 size={22} stroke={1.75} />
        </MerchantNavItem>
        <MerchantNavItem href="/merchant/earnings" label={t('earnings')}>
          <IconReportMoney size={22} stroke={1.75} />
        </MerchantNavItem>
      </nav>
    </div>
  );
}

function MerchantNavItem({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-yamo-ash hover:text-yamo-red transition-colors"
    >
      {children}
      <span className="text-[10px] font-inter font-medium">{label}</span>
    </Link>
  );
}
