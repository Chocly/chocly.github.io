import { getAllChocolateIdsServer } from '../src/lib/firebase-server';

export default async function sitemap() {
  const chocolates = await getAllChocolateIdsServer();

  // Static pages
  const staticPages = [
    { url: 'https://chocly.co', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://chocly.co/browse', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://chocly.co/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://chocly.co/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://chocly.co/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://chocly.co/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://chocly.co/community', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  // Category pages
  const categories = [
    // Types
    'category/type/dark', 'category/type/milk', 'category/type/white',
    // Origins
    'category/origin/ecuador', 'category/origin/madagascar', 'category/origin/venezuela',
    'category/origin/ghana', 'category/origin/peru', 'category/origin/colombia',
    'category/origin/tanzania', 'category/origin/dominican-republic',
    // Percentages
    'category/percentage/70', 'category/percentage/85', 'category/percentage/100',
  ];

  const categoryPages = categories.map((cat) => ({
    url: `https://chocly.co/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // All chocolate detail pages
  const chocolatePages = chocolates.map((choc) => ({
    url: `https://chocly.co/chocolate/${choc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...chocolatePages];
}
