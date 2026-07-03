'use client';
import SuperAdminEditPage from '../../../../src/views/SuperAdminEditPage';
import AdminGuard from '../../../../src/components/auth/AdminGuard';

export default function EditPageClient() {
  return (
    <AdminGuard>
      <SuperAdminEditPage />
    </AdminGuard>
  );
}
