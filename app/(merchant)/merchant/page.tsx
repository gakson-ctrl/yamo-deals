/**
 * Merchant Dashboard Home — placeholder until S5.
 * This page is replaced entirely in Session S5.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tableau de bord' };

export default function MerchantDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="font-sora font-bold text-2xl text-yamo-ebony mb-2">
        Tableau de bord marchand
      </h1>
      <p className="text-yamo-ash font-inter text-sm">
        Les statistiques et commandes arrivent en Session S5.
      </p>
    </div>
  );
}
