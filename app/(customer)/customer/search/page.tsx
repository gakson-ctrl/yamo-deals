import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const metadata: Metadata = { title: 'Rechercher — YaMo Deals' };

// useSearchParams() inside SearchPageClient requires a Suspense boundary
export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
