'use client';
// Maker page body. Client component only because ChocolateCard needs auth
// context for its favorite button — all data arrives server-rendered.
import Link from 'next/link';
import ChocolateCard from '../../../src/components/ChocolateCard';
import '../../../src/views/CategoryLandingPage.css';

export default function MakerGridClient({ maker, chocolates, avgRating }) {
  return (
    <div className="category-landing-page">
      <div className="container">
        <header className="category-header">
          <h1>{maker.name}</h1>
          <p className="category-subtitle">
            {chocolates.length} chocolate bar{chocolates.length !== 1 ? 's' : ''} on Chocly
            {avgRating ? ` · ${avgRating.toFixed(1)}★ average across rated bars` : ''}
          </p>
        </header>

        {chocolates.length > 0 ? (
          <div className="chocolate-grid">
            {chocolates.map((chocolate) => (
              <ChocolateCard key={chocolate.id} chocolate={chocolate} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>We haven&apos;t catalogued any bars from {maker.name} yet.</p>
            <Link href="/add-chocolate" className="btn btn-primary">
              Add the first one
            </Link>
          </div>
        )}

        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light, #e8e0d8)' }}>
          <h2>Explore More</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            <Link href="/maker" className="btn btn-outline">All Makers</Link>
            <Link href="/browse" className="btn btn-outline">Browse All Chocolates</Link>
            <Link href="/category" className="btn btn-outline">Browse by Category</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
