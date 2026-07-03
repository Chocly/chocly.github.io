import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { getAllMakersServer } from '../../src/lib/firebase-server';
import { makerUrl } from '../../src/utils/slug';

export const revalidate = 21600; // ISR: 6 hours

export const metadata = {
  title: 'Chocolate Makers A–Z — Craft & Fine Chocolate Brands',
  description:
    'Directory of every chocolate maker on Chocly, from bean-to-bar craft producers to fine chocolate houses. Browse each maker’s bars, reviews and ratings.',
  alternates: { canonical: 'https://chocly.co/maker' },
};

export default async function MakerIndexPage({ searchParams }) {
  // Legacy /maker?maker=Name URLs permanently redirect to /maker/[slug]
  const { maker } = await searchParams;
  if (maker) {
    permanentRedirect(makerUrl(maker));
  }

  const makers = await getAllMakersServer();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Chocolate makers on Chocly',
    numberOfItems: makers.length,
    itemListElement: makers.slice(0, 50).map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.name,
      url: `https://chocly.co/maker/${m.slug}`,
    })),
  };

  // Group alphabetically
  const groups = new Map();
  for (const m of makers) {
    const letter = /^[a-z]/i.test(m.name) ? m.name[0].toUpperCase() : '#';
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(m);
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>Chocolate Makers</h1>
      <p style={{ color: '#6b5d52', maxWidth: '60ch' }}>
        {makers.length} makers catalogued on Chocly — from bean-to-bar craft
        producers to fine chocolate houses. Every maker page lists their bars
        with community reviews and ratings.
      </p>

      {[...groups.entries()].map(([letter, group]) => (
        <section key={letter} style={{ margin: '2rem 0' }}>
          <h2 style={{ borderBottom: '1px solid #e8e0d8', paddingBottom: '0.35rem' }}>{letter}</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem 1.5rem' }}>
            {group.map((m) => (
              <li key={m.slug}>
                <Link href={`/maker/${m.slug}`} style={{ textDecoration: 'none' }}>
                  {m.name}
                </Link>{' '}
                <span style={{ color: '#9a8a7c', fontSize: '0.85em' }}>({m.barCount})</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
