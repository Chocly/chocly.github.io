'use client';
// Wraps admin-only pages. Verifies the signed-in user's ID token against the
// server (/api/auth/verify-admin) before rendering children — admin tooling is
// never shown to unverified visitors. Firestore/Storage rules are the actual
// write enforcement; this keeps the tooling itself off-limits too.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminGuard({ children }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // checking | allowed | denied

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      setStatus('denied');
      router.replace('/auth');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch('/api/auth/verify-admin', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.admin) {
          setStatus('allowed');
        } else {
          setStatus('denied');
          router.replace('/');
        }
      } catch {
        if (!cancelled) {
          setStatus('denied');
          router.replace('/');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, loading, router]);

  if (status !== 'allowed') {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#6B5D52' }}>
        {status === 'checking' ? 'Checking access…' : 'Redirecting…'}
      </div>
    );
  }

  return children;
}
