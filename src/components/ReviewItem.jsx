// src/components/ReviewItem.jsx
import React from 'react';
import RatingStars from './RatingStars';
import { formatReviewerName } from '../utils/nameFormatter';
import './ReviewItem.css';

function ReviewItem({ review }) {
  // Format the reviewer's name for privacy
  const displayName = formatReviewerName(review.userName || review.user || 'Anonymous');
  
  // Format the date
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      // Handle Firebase timestamp
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <span className="reviewer-name">{displayName}</span>
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
        <div className="review-rating">
          <RatingStars rating={review.rating} size="small" />
        </div>
      </div>
      
      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}
      
      <p className="review-text">{review.text}</p>
      
      {review.helpful > 0 && (
        <div className="review-helpful">
          <span className="helpful-count">
            {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
          </span>
        </div>
      )}
    </div>
  );
}

export default ReviewItem;