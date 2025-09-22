// src/components/ReviewPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatReviewerName } from '../utils/nameFormatter';
import './ReviewPreview.css';

function ReviewPreview({ review }) {
  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const displayName = formatReviewerName(review.userName || review.user);
    
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
  
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
        <span className="reviewer-name">{displayName}</span>
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

export default ReviewPreview;