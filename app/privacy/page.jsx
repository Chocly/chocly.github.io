import PrivacyPageClient from './PrivacyPageClient';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Chocly privacy policy. Learn how we collect, use, and protect your data.',
  alternates: { canonical: 'https://chocly.co/privacy' },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
