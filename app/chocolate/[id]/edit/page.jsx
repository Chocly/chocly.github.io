import EditPageClient from './EditPageClient';

export const metadata = {
  title: 'Edit Chocolate',
  robots: { index: false, follow: false },
};

export default function EditPage() {
  return <EditPageClient />;
}
