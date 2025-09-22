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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
      );
    } else if (i === fullStars + 1 && decimalPart > 0) {
      // Partial star - use a container with two overlapping SVG stars
      const fillPercentage = Math.round(decimalPart * 100);
      starElement = (
        <span 
          key={i}
          className={`star-container ${size === 'large' ? 'star-large' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="star empty">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="star partial"
            style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
      );
    }
    
    stars.push(starElement);
  }
  
  return <div className="rating-stars">{stars}</div>;
}

export default RatingStars;