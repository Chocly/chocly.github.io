import AddChocolateClient from './AddChocolateClient';

export const metadata = {
  title: 'Add a Chocolate',
  robots: { index: false, follow: false },
};

export default function AddChocolatePage() {
  return <AddChocolateClient />;
}
