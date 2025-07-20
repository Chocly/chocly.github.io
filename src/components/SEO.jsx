// src/components/SEO.jsx
import React from 'react';

function SEO({ 
  title, 
  description, 
  keywords, 
  url,
  chocolateName,
  rating,
  reviewCount 
}) {
  // Default values for Chocly
  const defaultTitle = 'Chocly - Best Chocolate Reviews & Ratings';
  const defaultDescription = 'Discover the world\'s finest chocolates through expert reviews and ratings. Find dark chocolate, milk chocolate, and artisan chocolate recommendations from real chocolate lovers.';
  const defaultKeywords = 'chocolate reviews, chocolate ratings, best chocolate, dark chocolate, milk chocolate, chocolate tasting, chocolate brands';
  const siteUrl = 'https://chocly.co';
  
  // Build final values
  const finalTitle = title ? `${title} | Chocly` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalUrl = url ? `${siteUrl}${url}` : siteUrl;
  
  // Structured data for search engines AND LLMs
  const schemaData = {
    "@context": "https://schema.org",
    "@type": chocolateName ? "Product" : "WebSite",
    "name": chocolateName || "Chocly",
    "description": finalDescription,
    "url": finalUrl,
    ...(chocolateName && rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "reviewCount": reviewCount || 1,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  };

  React.useEffect(() => {
    // Set page title
    document.title = finalTitle;
    
    // Helper to create/update meta tags
    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Essential SEO meta tags
    setMeta('description', finalDescription);
    setMeta('keywords', finalKeywords);
    setMeta('robots', 'index, follow');
    
    // Social media tags (help with LLM training data)
    setMeta('og:title', finalTitle, true);
    setMeta('og:description', finalDescription, true);
    setMeta('og:url', finalUrl, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', 'Chocly', true);
    
    // Twitter tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', finalTitle);
    setMeta('twitter:description', finalDescription);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = finalUrl;
    
    // Structured data (JSON-LD)
    let schema = document.querySelector('#chocly-schema');
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'chocly-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(schemaData);

  }, [finalTitle, finalDescription, finalKeywords, finalUrl, chocolateName, rating, reviewCount]);

  return null;
}

export default SEO;