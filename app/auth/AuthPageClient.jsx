'use client';
import { Suspense } from 'react';
import UnifiedAuthPage from '../../src/components/auth/UnifiedAuthPage';
export default function AuthPageClient() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <UnifiedAuthPage />
    </Suspense>
  );
}
