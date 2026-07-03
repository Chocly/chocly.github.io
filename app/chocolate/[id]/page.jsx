import { permanentRedirect, notFound } from 'next/navigation';
import { cache } from 'react';
import { resolveChocolateServer, getChocolateReviewsServer, getAllChocolateIdsServer } from '../../../src/lib/firebase-server';
import ChocolateDetailClient from './ChocolateDetailClient';

export const revalidate = 3600; // ISR: revalidate every hour

// Memoize per request: generateMetadata and the page share one lookup.
const resolveChocolate = cache(resolveChocolateServer);

// Canonical URL segment for a chocolate: slug when it has one, ID otherwise.
const canonicalParam = (choc) => choc.slug || choc.id;

// Generate static params for all chocolates at build time
export async function generateStaticParams() {
  const chocolates = await getAllChocolateIdsServer();
  return chocolates.map((choc) => ({ id: canonicalParam(choc) }));
}

// Dynamic SEO metadata per chocolate
export async function generateMetadata({ params }) {
  const { id } = await params;
  const chocolate = await resolveChocolate(id);

  if (!chocolate) {
    return {
      title: 'Chocolate Not Found',
      description: 'The chocolate you are looking for could not be found on Chocly.',
    };
  }

  const reviews = await getChocolateReviewsServer(chocolate.id);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const title = `${chocolate.name} by ${chocolate.maker}${chocolate.cacaoPercentage ? ` - ${chocolate.cacaoPercentage}%` : ''} Chocolate Review`;

  const descParts = [`${chocolate.name} by ${chocolate.maker} chocolate review`];
  if (avgRating && reviews.length > 0) {
    descParts.push(`Rated ${avgRating}/5 by ${reviews.length} reviewer${reviews.length !== 1 ? 's' : ''}`);
  }
  if (chocolate.cacaoPercentage) descParts.push(`${chocolate.cacaoPercentage}% cacao`);
  if (chocolate.type) descParts.push(`${chocolate.type.toLowerCase()} chocolate`);
  if (chocolate.origin) descParts.push(`from ${chocolate.origin}`);
  descParts.push('Read tasting notes and expert reviews on Chocly');
  const description = descParts.join('. ') + '.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://chocly.co/chocolate/${canonicalParam(chocolate)}`,
      type: 'article',
      images: chocolate.imageUrl && !chocolate.imageUrl.includes('placehold')
        ? [{ url: chocolate.imageUrl, alt: `${chocolate.name} by ${chocolate.maker}` }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://chocly.co/chocolate/${canonicalParam(chocolate)}`,
    },
  };
}

export default async function ChocolateDetailPage({ params }) {
  const { id } = await params;
  const chocolate = await resolveChocolate(id);

  // Real 404 (not a soft one) so search engines drop dead URLs.
  if (!chocolate) {
    notFound();
  }

  // Old ID links permanently redirect to the slug URL once a slug exists.
  if (chocolate.slug && id !== chocolate.slug) {
    permanentRedirect(`/chocolate/${chocolate.slug}`);
  }

  const reviews = await getChocolateReviewsServer(chocolate.id);

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : chocolate?.averageRating || 0;

  // Structured data: Product + AggregateRating + Reviews + BreadcrumbList + FAQ
  const jsonLd = [];

  if (chocolate) {
    // Product schema with reviews
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: chocolate.name,
      description: chocolate.description || `${chocolate.name} by ${chocolate.maker}${chocolate.cacaoPercentage ? `, ${chocolate.cacaoPercentage}% cacao` : ''}${chocolate.type ? `, ${chocolate.type.toLowerCase()} chocolate` : ''}${chocolate.origin ? ` from ${chocolate.origin}` : ''}.`,
      image: chocolate.imageUrl || undefined,
      brand: {
        '@type': 'Organization',
        name: chocolate.maker || 'Unknown Maker',
      },
      category: 'Chocolate',
      url: `https://chocly.co/chocolate/${canonicalParam(chocolate)}`,
    };

    // Add additional properties (every fact the page shows, machine-readable)
    const props = [];
    if (chocolate.cacaoPercentage) props.push({ '@type': 'PropertyValue', name: 'Cacao Percentage', value: `${chocolate.cacaoPercentage}%` });
    if (chocolate.origin) props.push({ '@type': 'PropertyValue', name: 'Origin', value: chocolate.origin });
    if (chocolate.type) props.push({ '@type': 'PropertyValue', name: 'Type', value: chocolate.type });
    if (chocolate.ingredients) {
      const ingredients = Array.isArray(chocolate.ingredients)
        ? chocolate.ingredients.join(', ')
        : String(chocolate.ingredients);
      props.push({ '@type': 'PropertyValue', name: 'Ingredients', value: ingredients });
    }
    if (props.length > 0) productSchema.additionalProperty = props;

    // NutritionInformation from the data we already hold
    const n = chocolate.nutritionalInfo;
    if (n && (n.calories != null || n.fat != null || n.sugar != null || n.protein != null)) {
      productSchema.nutrition = {
        '@type': 'NutritionInformation',
        servingSize: n.servingSize || undefined,
        calories: n.calories != null ? `${n.calories} calories` : undefined,
        fatContent: n.fat != null ? `${n.fat} g` : undefined,
        sugarContent: n.sugar != null ? `${n.sugar} g` : undefined,
        proteinContent: n.protein != null ? `${n.protein} g` : undefined,
      };
    }

    // Add aggregate rating
    if (reviews.length > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      };

      // Add individual reviews (up to 10 for structured data)
      productSchema.review = reviews.slice(0, 10).map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.userName || review.displayName || 'Chocolate Lover',
        },
        datePublished: review.createdAt || undefined,
        reviewBody: review.text || undefined,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      }));
    }

    jsonLd.push(productSchema);

    // BreadcrumbList schema
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chocly.co/' },
        { '@type': 'ListItem', position: 2, name: 'Browse', item: 'https://chocly.co/browse' },
        { '@type': 'ListItem', position: 3, name: chocolate.name, item: `https://chocly.co/chocolate/${canonicalParam(chocolate)}` },
      ],
    });

    // (Templated FAQ schema removed intentionally: Google restricted FAQ rich
    // results to authoritative content in 2023, and boilerplate Q&A is noise
    // to AI engines. Real data lives in Product.additionalProperty/nutrition.)
  }

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ChocolateDetailClient
        chocolateId={chocolate ? chocolate.id : id}
        serverChocolate={chocolate}
        serverReviews={reviews}
      />
    </>
  );
}
