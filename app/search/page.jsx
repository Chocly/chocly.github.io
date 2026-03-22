import SearchPageClient from './SearchPageClient';

export const metadata = {
  title: 'Search Chocolates',
  description: 'Search our database of 500+ chocolates. Find reviews and ratings for any chocolate bar.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
