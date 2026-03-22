import BatchUploadClient from './BatchUploadClient';

export const metadata = {
  title: 'Batch Image Upload',
  robots: { index: false, follow: false },
};

export default function BatchUploadPage() {
  return <BatchUploadClient />;
}
