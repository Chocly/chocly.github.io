import AboutPageClient from './AboutPageClient';

export const metadata = {
  title: 'About Chocly',
  description: 'Learn about Chocly, the world\'s leading chocolate review platform. Our mission is to help you discover craft chocolate from around the globe.',
  alternates: { canonical: 'https://chocly.co/about' },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
