'use client';
import { Suspense } from 'react';
import MakerPage from '../../src/views/MakerPage';
export default function MakerPageClient() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <MakerPage />
    </Suspense>
  );
}
