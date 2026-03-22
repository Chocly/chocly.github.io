import ScannerPageClient from './ScannerPageClient';

export const metadata = {
  title: 'Identify Chocolate - AI Scanner',
  description: 'Use AI to identify any chocolate bar. Take a photo and instantly get details, reviews, and ratings.',
  robots: { index: false, follow: false },
};

export default function ScannerPage() {
  return <ScannerPageClient />;
}
