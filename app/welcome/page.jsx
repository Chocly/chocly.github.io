import WelcomeClient from './WelcomeClient';

export const metadata = {
  title: 'Welcome to Chocly',
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <WelcomeClient />;
}
