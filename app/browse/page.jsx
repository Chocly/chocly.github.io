import { getBrowseChocolatesServer } from '../../src/lib/firebase-server';
import { sortByWeightedRating } from '../../src/utils/rating';
import BrowsePageClient from './BrowsePageClient';

export const revalidate = 21600; // ISR: 6 hours

export const metadata = {
  title: 'Browse All Chocolates - Reviews & Ratings',
  description: 'Browse craft and fine chocolate from around the world. Filter by type, origin, cacao percentage, and rating. Find your perfect chocolate bar.',
  alternates: { canonical: 'https://chocly.co/browse' },
};

export default async function BrowsePage() {
  // Server-render the first page of the catalog so crawlers (and first paint)
  // see real chocolates with real links — the client layer adds filtering.
  const serverChocolates = sortByWeightedRating(await getBrowseChocolatesServer(100));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Browse All Chocolates on Chocly',
    numberOfItems: serverChocolates.length,
    itemListElement: serverChocolates.slice(0, 25).map((choc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${choc.name} by ${choc.maker || 'Unknown'}`,
      url: `https://chocly.co/chocolate/${choc.slug || choc.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrowsePageClient serverChocolates={serverChocolates} />
    </>
  );
}
