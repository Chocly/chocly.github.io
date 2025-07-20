// src/pages/CategoryLandingPage.jsx - Complete category system
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ChocolateCard from '../components/ChocolateCard';
import SEO from '../components/SEO';
import './CategoryLandingPage.css';

function CategoryLandingPage() {
  const { categoryType, categoryValue } = useParams();
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Category configuration for SEO and content
  const getCategoryConfig = () => {
    const configs = {
      // Percentage-based categories
      percentage: {
        '70': {
          title: 'Best 70% Dark Chocolate Reviews & Ratings',
          description: 'Discover premium 70% dark chocolate bars with expert reviews and ratings. Perfect balance of intensity and smoothness from top chocolate makers worldwide.',
          keywords: '70% chocolate, 70% dark chocolate, 70% cacao, best 70 percent chocolate, 70% chocolate review, premium dark chocolate',
          guide: '70% dark chocolate offers the perfect balance between intense chocolate flavor and approachable sweetness. This cacao percentage is ideal for both newcomers to dark chocolate and experienced enthusiasts.',
          benefits: 'Rich in antioxidants, moderate caffeine content, and complex flavor development make 70% chocolate both delicious and healthful.'
        },
        '85': {
          title: 'Best 85% Dark Chocolate - Ultra Premium Reviews',
          description: 'Explore intense 85% dark chocolate bars for serious chocolate lovers. Read expert reviews of the most complex and sophisticated dark chocolates available.',
          keywords: '85% chocolate, 85% dark chocolate, 85% cacao, ultra dark chocolate, intense chocolate, 85 percent chocolate review',
          guide: '85% dark chocolate is for the serious chocolate connoisseur. With minimal sugar, these bars showcase pure cacao flavors in their most intense form.',
          benefits: 'Maximum antioxidant content, minimal sugar, and pure chocolate essence make 85% bars the ultimate health-conscious indulgence.'
        },
        '100': {
          title: '100% Dark Chocolate - Pure Cacao Reviews',
          description: 'Experience pure chocolate with our 100% cacao bar reviews. No sugar, just pure chocolate intensity from master chocolatiers.',
          keywords: '100% chocolate, 100% cacao, pure chocolate, unsweetened chocolate, 100 percent chocolate, pure cacao bars',
          guide: '100% chocolate contains zero sugar - just pure cacao. These bars offer the most authentic chocolate experience possible.',
          benefits: 'Pure antioxidants, zero sugar, and the true essence of cacao terroir without any additives.'
        }
      },

      // Origin-based categories
      origin: {
        'ecuador': {
          title: 'Ecuador Chocolate - Single Origin Reviews & Ratings',
          description: 'Discover exceptional Ecuador chocolate with our comprehensive reviews. From Arriba Nacional beans to modern craft chocolate, explore Ecuador\'s finest.',
          keywords: 'Ecuador chocolate, Ecuador cacao, Arriba Nacional, Ecuador single origin, chocolate from Ecuador, Ecuador chocolate review',
          guide: 'Ecuador produces some of the world\'s finest cacao, particularly the legendary Arriba Nacional variety known for its floral and fruity notes.',
          benefits: 'Ecuador\'s diverse microclimates create chocolates with unique flavor profiles ranging from bright and fruity to rich and earthy.'
        },
        'madagascar': {
          title: 'Madagascar Chocolate - Exotic Single Origin Reviews',
          description: 'Explore unique Madagascar chocolate bars with distinctive red fruit and spice notes. Read reviews of the best Madagascar single origin chocolates.',
          keywords: 'Madagascar chocolate, Madagascar cacao, Sambirano Valley, Madagascar single origin, exotic chocolate, Madagascar chocolate review',
          guide: 'Madagascar chocolate is renowned for its distinctive red fruit notes and subtle spice characteristics, particularly from the Sambirano Valley.',
          benefits: 'Unique terroir creates chocolates with bright acidity, red fruit notes, and exotic spice undertones found nowhere else.'
        },
        'venezuela': {
          title: 'Venezuela Chocolate - Premium Criollo Reviews',
          description: 'Experience Venezuela\'s legendary Criollo cacao in our chocolate reviews. From Chuao to Sur del Lago, discover Venezuela\'s chocolate treasures.',
          keywords: 'Venezuela chocolate, Criollo cacao, Chuao chocolate, Venezuela single origin, premium Venezuelan chocolate, Venezuela chocolate review',
          guide: 'Venezuela is home to the rare Criollo cacao variety, considered the most prized cacao in the world for its complex flavor profile.',
          benefits: 'Criollo beans offer unparalleled complexity with nutty, fruity, and spicy notes that showcase chocolate at its finest.'
        }
      },

      // Type-based categories
      type: {
        'dark': {
          title: 'Best Dark Chocolate Reviews & Ratings',
          description: 'Comprehensive dark chocolate reviews from 70% to 100% cacao. Find your perfect dark chocolate with expert ratings and tasting notes.',
          keywords: 'dark chocolate, dark chocolate review, best dark chocolate, premium dark chocolate, dark chocolate rating, artisan dark chocolate',
          guide: 'Dark chocolate ranges from approachable 70% bars to intense 100% pure cacao. Each percentage offers unique flavor experiences.',
          benefits: 'High antioxidant content, potential heart health benefits, and complex flavor development make dark chocolate both delicious and nutritious.'
        },
        'milk': {
          title: 'Best Milk Chocolate Reviews & Premium Ratings',
          description: 'Discover exceptional milk chocolate beyond the ordinary. Read reviews of premium milk chocolate bars from artisan chocolatiers worldwide.',
          keywords: 'milk chocolate, premium milk chocolate, artisan milk chocolate, best milk chocolate, milk chocolate review, gourmet milk chocolate',
          guide: 'Premium milk chocolate balances creamy dairy notes with chocolate intensity, creating sophisticated flavors far beyond mass-market bars.',
          benefits: 'Creamy texture, approachable sweetness, and comfort appeal make quality milk chocolate perfect for both newcomers and connoisseurs.'
        },
        'white': {
          title: 'Best White Chocolate Reviews & Artisan Ratings',
          description: 'Explore premium white chocolate made with real cocoa butter. Read reviews of the finest white chocolate bars and artisan creations.',
          keywords: 'white chocolate, premium white chocolate, artisan white chocolate, best white chocolate, white chocolate review, cocoa butter chocolate',
          guide: 'True white chocolate contains cocoa butter, vanilla, and sugar. Premium versions showcase the subtle complexity of quality cocoa butter.',
          benefits: 'Smooth texture, subtle vanilla notes, and versatility in pairing make quality white chocolate a sophisticated treat.'
        }
      }
    };

    const config = configs[categoryType]?.[categoryValue.toLowerCase()];
    if (!config) {
      return {
        title: `${categoryValue} Chocolate Reviews`,
        description: `Explore ${categoryValue} chocolate with our comprehensive reviews and ratings.`,
        keywords: `${categoryValue} chocolate, ${categoryValue} chocolate review`,
        guide: `Discover the unique characteristics of ${categoryValue} chocolate.`,
        benefits: `Learn about the special qualities that make ${categoryValue} chocolate distinctive.`
      };
    }
    return config;
  };

  // Fetch chocolates based on category
  useEffect(() => {
    const fetchCategoryChocolates = async () => {
      try {
        setLoading(true);
        let chocolateQuery;

        // Build query based on category type
        switch (categoryType) {
          case 'percentage':
            const percentage = parseInt(categoryValue);
            chocolateQuery = query(
              collection(db, 'chocolates'),
              where('cacaoPercentage', '>=', percentage - 2),
              where('cacaoPercentage', '<=', percentage + 2),
              orderBy('cacaoPercentage'),
              orderBy('averageRating', 'desc')
            );
            break;

          case 'origin':
            chocolateQuery = query(
              collection(db, 'chocolates'),
              where('origin', '==', categoryValue),
              orderBy('averageRating', 'desc')
            );
            break;

          case 'type':
            chocolateQuery = query(
              collection(db, 'chocolates'),
              where('type', '==', categoryValue),
              orderBy('averageRating', 'desc')
            );
            break;

          default:
            throw new Error('Invalid category type');
        }

        const querySnapshot = await getDocs(chocolateQuery);
        const chocolateData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setChocolates(chocolateData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category chocolates:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (categoryType && categoryValue) {
      fetchCategoryChocolates();
    }
  }, [categoryType, categoryValue]);

  const config = getCategoryConfig();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {categoryValue} chocolates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <SEO title="Category Not Found" description="The chocolate category you're looking for could not be found." />
        <div className="container">
          <div className="error-message">
            <h1>Category Not Found</h1>
            <p>Sorry, we couldn't find chocolates in this category.</p>
            <Link to="/browse" className="btn btn-primary">Browse All Chocolates</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-landing-page">
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        url={`/category/${categoryType}/${categoryValue}`}
      />

      {/* Hero Section */}
      <section className="category-hero">
        <div className="container">
          <div className="category-header">
            <nav className="breadcrumb">
              <Link to="/">Home</Link>
              <span>›</span>
              <Link to="/browse">Browse</Link>
              <span>›</span>
              <span>{categoryValue} Chocolate</span>
            </nav>

            <h1>{config.title.split(' - ')[0]}</h1>
            <p className="category-description">{config.description}</p>
            
            {chocolates.length > 0 && (
              <div className="category-stats">
                <span className="stat">
                  <strong>{chocolates.length}</strong> chocolates found
                </span>
                <span className="stat">
                  <strong>{chocolates.filter(c => c.averageRating >= 4).length}</strong> highly rated
                </span>
                <span className="stat">
                  <strong>{new Set(chocolates.map(c => c.maker)).size}</strong> different makers
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="category-content">
        <div className="container">
          <div className="content-grid">
            <div className="guide-section">
              <h2>About {categoryValue} Chocolate</h2>
              <p>{config.guide}</p>
              
              <h3>Why Choose {categoryValue} Chocolate?</h3>
              <p>{config.benefits}</p>
              
              {/* Category-specific tips */}
              {categoryType === 'percentage' && (
                <div className="tasting-tips">
                  <h3>Tasting Tips</h3>
                  <ul>
                    <li>Let the chocolate melt on your tongue to release full flavors</li>
                    <li>Look for notes that develop as the chocolate melts</li>
                    <li>Pay attention to the finish - how long flavors linger</li>
                    <li>Compare different origins at the same percentage</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="quick-filters">
              <h3>Refine Your Search</h3>
              <div className="filter-links">
                <Link to="/browse?sort=rating" className="filter-link">
                  Highest Rated
                </Link>
                <Link to="/browse?sort=popularity" className="filter-link">
                  Most Reviewed
                </Link>
                {categoryType !== 'percentage' && (
                  <Link to="/category/percentage/70" className="filter-link">
                    70% Chocolate
                  </Link>
                )}
                {categoryType !== 'origin' && (
                  <Link to="/category/origin/ecuador" className="filter-link">
                    Ecuador Origin
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chocolates Grid */}
      <section className="chocolates-section">
        <div className="container">
          <div className="section-header">
            <h2>Top {categoryValue} Chocolates</h2>
            <div className="sort-controls">
              <select onChange={(e) => {
                const sortValue = e.target.value;
                navigate(`/browse?${categoryType}=${categoryValue}&sort=${sortValue}`);
              }}>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Reviews</option>
                <option value="name">Name A-Z</option>
                <option value="cacao-high">Cacao % High-Low</option>
              </select>
            </div>
          </div>

          {chocolates.length > 0 ? (
            <div className="chocolates-grid">
              {chocolates.map(chocolate => (
                <ChocolateCard key={chocolate.id} chocolate={chocolate} />
              ))}
            </div>
          ) : (
            <div className="no-chocolates">
              <h3>No {categoryValue} Chocolates Found</h3>
              <p>We're always adding new chocolates to our database. 
                 Check back soon or explore other categories.</p>
              <div className="alternative-links">
                <Link to="/browse" className="btn btn-primary">Browse All Chocolates</Link>
                <Link to="/category/type/dark" className="btn btn-secondary">Dark Chocolate</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Categories */}
      <section className="related-categories">
        <div className="container">
          <h2>Explore Related Categories</h2>
          <div className="category-links">
            {categoryType !== 'percentage' && (
              <>
                <Link to="/category/percentage/70" className="category-link">
                  <h3>70% Chocolate</h3>
                  <p>Perfect balance of intensity and smoothness</p>
                </Link>
                <Link to="/category/percentage/85" className="category-link">
                  <h3>85% Chocolate</h3>
                  <p>For serious dark chocolate lovers</p>
                </Link>
              </>
            )}
            
            {categoryType !== 'origin' && (
              <>
                <Link to="/category/origin/ecuador" className="category-link">
                  <h3>Ecuador Chocolate</h3>
                  <p>Legendary Arriba Nacional cacao</p>
                </Link>
                <Link to="/category/origin/madagascar" className="category-link">
                  <h3>Madagascar Chocolate</h3>
                  <p>Distinctive red fruit notes</p>
                </Link>
              </>
            )}
            
            {categoryType !== 'type' && (
              <>
                <Link to="/category/type/dark" className="category-link">
                  <h3>Dark Chocolate</h3>
                  <p>Rich, complex, and sophisticated</p>
                </Link>
                <Link to="/category/type/milk" className="category-link">
                  <h3>Milk Chocolate</h3>
                  <p>Creamy, smooth, and approachable</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CategoryLandingPage;