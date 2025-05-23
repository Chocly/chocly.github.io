// src/components/ChocolateCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ChocolateCard.css';

function ChocolateCard({ chocolate, featured = false }) {
  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    
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

  // Safely get rating and review count
  const rating = chocolate.averageRating || 0;
  const reviewCount = chocolate.reviewCount || chocolate.ratings || 0;
  
  // Get chocolate image with fallback
  const getChocolateImage = () => {
    if (chocolate.imageUrl && chocolate.imageUrl !== 'https://placehold.co/300x300?text=Chocolate') {
      return chocolate.imageUrl;
    }
    
    // Use a generic chocolate image as fallback
    return 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&h=300&fit=crop&crop=center';
  };

  // Format title to be concise but informative
  const getCardTitle = () => {
    // For featured cards, show just the chocolate name
    if (featured || !chocolate.maker) {
      return chocolate.name;
    }
    
    // For search results, include maker if not already in name
    if (chocolate.name.toLowerCase().includes(chocolate.maker.toLowerCase())) {
      return chocolate.name;
    }
    
    return chocolate.name;
  };

  // Get maker display name
  const getMakerName = () => {
    if (typeof chocolate.maker === 'string') {
      return chocolate.maker;
    }
    if (chocolate.maker && chocolate.maker.name) {
      return chocolate.maker.name;
    }
    return 'Unknown Maker';
  };

  // Get origin display
  const getOrigin = () => {
    return chocolate.origin || 'Various';
  };

  // Get cacao percentage
  const getCacaoPercentage = () => {
    const percentage = chocolate.cacaoPercentage || 0;
    return percentage > 0 ? `${percentage}%` : 'N/A';
  };

  return (
    <Link 
      to={`/chocolate/${chocolate.id}`} 
      className={`chocolate-card ${featured ? 'featured' : ''}`}
    >
      <div className="image-container">
        <img 
          src={getChocolateImage()} 
          alt={chocolate.name} 
          className="card-image"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&h=300&fit=crop&crop=center';
          }}
        />
        {featured && (
          <div className="featured-badge">
            Featured
          </div>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="card-title" title={chocolate.name}>
          {getCardTitle()}
        </h3>
        <p className="card-maker">{getMakerName()}</p>
        
        <div className="card-details">
          <span className="card-origin">{getOrigin()}</span>
          <span className="card-percentage">{getCacaoPercentage()} Cacao</span>
        </div>
        
        <div className="card-rating">
          <span className="rating-value">{rating.toFixed(1)}</span>
          <div className="stars">
            {renderStars(rating)}
          </div>
          <span className="rating-count">
            {reviewCount > 0 ? `(${reviewCount})` : '(New)'}
          </span>
        </div>
        
        {/* Show chocolate type for additional context */}
        {chocolate.type && (
          <div className="card-type">
            <span className="type-badge">{chocolate.type}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ChocolateCard;