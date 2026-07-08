'use client';
import BatchImageUploadPage from '../../src/views/BatchImageUploadPage';
import AdminGuard from '../../src/components/auth/AdminGuard';

export default function BatchUploadClient() {
  return (
    <AdminGuard>
      <BatchImageUploadPage />
    </AdminGuard>
  );
}
