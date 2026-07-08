import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuide } from '../../../src/content/guides';
import '../guides.css';

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide Not Found' };

  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: `${guide.title} | Chocly`,
      description: guide.description,
      url: `https://chocly.co/guides/${guide.slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://chocly.co/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      dateModified: guide.updated,
      author: { '@type': 'Organization', name: 'Chocly' },
      publisher: { '@type': 'Organization', name: 'Chocly', url: 'https://chocly.co' },
      mainEntityOfPage: `https://chocly.co/guides/${guide.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chocly.co/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://chocly.co/guides' },
        { '@type': 'ListItem', position: 3, name: guide.title, item: `https://chocly.co/guides/${guide.slug}` },
      ],
    },
  ];

  return (
    <article className="guides-page guide-article">
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="guide-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> /{' '}
        <span aria-current="page">{guide.title}</span>
      </nav>

      <header className="guide-hero">
        <span className="guide-hero-emoji" aria-hidden="true">{guide.heroEmoji}</span>
        <h1>{guide.title}</h1>
        <p className="guide-updated">Updated {guide.updated}</p>
      </header>

      {guide.sections.map((section) => (
        <section key={section.heading} className="guide-section">
          <h2>{section.heading}</h2>
          {section.body?.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          {section.facts && (
            <table className="guide-facts">
              <tbody>
                {section.facts.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}

      <aside className="guide-related">
        <h2>Keep exploring</h2>
        <ul>
          {guide.related.map((r) => (
            <li key={r.href}>
              <Link href={r.href}>{r.label}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
