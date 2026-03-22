'use client';
import { Suspense } from 'react';
import BrowseAllPage from '../../src/views/BrowseAllPage';
export default function BrowsePageClient() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <BrowseAllPage />
    </Suspense>
  );
}
