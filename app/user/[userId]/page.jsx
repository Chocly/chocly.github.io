import UserProfileClient from './UserProfileClient';

export const metadata = {
  title: 'User Profile',
  // Member profiles are thin/duplicate until they get real SSR content —
  // keep them out of the index rather than indexed as identical stubs.
  robots: { index: false, follow: true },
};

export default function UserProfilePage() {
  return <UserProfileClient />;
}
