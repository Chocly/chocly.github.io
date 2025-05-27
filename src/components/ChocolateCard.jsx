// src/components/ChocolateCard.jsx - Clean version with heart button
import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import './ChocolateCard.css';

function ChocolateCard({ chocolate, featured = false }) {
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
      
      {/* Heart/Favorite button - positioned over the image */}
      <FavoriteButton 
        chocolateId={chocolate.id} 
        size="medium" 
        className="card-overlay"
      />
      
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