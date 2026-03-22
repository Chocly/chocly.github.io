'use client';
import { Suspense } from 'react';
import SearchResultsPage from '../../src/views/SearchResultsPage';
export default function SearchPageClient() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}
