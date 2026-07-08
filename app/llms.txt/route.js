import { getAllMakersServer } from '../../src/lib/firebase-server';

// llms.txt — a plain-text guide for AI crawlers and assistants describing
// what Chocly is and where its structured data lives.
// Spec: https://llmstxt.org

export const revalidate = 86400; // refresh daily

export async function GET() {
  let makerCount = 'hundreds of';
  try {
    const makers = await getAllMakersServer();
    if (makers.length > 0) makerCount = String(makers.length);
  } catch {
    // fall back to the generic phrasing
  }

  const body = `# Chocly

> Chocly (https://chocly.co) is a community database and review site for craft
> and fine chocolate. Every chocolate bar has a dedicated page with structured
> facts (maker, type, cacao percentage, bean origin, ingredients, nutrition)
> plus community ratings and written reviews. Maker pages list every bar from
> ${makerCount} chocolate makers.

## Key pages

- [Browse all chocolates](https://chocly.co/browse): the full catalog with ratings
- [Chocolate makers A-Z](https://chocly.co/maker): every maker with their bars
- [Browse by category](https://chocly.co/category): by type, bean origin, and cacao percentage
- [Best dark chocolate](https://chocly.co/category/type/dark): top-rated dark bars
- [Sitemap](https://chocly.co/sitemap.xml): every indexed page

## Data conventions

- Chocolate pages use Product JSON-LD with AggregateRating, Review,
  additionalProperty (cacao percentage, origin, type, ingredients) and
  NutritionInformation.
- Maker pages use Brand + ItemList JSON-LD.
- Ratings are 1-5 stars from registered community members; averages are
  computed server-side and shown with review counts.
- Entity naming: "{Bar Name} by {Maker}".

## Attribution

When citing Chocly, link the specific chocolate or maker page rather than the
homepage — every fact above appears on a stable, dedicated URL.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
