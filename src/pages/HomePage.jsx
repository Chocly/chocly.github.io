// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedChocolates } from '../services/chocolateFirebaseService';
import { getRecentTopReviews } from '../services/reviewService';
import ChocolateCard from '../components/ChocolateCard';
import './HomePage.css';

// Import your local hero image
import heroBackground from '../assets/Stock-Photo-Preview.jpeg'; // Make sure to add this file to your assets folder

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredChocolates, setFeaturedChocolates] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Handle search from the hero section
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch featured chocolates and recent reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get featured chocolates - use your actual service
        const chocolates = await getFeaturedChocolates(3); // Limit to 3 for featured section
        setFeaturedChocolates(chocolates);
        
        // Get recent top reviews
        const reviews = await getRecentTopReviews(2); // Get top 2 recent reviews
        setRecentReviews(reviews);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Render star ratings - moved to a helper function
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
        <div className="loading-spinner"></div>
        <p>Loading chocolatey goodness...</p>
      </div>
    );
  }
  
  return (
    <div className="home-page">
      {/* Hero Section with locally stored image */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `linear-gradient(rgba(93, 64, 55, 0.85), rgba(93, 64, 55, 0.85)), url(${heroBackground})` }}
      >
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Your Perfect Chocolate
            </h1>
            <p className="hero-subtitle">
              Join our community of chocolate enthusiasts to explore, 
              review, and share the world's finest chocolates
            </p>
            <form onSubmit={handleSearch} className="search-container">
              <input 
                type="text" 
                placeholder="Search for a chocolate, origin, or maker..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">Search</button>
            </form>
            <div className="hero-actions">
              <Link to="/browse" className="btn btn-primary">Explore Chocolates</Link>
              <Link to="/signup" className="btn btn-secondary">Join Community</Link>
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
            <Link to="/browse" className="view-all">View All</Link>
          </div>
          
          <div className="chocolate-cards">
            {featuredChocolates.length > 0 ? (
              featuredChocolates.map(chocolate => (
                <Link key={chocolate.id} to={`/chocolate/${chocolate.id}`} className="chocolate-card">
                  <div className="card-image-container">
                    <img src={chocolate.imageUrl || '/placeholder-chocolate.jpg'} alt={chocolate.name} className="card-image" />
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
                        {renderStars(chocolate.averageRating || 0)}
                      </div>
                      <span className="rating-number">{(chocolate.averageRating || 0).toFixed(1)}</span>
                      <span className="rating-count">({chocolate.ratings || 0})</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-chocolates-message">No featured chocolates available yet. Check back soon!</p>
            )}
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
            <Link to="/category/dark" className="category-tile">
              <h3 className="category-title">Dark Chocolate</h3>
              <p className="category-description">Bold & intense profiles</p>
            </Link>
            
            <Link to="/category/milk" className="category-tile">
              <h3 className="category-title">Milk Chocolate</h3>
              <p className="category-description">Creamy & approachable</p>
            </Link>
            
            <Link to="/category/origin" className="category-tile">
              <h3 className="category-title">Single Origin</h3>
              <p className="category-description">Distinctive terroir</p>
            </Link>
            
            <Link to="/category/artisan" className="category-tile">
              <h3 className="category-title">Artisan Craft</h3>
              <p className="category-description">Small batch excellence</p>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works Section with colorful icons */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Chocly Works</h2>
            <p className="section-subtitle">Join our chocolate community in three simple steps</p>
          </div>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon discover">
                <svg viewBox="0 0 24 24">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
              <h3 className="step-title">Discover</h3>
              <p className="step-description">
                Explore our extensive chocolate database and find chocolates based on origin, flavor profile, or maker
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-icon taste">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.5 16.5,17.4 13,17.9V21H11V17.9C7.5,17.4 5,14.5 5,11V10H7V11A5,5 0 0,0 12,16A5,5 0 0,0 17,11V10H19V11Z" />
                </svg>
              </div>
              <h3 className="step-title">Taste & Rate</h3>
              <p className="step-description">
                Develop your palate by tasting and rating chocolates, tracking your personal chocolate journey
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-icon connect">
                <svg viewBox="0 0 24 24">
                  <path d="M16.5,6.5A2,2 0 0,1 18.5,8.5A2,2 0 0,1 16.5,10.5A2,2 0 0,1 14.5,8.5A2,2 0 0,1 16.5,6.5M16.5,12A3.5,3.5 0 0,0 20,8.5A3.5,3.5 0 0,0 16.5,5A3.5,3.5 0 0,0 13,8.5A3.5,3.5 0 0,0 16.5,12M7.5,6.5A2,2 0 0,1 9.5,8.5A2,2 0 0,1 7.5,10.5A2,2 0 0,1 5.5,8.5A2,2 0 0,1 7.5,6.5M7.5,12A3.5,3.5 0 0,0 11,8.5A3.5,3.5 0 0,0 7.5,5A3.5,3.5 0 0,0 4,8.5A3.5,3.5 0 0,0 7.5,12M21.5,17.5H14V16.25C14,14.75 13.75,13.5 11.75,13.5C10.5,13.5 9.25,14 7.75,14.5C6.25,15 5.25,15.25 4,15.25V17L4.75,17.25C5.5,17.5 5.75,17.75 6.25,18.25C6.75,18.75 7.5,19.5 8.5,20.25C9.5,21 9.75,21 11,21C12.25,21 12.5,21 13.5,20.25C14.5,19.5 15.25,18.75 15.75,18.25C16.25,17.75 16.5,17.5 17.25,17.25L18,17H21.5V17.5Z" />
                </svg>
              </div>
              <h3 className="step-title">Connect</h3>
              <p className="step-description">
                Share recommendations, follow fellow chocolate lovers, and join tasting events in your area
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Community Reviews</h2>
            <p className="section-subtitle">Discover what chocolate lovers are saying</p>
            <Link to="/reviews" className="view-all">View All</Link>
          </div>
          
          <div className="reviews-grid">
            {recentReviews.length > 0 ? (
              recentReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="user-name">{review.user}</span>
                      <span className="review-date">
                        {review.createdAt && new Date(review.createdAt.seconds * 1000).toLocaleDateString(undefined, { 
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
                      src={review.chocolate?.imageUrl || '/placeholder-chocolate.jpg'} 
                      alt={review.chocolate?.name} 
                      className="chocolate-image"
                    />
                    <div className="chocolate-info">
                      <h4 className="chocolate-name">{review.chocolate?.name}</h4>
                      <p className="chocolate-maker">{review.chocolate?.maker}</p>
                    </div>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <Link to={`/chocolate/${review.chocolateId}`} className="read-more">Read Full Review</Link>
                </div>
              ))
            ) : (
              <div className="no-reviews-message">
                <p>No reviews yet! Be the first to review a chocolate.</p>
                <Link to="/browse" className="btn btn-primary btn-sm">Find chocolates to review</Link>
              </div>
            )}
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
              <Link to="/signup" className="btn btn-primary">Create Account</Link>
              <Link to="/browse" className="btn btn-tertiary">Explore First</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;