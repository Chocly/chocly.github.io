import { getFeaturedChocolatesServer, getSiteStatsServer } from '../src/lib/firebase-server';
import HomePageClient from './HomePageClient';

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata = {
  title: 'Chocly - Chocolate Reviews, Ratings & Recommendations',
  description:
    'Discover craft and artisan chocolate from around the world. Read community reviews, compare ratings, and find your next favorite chocolate bar.',
  openGraph: {
    title: 'Chocly - Chocolate Reviews, Ratings & Recommendations',
    description:
      'Discover craft and artisan chocolate from around the world. Read community reviews, compare ratings, and find your next favorite chocolate bar.',
    url: 'https://chocly.co',
    type: 'website',
  },
  alternates: {
    canonical: 'https://chocly.co',
  },
};

export default async function HomePage() {
  // Fetch featured chocolates + real stats server-side for SEO
  const [featuredChocolates, stats] = await Promise.all([
    getFeaturedChocolatesServer(6),
    getSiteStatsServer(),
  ]);

  // Organization + WebSite structured data
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Chocly',
      url: 'https://chocly.co',
      logo: 'https://chocly.co/assets/logolight.png',
      description:
        'The world\'s leading chocolate review platform. Discover, rate, and review craft chocolate from around the globe.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Chocly',
      url: 'https://chocly.co',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://chocly.co/search?query={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HomePageClient featuredChocolates={featuredChocolates} stats={stats} />
    </>
  );
}
