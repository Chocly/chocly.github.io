import Link from 'next/link';
import '../../src/views/CategoryLandingPage.css';

export const metadata = {
  title: 'Browse Chocolate by Category — Type, Origin & Cacao %',
  description:
    'Explore chocolate by category: dark, milk and white chocolate, single-origin bars from Ecuador, Madagascar, Venezuela and more, or filter by cacao percentage.',
  alternates: { canonical: 'https://chocly.co/category' },
};

const SECTIONS = [
  {
    heading: 'By Type',
    blurb: 'From intense dark to creamy milk — find your style.',
    links: [
      { href: '/category/type/dark', label: 'Dark Chocolate' },
      { href: '/category/type/milk', label: 'Milk Chocolate' },
      { href: '/category/type/white', label: 'White Chocolate' },
    ],
  },
  {
    heading: 'By Origin',
    blurb: 'Cacao terroir matters — explore bars by where the beans grow.',
    links: [
      { href: '/category/origin/ecuador', label: 'Ecuador' },
      { href: '/category/origin/madagascar', label: 'Madagascar' },
      { href: '/category/origin/venezuela', label: 'Venezuela' },
      { href: '/category/origin/peru', label: 'Peru' },
      { href: '/category/origin/ghana', label: 'Ghana' },
      { href: '/category/origin/colombia', label: 'Colombia' },
    ],
  },
  {
    heading: 'By Cacao Percentage',
    blurb: 'Dial in the intensity, from balanced to bracing.',
    links: [
      { href: '/category/percentage/70', label: '70% Cacao' },
      { href: '/category/percentage/85', label: '85% Cacao' },
      { href: '/category/percentage/100', label: '100% Cacao' },
    ],
  },
];

export default function CategoryIndexPage() {
  return (
    <div className="category-landing-page">
      <style>{`
        .category-index-section { margin: 2.5rem 0; }
        .category-index-section h2 { margin-bottom: 0.35rem; }
        .category-index-section > p { color: var(--text-secondary, #6b5d52); margin: 0 0 1rem; }
        .category-index-links { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      `}</style>
      <div className="container">
        <header className="category-header">
          <h1>Browse by Category</h1>
          <p className="category-subtitle">
            Three ways into the world of craft chocolate: by type, by bean
            origin, or by cacao intensity.
          </p>
        </header>

        {SECTIONS.map((section) => (
          <section key={section.heading} className="category-index-section">
            <h2>{section.heading}</h2>
            <p>{section.blurb}</p>
            <div className="category-index-links">
              {section.links.map((link) => (
                <Link key={link.href} href={link.href} className="btn btn-outline">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="category-index-section">
          <h2>Everything Else</h2>
          <p>Prefer to filter freely? Browse the full catalog.</p>
          <div className="category-index-links">
            <Link href="/browse" className="btn btn-primary">
              Browse All Chocolates
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
