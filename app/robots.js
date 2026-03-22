export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/batch-upload', '/profile', '/auth', '/login', '/signup', '/chocolate/*/edit'],
      },
    ],
    sitemap: 'https://chocly.co/sitemap.xml',
  };
}
