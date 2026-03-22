import AuthPageClient from './AuthPageClient';

export const metadata = {
  title: 'Sign In or Create Account',
  description: 'Join Chocly to rate, review, and discover craft chocolate from around the world.',
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return <AuthPageClient />;
}
