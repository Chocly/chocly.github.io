import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>Page Not Found</h1>
      <p style={{ marginTop: '1rem', color: '#788390' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#A73A04', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
        Go Home
      </Link>
    </div>
  );
}
