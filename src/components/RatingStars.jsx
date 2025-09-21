// src/components/RatingStars.jsx
import React from 'react';
import './RatingStars.css';

function RatingStars({ rating, size = 'small', interactive = false, onRatingChange }) {
  const stars = [];
  
  const handleStarClick = (selectedRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  // Calculate star fills
  const fullStars = Math.floor(rating);
  const decimalPart = rating - fullStars;
  
  for (let i = 1; i <= 5; i++) {
    let starElement;
    
    if (i <= fullStars) {
      // Full filled star
      starElement = (
        <span 
          key={i} 
          className={`star filled ${size === 'large' ? 'star-large' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>
      );
    } else if (i === fullStars + 1 && decimalPart > 0) {
      // Partial star - use a container with two overlapping stars
      const fillPercentage = Math.round(decimalPart * 100);
      starElement = (
        <span 
          key={i}
          className={`star-container ${size === 'large' ? 'star-large' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          <span className="star empty">☆</span>
          <span 
            className="star partial" 
            style={{ width: `${fillPercentage}%` }}
          >
            ★
          </span>
        </span>
      );
    } else {
      // Empty star
      starElement = (
        <span 
          key={i} 
          className={`star empty ${size === 'large' ? 'star-large' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          ☆
        </span>
      );
    }
    
    stars.push(starElement);
  }
  
  return <div className="rating-stars">{stars}</div>;
}

export default RatingStars;