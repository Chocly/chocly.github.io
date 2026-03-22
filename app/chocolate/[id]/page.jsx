import { getChocolateByIdServer, getChocolateReviewsServer, getAllChocolateIdsServer } from '../../../src/lib/firebase-server';
import ChocolateDetailClient from './ChocolateDetailClient';

export const revalidate = 3600; // ISR: revalidate every hour

// Generate static params for all chocolates at build time
export async function generateStaticParams() {
  const chocolates = await getAllChocolateIdsServer();
  return chocolates.map((choc) => ({ id: choc.id }));
}

// Dynamic SEO metadata per chocolate
export async function generateMetadata({ params }) {
  const { id } = await params;
  const chocolate = await getChocolateByIdServer(id);

  if (!chocolate) {
    return {
      title: 'Chocolate Not Found',
      description: 'The chocolate you are looking for could not be found on Chocly.',
    };
  }

  const reviews = await getChocolateReviewsServer(id);
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
      url: `https://chocly.co/chocolate/${id}`,
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
      canonical: `https://chocly.co/chocolate/${id}`,
    },
  };
}

export default async function ChocolateDetailPage({ params }) {
  const { id } = await params;
  const chocolate = await getChocolateByIdServer(id);
  const reviews = await getChocolateReviewsServer(id);

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
      url: `https://chocly.co/chocolate/${id}`,
    };

    // Add additional properties
    if (chocolate.cacaoPercentage) {
      productSchema.additionalProperty = [
        { '@type': 'PropertyValue', name: 'Cacao Percentage', value: `${chocolate.cacaoPercentage}%` },
      ];
      if (chocolate.origin) {
        productSchema.additionalProperty.push(
          { '@type': 'PropertyValue', name: 'Origin', value: chocolate.origin }
        );
      }
      if (chocolate.type) {
        productSchema.additionalProperty.push(
          { '@type': 'PropertyValue', name: 'Type', value: chocolate.type }
        );
      }
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
        { '@type': 'ListItem', position: 3, name: chocolate.name, item: `https://chocly.co/chocolate/${id}` },
      ],
    });

    // FAQ schema
    const faqs = [
      {
        '@type': 'Question',
        name: `What does ${chocolate.name} taste like?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${chocolate.name} by ${chocolate.maker} is a ${chocolate.cacaoPercentage || ''}% ${(chocolate.type || 'artisan').toLowerCase()} chocolate${chocolate.origin ? ` from ${chocolate.origin}` : ''}. ${reviews.length > 0 ? `Based on ${reviews.length} reviews, it has an average rating of ${avgRating.toFixed(1)}/5.` : 'Be the first to review it on Chocly.'}`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I buy ${chocolate.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${chocolate.name} by ${chocolate.maker} can be purchased from specialty chocolate retailers, online stores, or directly from ${chocolate.maker}. Visit Chocly for reviews and availability information.`,
        },
      },
    ];

    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs,
    });
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
        chocolateId={id}
        serverChocolate={chocolate}
        serverReviews={reviews}
      />
    </>
  );
}
