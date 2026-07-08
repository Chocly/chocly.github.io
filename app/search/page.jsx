import SearchPageClient from './SearchPageClient';

export const metadata = {
  title: 'Search Chocolates',
  description: 'Search the Chocly chocolate database. Find reviews and ratings for any chocolate bar.',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <SearchPageClient />;
}
