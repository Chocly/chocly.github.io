import BrowsePageClient from './BrowsePageClient';

export const metadata = {
  title: 'Browse All Chocolates - Reviews & Ratings',
  description: 'Browse 500+ chocolates from 30+ countries. Filter by type, origin, cacao percentage, and rating. Find your perfect chocolate bar.',
  alternates: { canonical: 'https://chocly.co/browse' },
};

export default function BrowsePage() {
  return <BrowsePageClient />;
}
