import { Poppins, Merriweather } from 'next/font/google';
import Script from 'next/script';
import ClientProviders from '../src/components/ClientProviders';
import '../src/styles/colors.css';
import '../src/index.css';
import '../src/App.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://chocly.co'),
  title: {
    default: 'Chocly - Chocolate Reviews, Ratings & Recommendations',
    template: '%s | Chocly',
  },
  description:
    'Discover 500+ craft and artisan chocolates from 30+ countries. Read expert reviews, compare ratings, and find your next favorite chocolate bar.',
  keywords: [
    'chocolate reviews',
    'chocolate ratings',
    'best chocolate',
    'dark chocolate',
    'milk chocolate',
    'craft chocolate',
    'artisan chocolate',
    'chocolate tasting',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Chocly',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CQXWMKJDQW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CQXWMKJDQW');
          `}
        </Script>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍫</text></svg>"
        />
      </head>
      <body>
        <ClientProviders>
          <div className="app">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
