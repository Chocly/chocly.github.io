'use client';

import { useState } from 'react';
import Link from 'next/link';
import ChocolateCard from '../../../../src/components/ChocolateCard';
import Breadcrumb from '../../../../src/components/Breadcrumb';
import '../../../../src/views/CategoryLandingPage.css';

export default function CategoryLandingClient({ categoryType, categoryValue, serverChocolates }) {
  const [chocolates] = useState(serverChocolates || []);
  const displayValue = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);

  const typeLabel = {
    origin: 'Origin',
    type: 'Type',
    percentage: 'Cacao %',
  }[categoryType] || 'Category';

  return (
    <div className="category-landing-page">
      <Breadcrumb items={[
        { label: 'Home', path: '/' },
        { label: 'Browse', path: '/browse' },
        { label: `${displayValue} Chocolate` }
      ]} />

      <div className="container">
        <header className="category-header">
          <h1>Best {displayValue} Chocolate</h1>
          <p className="category-subtitle">
            {chocolates.length} {displayValue.toLowerCase()} chocolates reviewed and rated by the Chocly community.
          </p>
        </header>

        {chocolates.length > 0 ? (
          <div className="chocolate-grid">
            {chocolates.map(choc => (
              <ChocolateCard key={choc.id} chocolate={choc} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No chocolates found</h3>
            <p>We don&apos;t have any {displayValue.toLowerCase()} chocolates in our database yet.</p>
            <Link href="/browse" className="btn btn-primary">Browse All Chocolates</Link>
          </div>
        )}

        {/* Related categories for internal linking */}
        <section className="related-categories" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
          <h2>Explore More Categories</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            {categoryType !== 'type' && (
              <>
                <Link href="/category/type/dark" className="btn btn-outline">Dark Chocolate</Link>
                <Link href="/category/type/milk" className="btn btn-outline">Milk Chocolate</Link>
                <Link href="/category/type/white" className="btn btn-outline">White Chocolate</Link>
              </>
            )}
            {categoryType !== 'origin' && (
              <>
                <Link href="/category/origin/ecuador" className="btn btn-outline">Ecuador</Link>
                <Link href="/category/origin/madagascar" className="btn btn-outline">Madagascar</Link>
                <Link href="/category/origin/venezuela" className="btn btn-outline">Venezuela</Link>
              </>
            )}
            {categoryType !== 'percentage' && (
              <>
                <Link href="/category/percentage/70" className="btn btn-outline">70% Cacao</Link>
                <Link href="/category/percentage/85" className="btn btn-outline">85% Cacao</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
