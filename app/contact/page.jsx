import ContactPageClient from './ContactPageClient';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Chocly team. Questions, feedback, or partnership inquiries welcome.',
  alternates: { canonical: 'https://chocly.co/contact' },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
