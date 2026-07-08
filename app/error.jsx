'use client';
// Global error boundary — a friendly dead end instead of a blank screen.
export default function Error({ error, reset }) {
  console.error('Route error:', error);
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">🍫</div>
      <h1 style={{ marginBottom: '0.5rem' }}>Something melted</h1>
      <p style={{ color: '#6b5d52', marginBottom: '1.5rem' }}>
        An unexpected error interrupted this page. It&apos;s been logged — try again,
        or head back to browsing.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.65rem 1.4rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#A73A04', color: '#fff', fontSize: '1rem',
          }}
        >
          Try again
        </button>
        <a
          href="/browse"
          style={{
            padding: '0.65rem 1.4rem', borderRadius: 8, textDecoration: 'none',
            border: '1px solid #d9cec2', color: '#2d1810', fontSize: '1rem',
          }}
        >
          Browse chocolates
        </a>
      </div>
    </div>
  );
}
