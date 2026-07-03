'use client';
import AdminPage from '../../src/views/AdminPage';
import AdminGuard from '../../src/components/auth/AdminGuard';

export default function AdminPageClient() {
  return (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  );
}
