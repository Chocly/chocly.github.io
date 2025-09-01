// src/pages/HomePage.jsx - Enhanced with Carousel and Real Data Fetching
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedChocolates } from '../services/chocolateFirebaseService';
import { getFeaturedReviews } from '../services/reviewService';
import ChocolateCard from '../components/ChocolateCard';
import SEO from '../components/SEO';
import './HomePage.css';

// Import your local hero image
import heroBackground from '../assets/Firefly hero image.jpg';

// Sample chocolate data for demonstration
const sampleChocolates = [
  {
    id: '1',
    name: 'Madagascan Dark 72%',
    maker: 'Terroir Artisan',
    type: 'Dark',
    origin: 'Madagascar',
    cacaoPercentage: 72,
    averageRating: 4.8,
    ratings: 186,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'madagascar-dark'
  },
  {
    id: '2',
    name: 'Sea Salt Caramel',
    maker: 'Wild Coast Chocolate',
    type: 'Dark Milk',
    origin: 'Ecuador',
    cacaoPercentage: 55,
    averageRating: 4.9,
    ratings: 203,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'sea-salt-caramel'
  },
  {
    id: '3',
    name: 'Peruvian Single Origin',
    maker: 'Craft Origins',
    type: 'Dark',
    origin: 'Peru',
    cacaoPercentage: 70,
    averageRating: 4.7,
    ratings: 156,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'peruvian-origin'
  },
  {
    id: '4',
    name: 'Vanilla Bean White',
    maker: 'Alpine Confections',
    type: 'White',
    origin: 'Various',
    cacaoPercentage: 33,
    averageRating: 4.5,
    ratings: 98,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'vanilla-white'
  },
  {
    id: '5',
    name: 'Hazelnut Crunch',
    maker: 'Artisan Delights',
    type: 'Milk',
    origin: 'Italy',
    cacaoPercentage: 45,
    averageRating: 4.6,
    ratings: 124,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'hazelnut-crunch'
  },
  {
    id: '6',
    name: 'Truffle Collection',
    maker: 'Premium Chocolatiers',
    type: 'Dark',
    origin: 'Belgium',
    cacaoPercentage: 65,
    averageRating: 4.9,
    ratings: 234,
    imageUrl: '/placeholder-chocolate.jpg',
    className: 'truffle-collection'
  }
];

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredChocolates, setFeaturedChocolates] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
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
        console.log('Fetching homepage data...');
        
        // Define your preferred makers for featured chocolates
        const preferredMakers = ['Lindt', 'Theo', 'Alter Eco', 'Hu'];
        
        // TRY TO GET REAL CHOCOLATES FIRST
        try {
          // Get more chocolates than we need so we can filter by maker
          const allChocolates = await getFeaturedChocolates(50); // Get up to 50 to have options
          console.log('All chocolates fetched:', allChocolates);
          
          if (allChocolates && allChocolates.length > 0) {
            // Filter by preferred makers first
            const preferredChocolates = allChocolates.filter(chocolate => 
              chocolate.maker && preferredMakers.some(preferredMaker => 
                chocolate.maker.toLowerCase().includes(preferredMaker.toLowerCase())
              )
            );
            
            console.log('Chocolates from preferred makers:', preferredChocolates);
            
            let finalChocolates = [];
            
            if (preferredChocolates.length >= 6) {
              // We have enough from preferred makers, take the top 6
              finalChocolates = preferredChocolates.slice(0, 6);
              console.log('Using 6 chocolates from preferred makers:', finalChocolates.map(c => `${c.name} by ${c.maker}`));
            } else if (preferredChocolates.length > 0) {
              // We have some from preferred makers, fill the rest with others
              const remainingSlots = 6 - preferredChocolates.length;
              const otherChocolates = allChocolates.filter(chocolate => 
                !preferredMakers.some(preferredMaker => 
                  chocolate.maker && chocolate.maker.toLowerCase().includes(preferredMaker.toLowerCase())
                )
              ).slice(0, remainingSlots);
              
              finalChocolates = [...preferredChocolates, ...otherChocolates];
              console.log(`Using ${preferredChocolates.length} from preferred makers and ${otherChocolates.length} others:`, 
                finalChocolates.map(c => `${c.name} by ${c.maker}`));
            } else {
              // No preferred makers found, use top 6 overall
              finalChocolates = allChocolates.slice(0, 6);
              console.log('No preferred makers found, using top 6 overall:', finalChocolates.map(c => `${c.name} by ${c.maker}`));
            }
            
            setFeaturedChocolates(finalChocolates);
            console.log('Final featured chocolates set');
          } else {
            // No real chocolates, use sample data
            console.log('No real chocolates found, using sample data');
            setFeaturedChocolates(sampleChocolates);
          }
        } catch (chocolateError) {
          console.error('Error fetching real chocolates:', chocolateError);
          console.log('Falling back to sample chocolates');
          setFeaturedChocolates(sampleChocolates);
        }
        
        // Get featured reviews - will be empty if no reviews exist
        const reviews = await getFeaturedReviews(3); // Get top 3 featured reviews
        console.log('Featured reviews:', reviews);
        setFeaturedReviews(reviews);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError(err.message);
        // Even if there's an error, show sample data
        setFeaturedChocolates(sampleChocolates);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Carousel controls
  const totalSlides = Math.ceil(featuredChocolates.length / 3);
  const currentSlideChocolates = featuredChocolates.slice(
    currentCarouselIndex * 3, 
    currentCarouselIndex * 3 + 3
  );

  const nextSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev >= totalSlides - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev <= 0 ? totalSlides - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentCarouselIndex(index);
  };
  
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

  // Format review date
  const formatReviewDate = (createdAt) => {
    if (!createdAt) return '';
    
    try {
      const date = typeof createdAt.toDate === 'function' 
        ? createdAt.toDate() 
        : new Date(createdAt.seconds * 1000);
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
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
          <SEO
      title="Best Chocolate Reviews & Ratings"
      description="Discover the world's finest chocolates through expert reviews and ratings. Join our community of chocolate enthusiasts to explore, review, and share premium chocolates."
      keywords="chocolate reviews, chocolate ratings, best chocolate, dark chocolate, milk chocolate, artisan chocolate, chocolate tasting, chocolate community"
      url="/"
           />
           
      {/* Hero Section with locally stored image */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `linear-gradient(rgba(93, 64, 55, 0.85), rgba(93, 64, 55, 0.85)), url(${heroBackground})` }}
      >
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title display-1">
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
      
      {/* Featured Chocolates Section - Now using ChocolateCard component */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title display-2">Featured Chocolates</h2>
            <p className="section-subtitle">Premium chocolates from renowned makers, curated for excellence</p>
            <Link to="/browse" className="view-all">View All Chocolates</Link>
          </div>
          
          <div className="featured-container">
            <div className="chocolate-cards">
              {currentSlideChocolates.map(chocolate => (
                <ChocolateCard 
                  key={chocolate.id} 
                  chocolate={chocolate} 
                  featured={true}
                />
              ))}
            </div>
            
            {totalSlides > 1 && (
              <div className="carousel-controls">
                <button 
                  className="carousel-btn" 
                  onClick={prevSlide}
                  disabled={currentCarouselIndex === 0}
                >
                  ←
                </button>
                
                <div className="carousel-indicators">
                  {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentCarouselIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
                
                <button 
                  className="carousel-btn" 
                  onClick={nextSlide}
                  disabled={currentCarouselIndex === totalSlides - 1}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
            
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="how-it-works-content">
            <h2 className="section-title">How Chocly Works</h2>
            <p className="section-subtitle">Join our chocolate community in three simple steps</p>
          </div>
          
          <div className="steps-visual">
            <div className="step-card">
              <div className="step-icon discover">
                <svg viewBox="0 0 24 24">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
              <div className="step-content">
                <h3 className="step-title">Discover</h3>
                <p className="step-description">
                  Explore our extensive chocolate database and find chocolates based on origin, flavor profile, or maker
                </p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-icon taste">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.5 16.5,17.4 13,17.9V21H11V17.9C7.5,17.4 5,14.5 5,11V10H7V11A5,5 0 0,0 12,16A5,5 0 0,0 17,11V10H19V11Z" />
                </svg>
              </div>
              <div className="step-content">
                <h3 className="step-title">Taste & Rate</h3>
                <p className="step-description">
                  Develop your palate by tasting and rating chocolates, tracking your personal chocolate journey
                </p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-icon connect">
                <svg viewBox="0 0 24 24">
                  <path d="M16.5,6.5A2,2 0 0,1 18.5,8.5A2,2 0 0,1 16.5,10.5A2,2 0 0,1 14.5,8.5A2,2 0 0,1 16.5,6.5M16.5,12A3.5,3.5 0 0,0 20,8.5A3.5,3.5 0 0,0 16.5,5A3.5,3.5 0 0,0 13,8.5A3.5,3.5 0 0,0 16.5,12M7.5,6.5A2,2 0 0,1 9.5,8.5A2,2 0 0,1 7.5,10.5A2,2 0 0,1 5.5,8.5A2,2 0 0,1 7.5,6.5M7.5,12A3.5,3.5 0 0,0 11,8.5A3.5,3.5 0 0,0 7.5,5A3.5,3.5 0 0,0 4,8.5A3.5,3.5 0 0,0 7.5,12M21.5,17.5H14V16.25C14,14.75 13.75,13.5 11.75,13.5C10.5,13.5 9.25,14 7.75,14.5C6.25,15 5.25,15.25 4,15.25V17L4.75,17.25C5.5,17.5 5.75,17.75 6.25,18.25C6.75,18.75 7.5,19.5 8.5,20.25C9.5,21 9.75,21 11,21C12.25,21 12.5,21 13.5,20.25C14.5,19.5 15.25,18.75 15.75,18.25C16.25,17.75 16.5,17.5 17.25,17.25L18,17H21.5V17.5Z" />
                </svg>
              </div>
              <div className="step-content">
                <h3 className="step-title">Connect</h3>
                <p className="step-description">
                  Share recommendations, follow fellow chocolate lovers, and join tasting events in your area
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title display-2">Community Reviews</h2>
            <p className="section-subtitle">Discover what chocolate lovers are saying</p>
            {featuredReviews.length > 0 && (
              <Link to="/browse" className="view-all">Explore More Chocolates</Link>
            )}
          </div>
          
          <div className="reviews-grid">
            {featuredReviews.length > 0 ? (
              featuredReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="user-name">{review.user || 'Anonymous User'}</span>
                      <span className="review-date">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="review-chocolate">
                    <div className="chocolate-image"></div>
                    <div className="chocolate-info">
                      <h4 className="chocolate-name">{review.chocolate?.name}</h4>
                      <p className="chocolate-maker">{review.chocolate?.maker}</p>
                    </div>
                  </div>
                  <p className="review-text">
                    {review.text && review.text.length > 150 
                      ? `${review.text.substring(0, 150)}...`
                      : review.text
                    }
                  </p>
                  <Link to={`/chocolate/${review.chocolateId}`} className="read-more">
                    Read Full Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-reviews-message">
                <h3>Be the First to Review!</h3>
                <p>No reviews yet, but that's where you come in! Share your chocolate discoveries with the community.</p>
                <Link to="/browse" className="btn btn-primary btn-sm">Find Chocolates to Review</Link>
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
        <Link to="/login" className="btn-sign-in">Sign In</Link>
        <Link to="/signup" className="btn-create-account">Create Account</Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}

export default HomePage;