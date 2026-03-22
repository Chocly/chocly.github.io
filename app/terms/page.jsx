import TermsPageClient from './TermsPageClient';

export const metadata = {
  title: 'Terms of Service',
  description: 'Chocly terms of service. Read our terms and conditions for using the platform.',
  alternates: { canonical: 'https://chocly.co/terms' },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
