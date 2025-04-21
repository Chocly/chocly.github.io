// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllChocolates } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './HomePage.css';

// Sample recent reviews (in a real app, these would come from your database)
const sampleRecentReviews = [
  {
    id: 'rev1',
    user: 'ChocolateLover42',
    rating: 4.5,
    text: 'The notes of cherry and vanilla in this bar are perfectly balanced. It has a smooth melt and lingering finish that keeps me coming back for more.',
    date: '2023-04-12',
    chocolate: {
      id: '1',
      name: 'Valrhona Guanaja 70%',
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    }
  },
  {
    id: 'rev2',
    user: 'CocoaExplorer',
    rating: 5,
    text: 'This is hands down the best milk chocolate I\'ve ever tasted. Creamy, not too sweet, with complex notes you don\'t usually find in milk chocolate.',
    date: '2023-04-10',
    chocolate: {
      id: '2',
      name: 'Amedei Toscano Brown',
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    }
  },
  {
    id: 'rev3',
    user: 'BeanToBarFan',
    rating: 4,
    text: 'A wonderful single-origin bar with bright fruity notes. The texture is perfect, though I found the finish a bit too acidic for my taste.',
    date: '2023-04-08',
    chocolate: {
      id: '3',
      name: 'Dandelion Madagascar',
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    }
  }
];

// Helper function to render star ratings
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<span key={i} className="star full">★</span>);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<span key={i} className="star half">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">★</span>);
    }
  }
  
  return stars;
};

function ReviewPreview({ review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <span className="reviewer-name">{review.user}</span>
          <div className="review-rating">
            {renderStars(review.rating)}
          </div>
        </div>
        <div className="chocolate-info">
          <img src={review.chocolate.imageUrl} alt={review.chocolate.name} />
          <span className="chocolate-name">{review.chocolate.name}</span>
        </div>
      </div>
      <p className="review-text">{review.text.substring(0, 120)}...</p>
      <Link to={`/chocolate/${review.chocolate.id}`} className="read-more">
        Read more <span className="arrow">→</span>
      </Link>
    </div>
  );
}

function HomePage() {
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentReviews] = useState(sampleRecentReviews);
  
  useEffect(() => {
    const fetchChocolates = async () => {
      try {
        setLoading(true);
        const data = await getAllChocolates();
        setChocolates(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChocolates();
  }, []);
  
  const getFeaturedChocolates = () => {
    // In a real app, you might want to select featured chocolates based on ratings or other criteria
    return chocolates.slice(0, 6);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Discovering amazing chocolates...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Discover Your Perfect Chocolate</h1>
          <p className="hero-subtitle">Life is too short for mediocre chocolate. Find, rate, and share the world's finest bars.</p>
          <div className="hero-cta">
            <Link to="/browse" className="cta-button primary">Explore Chocolates</Link>
            <Link to="/about" className="cta-button secondary">About Us</Link>
          </div>
        </div>
      </div>
      
      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">We believe chocolate is an art form. Our mission is to help you navigate the world of premium chocolate, connect you with exceptional makers, and build a community of passionate chocolate lovers.</p>
          </div>
          <div className="mission-cards">
            <div className="mission-card">
              <div className="icon-container">
                <i className="mission-icon discover"></i>
              </div>
              <h3>Discover</h3>
              <p>Find new chocolates based on flavor profiles, origin, and maker</p>
            </div>
            <div className="mission-card">
              <div className="icon-container">
                <i className="mission-icon rate"></i>
              </div>
              <h3>Rate & Review</h3>
              <p>Share your experiences and help others find exceptional chocolate</p>
            </div>
            <div className="mission-card">
              <div className="icon-container">
                <i className="mission-icon learn"></i>
              </div>
              <h3>Learn</h3>
              <p>Explore the stories behind each bar and develop your palate</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Chocolates Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Chocolates</h2>
            <Link to="/browse" className="view-all-link">Browse All <span className="arrow">→</span></Link>
          </div>
          
          <div className="featured-grid">
            {getFeaturedChocolates().map(chocolate => (
              <ChocolateCard key={chocolate.id} chocolate={chocolate} featured={true} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Explore By Category</h2>
          
          <div className="category-showcase">
            <Link to="/category/dark" className="category-tile dark">
              <div className="category-content">
                <h3>Dark Chocolate</h3>
                <p>Bold & intense</p>
              </div>
            </Link>
            
            <Link to="/category/milk" className="category-tile milk">
              <div className="category-content">
                <h3>Milk Chocolate</h3>
                <p>Smooth & creamy</p>
              </div>
            </Link>
            
            <Link to="/category/origin" className="category-tile origin">
              <div className="category-content">
                <h3>Single Origin</h3>
                <p>Distinctive terroir</p>
              </div>
            </Link>
            
            <Link to="/category/filled" className="category-tile filled">
              <div className="category-content">
                <h3>Filled Chocolates</h3>
                <p>Exciting combinations</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Latest Reviews Section */}
      <section className="latest-reviews">
        <div className="container">
          <h2 className="section-title">Latest Reviews</h2>
          <div className="reviews-slider">
            {recentReviews.map(review => (
              <ReviewPreview key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="join-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Join Our Chocolate Community</h2>
            <p>Create an account to rate chocolates, save favorites, and connect with fellow enthusiasts</p>
            <Link to="/signup" className="cta-button primary">Sign Up</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;