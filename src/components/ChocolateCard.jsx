// src/components/ChocolateCard.jsx - Enhanced version with dynamic star colors
import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import './ChocolateCard.css';
import WantToTryButton from './WantToTryButton';
import { useAuth } from '../contexts/AuthContext';

function ChocolateCard({ chocolate, featured = false }) {
  // Add useAuth hook here
  const { currentUser } = useAuth();

  // Enhanced helper function to render star ratings with dynamic colors
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Determine star color class based on overall rating
    const getStarColorClass = (rating) => {
      if (rating >= 4.5) return 'filled-5'; // Green for excellent
      if (rating >= 3.5) return 'filled-4'; // Light green for good  
      if (rating >= 2.5) return 'filled-3'; // Yellow for average
      if (rating >= 1.5) return 'filled-2'; // Orange for below average
      return 'filled-1'; // Red for poor
    };
    
    const colorClass = getStarColorClass(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className={`star ${colorClass}`}>★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className={`star half ${colorClass}`}>★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return stars;
  };

  const getDisplayTitle = () => {
    return chocolate.name;
  };

  const getDisplayMaker = () => {
    // The service now enriches chocolates with maker names
    return chocolate.maker || 'Unknown Maker';
  };

  return (
    <div className={`chocolate-card ${featured ? 'featured' : ''}`}>
      {/* Chocolate image - links to detail page */}
      <Link to={`/chocolate/${chocolate.id}`} className="chocolate-link">
        <div className="image-container">
          <img src={chocolate.imageUrl} alt={chocolate.name} className="card-image" />
          {featured && (
            <div className="featured-badge">
              <span>Featured</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Action buttons container */}
      <div className="card-actions">
        {/* Heart/Favorite button */}
        <FavoriteButton 
          chocolateId={chocolate.id} 
          size="medium" 
          className="card-overlay"
        />
        
        {/* WantToTryButton */}
        <WantToTryButton 
          chocolate={chocolate} 
          currentUser={currentUser}
          className="shadow-sm"
        />
      </div>

      <div className="card-content">
        {/* Clickable maker name - links to maker page */}
        <Link 
          to={`/maker?maker=${encodeURIComponent(getDisplayMaker())}`} 
          className="card-maker-link"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="card-maker">{getDisplayMaker()}</p>
        </Link>
        
        {/* Clickable chocolate title - links to detail page */}
        <Link 
          to={`/chocolate/${chocolate.id}`} 
          className="chocolate-title-link"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="card-title">{getDisplayTitle()}</h3>
        </Link>
        
        <div className="card-details">
          <span className="origin">{chocolate.origin}</span>
          <span className="percentage">{chocolate.cacaoPercentage}% Cacao</span>
        </div>
        
        <div className="card-rating">
          <span className="rating-value">{(chocolate.averageRating || 0).toFixed(1)}</span>
          <div className="stars">
            {renderStars(chocolate.averageRating || 0)}
          </div>
          <span className="rating-count">({chocolate.ratings || 0})</span>
        </div>
      </div>
    </div>
  );
}  

export default ChocolateCard;