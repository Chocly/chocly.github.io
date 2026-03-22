// src/components/ReviewItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import ReviewPhotoGallery from './ReviewPhotoGallery';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ShareButton from './ShareButton';
import { formatReviewerName } from '../utils/nameFormatter';
import './ReviewItem.css';

function ReviewItem({ review, isLiked = false }) {
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
          {review.userId ? (
            <Link to={`/user/${review.userId}`} className="reviewer-name reviewer-link">
              {displayName}
            </Link>
          ) : (
            <span className="reviewer-name">{displayName}</span>
          )}
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
        <div className="review-rating">
          <RatingStars rating={review.rating} size="small" />
        </div>
      </div>

      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}

      {review.photoUrls?.length > 0 && (
        <ReviewPhotoGallery photos={review.photoUrls} />
      )}

      <p className="review-text">{review.text}</p>

      <div className="review-actions">
        <LikeButton
          reviewId={review.id}
          initialLikeCount={review.likeCount || 0}
          initialIsLiked={isLiked}
        />
        <CommentSection
          reviewId={review.id}
          commentCount={review.commentCount || 0}
        />
        <ShareButton
          title={`${displayName}'s review on Chocly`}
          text={review.title || review.text?.slice(0, 100) || 'Check out this review on Chocly'}
          url={`/chocolate/${review.chocolateId}`}
        />
      </div>
    </div>
  );
}

export default ReviewItem;
