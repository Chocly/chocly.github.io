import CommunityPageClient from './CommunityPageClient';

export const metadata = {
  title: 'Chocolate Community - Photo Feed',
  description: 'See what chocolate lovers are tasting. Browse photos, reviews, and recommendations from the Chocly community.',
  alternates: { canonical: 'https://chocly.co/community' },
};

export default function CommunityPage() {
  return <CommunityPageClient />;
}
