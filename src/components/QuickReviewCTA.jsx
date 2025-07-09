// src/components/QuickReviewCTA.jsx - REDESIGNED UX
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './QuickReviewCTA.css';

function QuickReviewCTA({ chocolateId, chocolateName, onQuickReview, hasUserReviewed, existingReview }) {
  const { currentUser } = useAuth();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onQuickReview({
        rating: selectedRating,
        text: reviewText.trim(),
        chocolateId,
        isUpdate: hasUserReviewed
      });
      
      // Keep form open so user can see their submitted review
      // But disable further edits
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    if (!isReviewFormOpen) {
      setIsReviewFormOpen(true);
    }
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const displayRating = hoverRating || selectedRating;
    const isFilled = starValue <= displayRating;
    
    return (
      <button
        key={index}
        type="button"
        className={`star-button ${isFilled ? 'filled' : 'empty'}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        onMouseLeave={handleStarLeave}
        aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
        disabled={isSubmitting}
      >
        ★
      </button>
    );
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  // Don't show if user already reviewed (unless we're showing their existing review for editing)
  if (hasUserReviewed && !existingReview) {
    return (
      <div className="review-cta-completed">
        <div className="cta-icon">✅</div>
        <span>Thanks for your review!</span>
        <button 
          className="edit-review-btn"
          onClick={() => setIsReviewFormOpen(true)}
        >
          Edit Review
        </button>
      </div>
    );
  }

  // Not logged in state
  if (!currentUser) {
    return (
      <div className="review-cta-banner">
        <div className="cta-content">
          <div className="cta-icon">⭐</div>
          <div className="cta-text">
            <h3>Rate {chocolateName}</h3>
            <p>Share your experience with fellow chocolate lovers</p>
          </div>
          <div className="cta-actions">
            <a href="/login" className="cta-button primary">
              Sign In to Review
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Main review interface
  return (
    <div className="review-cta-banner">
      <div className="cta-content">
        <div className="cta-icon">⭐</div>
        <div className="cta-text">
          <h3>{hasUserReviewed ? 'Update Your Review' : 'Rate This Chocolate'}</h3>
          <p>Click stars to rate, then optionally add your thoughts</p>
        </div>
        
        {!isReviewFormOpen ? (
          <div className="quick-rating-only">
            <div className="rating-stars">
              {[0, 1, 2, 3, 4].map(renderStar)}
            </div>
            {selectedRating > 0 && (
              <div className="rating-preview">
                <span className="rating-text">{getRatingText(selectedRating)}</span>
                <span className="rating-value">({selectedRating}/5)</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-rating">
              <label htmlFor="rating-stars">Your Rating *</label>
              <div id="rating-stars" className="rating-stars">
                {[0, 1, 2, 3, 4].map(renderStar)}
              </div>
              {selectedRating > 0 && (
                <div className="rating-feedback">
                  <span className="rating-text">{getRatingText(selectedRating)}</span>
                  <span className="rating-value">({selectedRating}/5)</span>
                </div>
              )}
            </div>
            
            <div className="form-text">
              <label htmlFor="review-text">Your Thoughts (Optional)</label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think of this chocolate? How did it taste?"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="char-count">{reviewText.length}/500</div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setIsReviewFormOpen(false);
                  setSelectedRating(existingReview?.rating || 0);
                  setReviewText(existingReview?.text || '');
                }}
                className="btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={selectedRating === 0 || isSubmitting}
                className="btn-submit"
              >
                {isSubmitting ? 'Submitting...' : hasUserReviewed ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuickReviewCTA;