// src/components/ChocolateCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// Remove the Expo vector icons import
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

  // Format title to include brand if available
  const getFormattedTitle = () => {
    if (chocolate.maker && !chocolate.name.includes(chocolate.maker)) {
      return `${chocolate.maker} - ${chocolate.name}`;
    }
    return chocolate.name;
  };

  return (
    <Link 
      to={`/chocolate/${chocolate.id}`} 
      className={`chocolate-card ${featured ? 'featured' : ''}`}
    >
      <div className="image-container">
        <img src={chocolate.imageUrl} alt={chocolate.name} className="card-image" />
        {featured && (
          <div className="featured-badge">
            <span>Featured</span>
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{getFormattedTitle()}</h3>
        <p className="card-maker">{chocolate.maker}</p>
        
        <div className="card-details">
          <span className="origin">{chocolate.origin}</span>
          <span className="percentage">{chocolate.cacaoPercentage}% Cacao</span>
        </div>
        
        <div className="card-rating">
          <span className="rating-value">{chocolate.averageRating.toFixed(1)}</span>
          <div className="stars">
            {renderStars(chocolate.averageRating)}
          </div>
          <span className="rating-count">({chocolate.ratings})</span>
        </div>
      </div>
    </Link>
  );
}

export default ChocolateCard;