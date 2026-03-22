export const dynamic = 'force-dynamic';

import CategoryPageClient from './CategoryPageClient';

export const metadata = {
  title: 'Browse by Category',
  description: 'Browse chocolates by category. Explore dark, milk, white chocolate, or filter by origin and cacao percentage.',
  alternates: { canonical: 'https://chocly.co/category' },
};

export default function CategoryPage() {
  return <CategoryPageClient />;
}
