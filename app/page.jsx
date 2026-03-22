import { getFeaturedChocolatesServer } from '../src/lib/firebase-server';
import HomePageClient from './HomePageClient';

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata = {
  title: 'Chocly - Chocolate Reviews, Ratings & Recommendations',
  description:
    'Discover 500+ craft and artisan chocolates from 30+ countries. Read expert reviews, compare ratings, and find your next favorite chocolate bar.',
  openGraph: {
    title: 'Chocly - Chocolate Reviews, Ratings & Recommendations',
    description:
      'Discover 500+ craft and artisan chocolates from 30+ countries. Read expert reviews, compare ratings, and find your next favorite chocolate bar.',
    url: 'https://chocly.co',
    type: 'website',
  },
  alternates: {
    canonical: 'https://chocly.co',
  },
};

export default async function HomePage() {
  // Fetch featured chocolates server-side for SEO
  const featuredChocolates = await getFeaturedChocolatesServer(6);

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
      <HomePageClient featuredChocolates={featuredChocolates} />
    </>
  );
}
