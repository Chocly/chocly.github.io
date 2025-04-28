import { useState, useEffect } from 'react';
import './HomePage.css';

function HomePage() {
  // State for featured chocolates and recent reviews
  const [chocolates, setChocolates] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample chocolate data (would come from your API)
  const sampleChocolates = [
    {
      id: 1,
      name: 'Madagascan Dark 72%',
      maker: 'Terroir Artisan',
      type: 'Dark',
      origin: 'Madagascar',
      cacaoPercentage: 72,
      averageRating: 4.8,
      ratings: 186,
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=2069'
    },
    {
      id: 2,
      name: 'Sea Salt Caramel',
      maker: 'Wild Coast Chocolate',
      type: 'Dark Milk',
      origin: 'Ecuador',
      cacaoPercentage: 55,
      averageRating: 4.9,
      ratings: 203,
      imageUrl: 'https://images.unsplash.com/photo-1548907040-4d42bfaaa981?q=80&w=2069'
    },
    {
      id: 3,
      name: 'Peruvian Single Origin',
      maker: 'Craft Origins',
      type: 'Dark',
      origin: 'Peru',
      cacaoPercentage: 70,
      averageRating: 4.7,
      ratings: 156,
      imageUrl: 'https://images.unsplash.com/photo-1614088685112-0297c8d9e72e?q=80&w=2487'
    }
  ];
  
  // Sample recent reviews (would come from your API)
  const sampleReviews = [
    {
      id: 'rev1',
      user: 'ChocolateFiend',
      rating: 4.5,
      text: 'The fruity notes in this Madagascar bar are incredible - bright cherry and subtle citrus that lingers beautifully.',
      date: new Date('2025-04-20'),
      chocolate: {
        id: 1,
        name: 'Madagascan Dark 72%',
        maker: 'Terroir Artisan',
        imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=2069'
      }
    },
    {
      id: 'rev2',
      user: 'CocoaExplorer',
      rating: 5,
      text: 'This has to be the most balanced milk chocolate I ever tried. Creamy but not too sweet with complex notes you do not usually find.',
      date: new Date('2025-04-22'),
      chocolate: {
        id: 2,
        name: 'Sea Salt Caramel',
        maker: 'Wild Coast Chocolate',
        imageUrl: 'https://images.unsplash.com/photo-1548907040-4d42bfaaa981?q=80&w=2069'
      }
    }
  ];

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be API calls
        // const chocolates = await getFeatureChocolates();
        // const reviews = await getRecentReviews();
        
        // Using sample data for now
        setTimeout(() => {
          setChocolates(sampleChocolates);
          setRecentReviews(sampleReviews);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Your Perfect Chocolate
            </h1>
            <p className="hero-subtitle">
              Join our community of chocolate enthusiasts to explore, 
              review, and share the world's finest chocolates
            </p>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search for a chocolate, origin, or maker..."
                className="search-input"
              />
              <button className="search-button">Search</button>
            </div>
            <div className="hero-actions">
              <a href="/explore" className="btn btn-primary">Explore Chocolates</a>
              <a href="/join" className="btn btn-secondary">Join Community</a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Community Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-wrapper">
            <div className="stat-item">
              <span className="stat-number">4,823</span>
              <span className="stat-label">Chocolate Lovers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1,250+</span>
              <span className="stat-label">Chocolates Reviewed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">85</span>
              <span className="stat-label">Countries Represented</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Chocolates Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Chocolates</h2>
            <p className="section-subtitle">Exceptional chocolates curated by our community</p>
            <a href="/explore" className="view-all">View All</a>
          </div>
          
          <div className="chocolate-cards">
            {chocolates.map(chocolate => (
              <a key={chocolate.id} href={`/chocolate/${chocolate.id}`} className="chocolate-card">
                <div className="card-image-container">
                  <img src={chocolate.imageUrl} alt={chocolate.name} className="card-image" />
                  <div className="card-badge">{chocolate.type}</div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{chocolate.name}</h3>
                  <p className="card-maker">{chocolate.maker}</p>
                  <div className="card-meta">
                    <span className="card-origin">{chocolate.origin}</span>
                    <span className="card-percentage">{chocolate.cacaoPercentage}% Cacao</span>
                  </div>
                  <div className="card-rating">
                    <div className="rating-stars">
                      {renderStars(chocolate.averageRating)}
                    </div>
                    <span className="rating-number">{chocolate.averageRating.toFixed(1)}</span>
                    <span className="rating-count">({chocolate.ratings})</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle">Find chocolates that match your preferences</p>
          </div>
          
          <div className="categories-grid">
            <a href="/category/dark" className="category-tile">
              <h3 className="category-title">Dark Chocolate</h3>
              <p className="category-description">Bold & intense profiles</p>
            </a>
            
            <a href="/category/milk" className="category-tile">
              <h3 className="category-title">Milk Chocolate</h3>
              <p className="category-description">Creamy & approachable</p>
            </a>
            
            <a href="/category/origin" className="category-tile">
              <h3 className="category-title">Single Origin</h3>
              <p className="category-description">Distinctive terroir</p>
            </a>
            
            <a href="/category/artisan" className="category-tile">
              <h3 className="category-title">Artisan Craft</h3>
              <p className="category-description">Small batch excellence</p>
            </a>
          </div>
        </div>
      </section>
      
      {/* Recent Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Community Reviews</h2>
            <p className="section-subtitle">Discover what chocolate lovers are saying</p>
            <a href="/reviews" className="view-all">View All</a>
          </div>
          
          <div className="reviews-grid">
            {recentReviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <span className="user-name">{review.user}</span>
                    <span className="review-date">
                      {review.date.toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="review-chocolate">
                  <img 
                    src={review.chocolate.imageUrl} 
                    alt={review.chocolate.name} 
                    className="chocolate-image"
                  />
                  <div className="chocolate-info">
                    <h4 className="chocolate-name">{review.chocolate.name}</h4>
                    <p className="chocolate-maker">{review.chocolate.maker}</p>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
                <a href={`/review/${review.id}`} className="read-more">Read Full Review</a>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Chocly Works</h2>
            <p className="section-subtitle">Join our chocolate community in three simple steps</p>
          </div>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Discover</h3>
              <p className="step-description">
                Explore our extensive chocolate database and find chocolates based on origin, flavor profile, or maker
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Taste & Rate</h3>
              <p className="step-description">
                Develop your palate by tasting and rating chocolates, tracking your personal chocolate journey
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Connect</h3>
              <p className="step-description">
                Share recommendations, follow fellow chocolate lovers, and join tasting events in your area
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to join our chocolate community?</h2>
            <p className="cta-text">
              Create a free account to start tracking your tastings, 
              save favorites, and connect with fellow chocolate enthusiasts
            </p>
            <div className="cta-buttons">
              <a href="/signup" className="btn btn-primary">Create Account</a>
              <a href="/explore" className="btn btn-tertiary">Explore First</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;