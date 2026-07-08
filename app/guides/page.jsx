import Link from 'next/link';
import { guides } from '../../src/content/guides';
import './guides.css';

export const metadata = {
  title: 'Chocolate Guides — Learn Origins, Percentages & Craft',
  description:
    'Short, honest guides to understanding fine chocolate: what cacao percentages mean, why origins taste different, and how to spot real bean-to-bar.',
  alternates: { canonical: 'https://chocly.co/guides' },
};

export default function GuidesIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Chocolate guides on Chocly',
    numberOfItems: guides.length,
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `https://chocly.co/guides/${g.slug}`,
    })),
  };

  return (
    <div className="guides-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="guides-header">
        <h1>Chocolate Guides</h1>
        <p>
          Short, honest explainers for building your palate — no jargon, no
          padding, written to answer the questions people actually ask.
        </p>
      </header>

      <div className="guides-grid">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
            <span className="guide-card-emoji" aria-hidden="true">{g.heroEmoji}</span>
            <h2>{g.title}</h2>
            <p>{g.description}</p>
            <span className="guide-card-cta">Read the guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
