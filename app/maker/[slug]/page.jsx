import { notFound } from 'next/navigation';
import { cache } from 'react';
import {
  getAllMakersServer,
  getMakerBySlugServer,
  getChocolatesByCategoryServer,
} from '../../../src/lib/firebase-server';
import MakerGridClient from './MakerGridClient';

export const revalidate = 21600; // ISR: 6 hours

const getMaker = cache(getMakerBySlugServer);

export async function generateStaticParams() {
  const makers = await getAllMakersServer();
  return makers.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const maker = await getMaker(slug);

  if (!maker) {
    return { title: 'Maker Not Found' };
  }

  const title = `${maker.name} Chocolate — All Bars, Reviews & Ratings`;
  const description = `Every ${maker.name} chocolate bar on Chocly: ${maker.barCount} bar${maker.barCount !== 1 ? 's' : ''} with community reviews, ratings, cacao percentages and tasting notes.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Chocly`,
      description,
      url: `https://chocly.co/maker/${maker.slug}`,
      type: 'website',
    },
    alternates: { canonical: `https://chocly.co/maker/${maker.slug}` },
  };
}

export default async function MakerPage({ params }) {
  const { slug } = await params;
  const maker = await getMaker(slug);

  if (!maker) {
    notFound();
  }

  const chocolates = await getChocolatesByCategoryServer('maker', maker.name, 200);

  const rated = chocolates.filter((c) => (c.reviewCount || 0) > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, c) => sum + (c.averageRating || 0), 0) / rated.length
    : null;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: maker.name,
      url: `https://chocly.co/maker/${maker.slug}`,
      ...(avgRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: rated.reduce((sum, c) => sum + (c.reviewCount || 0), 0),
          bestRating: 5,
          worstRating: 1,
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${maker.name} chocolate bars`,
      numberOfItems: chocolates.length,
      itemListElement: chocolates.slice(0, 25).map((choc, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: choc.name,
        url: `https://chocly.co/chocolate/${choc.slug || choc.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chocly.co/' },
        { '@type': 'ListItem', position: 2, name: 'Makers', item: 'https://chocly.co/maker' },
        { '@type': 'ListItem', position: 3, name: maker.name, item: `https://chocly.co/maker/${maker.slug}` },
      ],
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
      <MakerGridClient
        maker={maker}
        chocolates={chocolates}
        avgRating={avgRating}
      />
    </>
  );
}
