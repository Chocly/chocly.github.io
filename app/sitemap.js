import { getAllChocolateIdsServer, getAllMakersServer, getChocolatesByCategoryServer } from '../src/lib/firebase-server';

// Honest sitemap rules:
//  - lastModified comes from real data (updatedAt), not "now" on every build —
//    a lastmod that always changes teaches Google to ignore it.
//  - Thin category pages (fewer than MIN_CATEGORY_ITEMS bars) stay out until
//    they have enough content to deserve indexing.
//  - Chocolate URLs prefer slugs; maker pages are included.
const MIN_CATEGORY_ITEMS = 4;

function parseUpdatedAt(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap() {
  const [chocolates, makers] = await Promise.all([
    getAllChocolateIdsServer(),
    getAllMakersServer(),
  ]);

  const staticPages = [
    { url: 'https://chocly.co', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://chocly.co/browse', changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://chocly.co/category', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://chocly.co/maker', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://chocly.co/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://chocly.co/contact', changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://chocly.co/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://chocly.co/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Category pages: only those that actually have enough chocolates.
  const candidateCategories = [
    { path: 'category/type/dark', field: 'type', value: 'Dark' },
    { path: 'category/type/milk', field: 'type', value: 'Milk' },
    { path: 'category/type/white', field: 'type', value: 'White' },
    { path: 'category/origin/ecuador', field: 'origin', value: 'Ecuador' },
    { path: 'category/origin/madagascar', field: 'origin', value: 'Madagascar' },
    { path: 'category/origin/venezuela', field: 'origin', value: 'Venezuela' },
    { path: 'category/origin/ghana', field: 'origin', value: 'Ghana' },
    { path: 'category/origin/peru', field: 'origin', value: 'Peru' },
    { path: 'category/origin/colombia', field: 'origin', value: 'Colombia' },
    { path: 'category/origin/tanzania', field: 'origin', value: 'Tanzania' },
    { path: 'category/origin/dominican-republic', field: 'origin', value: 'Dominican Republic' },
    { path: 'category/percentage/70', field: 'cacaoPercentage', value: 70 },
    { path: 'category/percentage/85', field: 'cacaoPercentage', value: 85 },
    { path: 'category/percentage/100', field: 'cacaoPercentage', value: 100 },
  ];

  const categoryCounts = await Promise.all(
    candidateCategories.map(async (cat) => {
      const items = await getChocolatesByCategoryServer(cat.field, cat.value, MIN_CATEGORY_ITEMS);
      return { ...cat, count: items.length };
    })
  );

  const categoryPages = categoryCounts
    .filter((cat) => cat.count >= MIN_CATEGORY_ITEMS)
    .map((cat) => ({
      url: `https://chocly.co/${cat.path}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const makerPages = makers
    .filter((m) => m.barCount >= 1)
    .map((m) => ({
      url: `https://chocly.co/maker/${m.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  const chocolatePages = chocolates.map((choc) => ({
    url: `https://chocly.co/chocolate/${choc.slug || choc.id}`,
    lastModified: parseUpdatedAt(choc.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...makerPages, ...chocolatePages];
}
