// src/components/ChocolateCard.jsx - Updated with your improvements
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FavoriteButton from './FavoriteButton';
import WantToTryButton from './WantToTryButton';
import './ChocolateCard.css';


function ChocolateCard({ chocolate, featured = false, className = '' }) {
  const { currentUser } = useAuth();
  
  // Helper function to get display title with fallback
  const getDisplayTitle = () => {
    if (!chocolate) return 'Unknown Chocolate';
    return chocolate.name || chocolate.title || 'Unnamed Chocolate';
  };
  
  // Helper function to get display maker with fallback
  const getDisplayMaker = () => {
    if (!chocolate) return 'Unknown Maker';
    return chocolate.maker || chocolate.brand || 'Unknown Maker';
  };
  
  // FIXED: Properly render filled stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // Full star - filled with gold
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        // Half star
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        // Empty star - light gray
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return stars;
  };

  if (!chocolate) {
    return <div className="chocolate-card error">Chocolate data not available</div>;
  }

  return (
    <div className={`chocolate-card ${featured ? 'featured' : ''} ${className}`}>
      
      {/* Image Container with Link - using existing classes */}
      <Link to={`/chocolate/${chocolate.id}`} className="chocolate-link">
        <div className="image-container">
          <img 
            src={chocolate.imageUrl || '/placeholder-chocolate.jpg'} 
            alt={getDisplayTitle()} 
            className="card-image" 
          />
        </div>
      </Link>

      {/* Action buttons - improved alignment */}
      <div className="card-actions">
        <FavoriteButton 
          chocolateId={chocolate.id} 
          size="medium" 
          className="card-overlay"
        />
      </div>

      {/* Card Content - improved hierarchy */}
      <div className="card-content">
        
        {/* Chocolate title - NOW FIRST AND PROMINENT */}
        <Link 
          to={`/chocolate/${chocolate.id}`} 
          className="chocolate-title-link"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="card-title">{getDisplayTitle()}</h3>
        </Link>
        
        {/* Maker name - NOW SECOND AS SUPPORTING TEXT */}
        <Link 
          to={`/maker?maker=${encodeURIComponent(getDisplayMaker())}`} 
          className="card-maker-link"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="card-maker">{getDisplayMaker()}</p>
        </Link>
        
        {/* REMOVED: Origin and Cacao Percentage section */}
        {/* The card-details div has been removed as requested */}
        
        {/* Rating Section - moved closer to product info with review count */}
        <div className="card-rating">
          <span className="rating-value">{(chocolate.averageRating || 0).toFixed(1)}</span>
          <div className="stars">
            {renderStars(chocolate.averageRating || 0)}
          </div>
          {/* Show review count if it exists, otherwise show 0 */}
          <span className="rating-count">
            ({chocolate.reviewCount || 0} {(chocolate.reviewCount === 1) ? 'review' : 'reviews'})
          </span>
        </div>
        
      </div>
    </div>
  );
}  

export default ChocolateCard;