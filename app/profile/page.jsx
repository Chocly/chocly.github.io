import ProfilePageClient from './ProfilePageClient';

export const metadata = {
  title: 'My Profile',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
