import { getChocolatesByCategoryServer } from '../../../../src/lib/firebase-server';
import CategoryLandingClient from './CategoryLandingClient';

export const revalidate = 21600; // ISR: revalidate every 6 hours

// Map category type/value to Firestore field
function getCategoryFilter(categoryType, categoryValue) {
  switch (categoryType) {
    case 'origin':
      // Capitalize first letter for Firestore query
      return { field: 'origin', value: categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1) };
    case 'type':
      return { field: 'type', value: categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1) };
    case 'percentage':
      return { field: 'cacaoPercentage', value: parseInt(categoryValue, 10) };
    default:
      return null;
  }
}

// Category SEO configs
const categoryConfigs = {
  percentage: {
    '70': { title: 'Best 70% Dark Chocolate', desc: 'Discover premium 70% dark chocolate bars with expert reviews. Perfect balance of intensity and smoothness.' },
    '85': { title: 'Best 85% Dark Chocolate', desc: 'Explore intense 85% dark chocolate for serious enthusiasts. Expert reviews of the most sophisticated dark chocolates.' },
    '100': { title: '100% Pure Cacao Chocolate', desc: 'Experience pure chocolate with 100% cacao bar reviews. No sugar, just pure chocolate intensity.' },
  },
  origin: {
    ecuador: { title: 'Best Ecuador Chocolate', desc: 'Discover exceptional Ecuador chocolate. From Arriba Nacional beans to modern craft chocolate, explore Ecuador\'s finest.' },
    madagascar: { title: 'Best Madagascar Chocolate', desc: 'Explore Madagascar chocolate with distinctive red fruit and spice notes. Reviews of the best single origin bars.' },
    venezuela: { title: 'Best Venezuela Chocolate', desc: 'Experience Venezuela\'s legendary Criollo cacao. From Chuao to Sur del Lago, discover chocolate treasures.' },
    ghana: { title: 'Best Ghana Chocolate', desc: 'Discover rich, full-bodied Ghana chocolate. West Africa\'s finest cacao reviewed and rated.' },
    peru: { title: 'Best Peru Chocolate', desc: 'Explore diverse Peru chocolate from the Amazon to the Andes. Unique single origin bars reviewed.' },
    colombia: { title: 'Best Colombia Chocolate', desc: 'Colombia\'s emerging craft chocolate scene. Fine flavor cacao reviewed and rated on Chocly.' },
  },
  type: {
    dark: { title: 'Best Dark Chocolate', desc: 'Comprehensive dark chocolate reviews from 70% to 100% cacao. Find your perfect dark chocolate.' },
    milk: { title: 'Best Milk Chocolate', desc: 'Premium milk chocolate reviews. Discover artisan milk chocolates that go beyond the ordinary.' },
    white: { title: 'Best White Chocolate', desc: 'White chocolate reviews for cocoa butter enthusiasts. Discover premium craft white chocolate bars.' },
  },
};

export async function generateMetadata({ params }) {
  const { categoryType, categoryValue } = await params;
  const config = categoryConfigs[categoryType]?.[categoryValue.toLowerCase()];

  const displayValue = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);
  const title = config?.title || `Best ${displayValue} Chocolate Reviews & Ratings`;
  const description = config?.desc || `Discover the best ${displayValue} chocolates with expert reviews and ratings on Chocly.`;

  return {
    title: `${title} 2026 - Reviews & Ratings`,
    description,
    openGraph: {
      title: `${title} 2026 - Reviews & Ratings | Chocly`,
      description,
      url: `https://chocly.co/category/${categoryType}/${categoryValue}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://chocly.co/category/${categoryType}/${categoryValue}`,
    },
  };
}

export default async function CategoryLandingPage({ params }) {
  const { categoryType, categoryValue } = await params;
  const filter = getCategoryFilter(categoryType, categoryValue);

  let chocolates = [];
  if (filter) {
    // For percentage, we need a different query (integer comparison)
    if (categoryType === 'percentage') {
      // REST API doesn't easily handle integer equality; fetch and filter
      chocolates = await getChocolatesByCategoryServer('type', 'Dark', 200);
      const pct = parseInt(categoryValue, 10);
      chocolates = chocolates.filter(c => c.cacaoPercentage === pct);
    } else {
      chocolates = await getChocolatesByCategoryServer(filter.field, filter.value);
    }
  }

  const displayValue = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);
  const config = categoryConfigs[categoryType]?.[categoryValue.toLowerCase()];

  // ItemList structured data for category pages
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config?.title || `Best ${displayValue} Chocolate`,
    description: config?.desc || `Top-rated ${displayValue} chocolates on Chocly`,
    numberOfItems: chocolates.length,
    itemListElement: chocolates.slice(0, 20).map((choc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${choc.name} by ${choc.maker || 'Unknown'}`,
      url: `https://chocly.co/chocolate/${choc.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryLandingClient
        categoryType={categoryType}
        categoryValue={categoryValue}
        serverChocolates={chocolates}
      />
    </>
  );
}
