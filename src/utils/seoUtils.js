// src/utils/seoUtils.js - Utility functions for generating SEO content at scale

export const generateChocolateKeywords = (chocolate) => {
    const keywords = new Set();
    
    // Core product keywords
    const productTerms = [
      chocolate.name,
      `${chocolate.name} review`,
      `${chocolate.name} rating`,
      `${chocolate.name} chocolate`,
      `${chocolate.name} bar`,
      `${chocolate.name} tasting notes`
    ];
    
    // Maker keywords
    const makerTerms = [
      chocolate.maker,
      `${chocolate.maker} chocolate`,
      `${chocolate.maker} ${chocolate.name}`,
      `best ${chocolate.maker} chocolate`
    ];
    
    // Category-specific keywords
    const categoryTerms = chocolate.type ? [
      `${chocolate.type.toLowerCase()} chocolate`,
      `best ${chocolate.type.toLowerCase()} chocolate`,
      `${chocolate.type.toLowerCase()} chocolate review`,
      `premium ${chocolate.type.toLowerCase()} chocolate`
    ] : [];
    
    // Percentage keywords (crucial for chocolate searches)
    const percentageTerms = chocolate.percentage ? [
      `${chocolate.percentage}% chocolate`,
      `${chocolate.percentage}% cacao`,
      `${chocolate.percentage} percent chocolate`,
      `${chocolate.percentage}% dark chocolate`
    ] : [];
    
    // Origin keywords (very important for chocolate enthusiasts)
    const originTerms = chocolate.origin ? [
      `${chocolate.origin} chocolate`,
      `chocolate from ${chocolate.origin}`,
      `${chocolate.origin} cacao`,
      `single origin ${chocolate.origin}`
    ] : [];
    
    // Buying intent keywords (high conversion)
    const buyingTerms = [
      `buy ${chocolate.name}`,
      `${chocolate.name} price`,
      `where to buy ${chocolate.name}`,
      `${chocolate.name} online`,
      `order ${chocolate.name}`
    ];
    
    // Comparison keywords
    const comparisonTerms = [
      `${chocolate.name} vs`,
      `chocolate like ${chocolate.name}`,
      `similar to ${chocolate.name}`,
      `${chocolate.maker} comparison`
    ];
    
    // Add all terms to keywords set
    [...productTerms, ...makerTerms, ...categoryTerms, ...percentageTerms, 
     ...originTerms, ...buyingTerms, ...comparisonTerms].forEach(term => {
      if (term) keywords.add(term.toLowerCase());
    });
    
    return Array.from(keywords).join(', ');
  };
  
  export const generateChocolateDescription = (chocolate, reviews = []) => {
    const parts = [];
    
    // Opening statement
    parts.push(`${chocolate.name} by ${chocolate.maker} chocolate review and rating`);
    
    // Add social proof if available
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      parts.push(`Rated ${avgRating.toFixed(1)}/5 stars by ${reviews.length} chocolate enthusiasts`);
    }
    
    // Add key product details
    const details = [];
    if (chocolate.percentage) details.push(`${chocolate.percentage}% cacao`);
    if (chocolate.type) details.push(`${chocolate.type.toLowerCase()} chocolate`);
    if (chocolate.origin) details.push(`sourced from ${chocolate.origin}`);
    
    if (details.length > 0) {
      parts.push(`This ${details.join(', ')} offers`);
    }
    
    // Add flavor hints if available
    if (chocolate.flavorProfile && chocolate.flavorProfile.length > 0) {
      const flavors = chocolate.flavorProfile
        .filter(f => f.intensity > 2)
        .map(f => f.name.toLowerCase())
        .slice(0, 3);
      
      if (flavors.length > 0) {
        parts.push(`notes of ${flavors.join(', ')}`);
      }
    }
    
    // Call to action
    parts.push('Read detailed tasting notes, compare prices, and see what chocolate lovers think');
    
    return parts.join('. ') + '.';
  };
  
  export const generatePageTitle = (chocolate, pageType = 'review') => {
    const baseName = `${chocolate.name} by ${chocolate.maker}`;
    
    const titleTemplates = {
      review: `${baseName} - Review & Rating | Chocly`,
      buy: `Buy ${baseName} - Best Prices & Reviews | Chocly`,
      compare: `${baseName} Comparison - Find Similar Chocolates | Chocly`,
      maker: `${chocolate.maker} Chocolates - Reviews & Ratings | Chocly`
    };
    
    return titleTemplates[pageType] || titleTemplates.review;
  };
  
  // Generate FAQ schema for better search visibility
  export const generateFAQSchema = (chocolate, reviews) => {
    const faqs = [];
    
    // Common questions about the chocolate
    faqs.push({
      "@type": "Question",
      "name": `What does ${chocolate.name} taste like?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${chocolate.name} by ${chocolate.maker} is a ${chocolate.percentage}% ${chocolate.type?.toLowerCase() || ''} chocolate${chocolate.origin ? ` from ${chocolate.origin}` : ''}. ${reviews.length > 0 ? `Based on ${reviews.length} reviews, customers describe it as having rich, complex flavors.` : 'Read our detailed review for complete tasting notes.'}`
      }
    });
    
    if (chocolate.percentage) {
      faqs.push({
        "@type": "Question", 
        "name": `Is ${chocolate.percentage}% chocolate bitter?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${chocolate.percentage}% cacao chocolate like ${chocolate.name} has a ${chocolate.percentage >= 80 ? 'bold, intense' : chocolate.percentage >= 70 ? 'balanced' : 'mild'} flavor profile. The bitterness level depends on processing and bean origin.`
        }
      });
    }
    
    faqs.push({
      "@type": "Question",
      "name": `Where can I buy ${chocolate.name}?`,
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": `${chocolate.name} by ${chocolate.maker} can be purchased from specialty chocolate retailers, online stores, or directly from ${chocolate.maker}. Check our review for current pricing and availability.`
      }
    });
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs
    };
  };
  
  // Generate breadcrumb schema
  export const generateBreadcrumbSchema = (chocolate) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://chocly.co/"
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "name": "Chocolates",
          "item": "https://chocly.co/browse"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": chocolate.maker,
          "item": `https://chocly.co/maker/${encodeURIComponent(chocolate.maker.toLowerCase())}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": chocolate.name,
          "item": `https://chocly.co/chocolate/${chocolate.id}`
        }
      ]
    };
  };