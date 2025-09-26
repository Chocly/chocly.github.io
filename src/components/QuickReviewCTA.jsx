// Updated QuickReviewCTA.jsx with proper edit functionality
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addReview, updateReview } from '../services/reviewService';
import './QuickReviewCTA.css';

function QuickReviewCTA({ 
  chocolateId, 
  chocolateName, 
  onQuickReview, 
  hasUserReviewed, 
  existingReview 
}) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If editing, populate with existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReviewText(existingReview.text || '');
      setReviewTitle(existingReview.title || '');
    }
  }, [existingReview]);

  const handleStarClick = (value) => {
    setRating(value);
    
    // If this is an edit and they're just updating the rating
    if (existingReview && !isReviewFormOpen) {
      handleQuickRatingUpdate(value);
    }
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  // Quick rating update for existing reviews
  const handleQuickRatingUpdate = async (newRating) => {
    if (!existingReview?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateReview(existingReview.id, {
        rating: newRating,
        text: existingReview.text || '',
        title: existingReview.title || ''
      });
      
      if (onQuickReview) {
        onQuickReview({ 
          ...existingReview, 
          rating: newRating 
        });
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    if (!reviewText.trim() && !existingReview) {
      alert('Please write a review');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        text: reviewText.trim(),
        title: reviewTitle.trim()
      };

      if (existingReview?.id) {
        // UPDATE existing review
        console.log('Updating existing review:', existingReview.id);
        await updateReview(existingReview.id, reviewData);
        
        alert('Review updated successfully!');
      } else {
        // ADD new review
        console.log('Adding new review');
        const fullReviewData = {
          ...reviewData,
          chocolateId,
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous',
          userPhotoURL: currentUser.photoURL || null,
          helpful: 0,
          createdAt: new Date()
        };
        
        await addReview(fullReviewData);
        alert('Review added successfully!');
      }

      // Call the parent callback
      if (onQuickReview) {
        onQuickReview({
          ...reviewData,
          chocolateId,
          userId: currentUser.uid
        });
      }

      // Reset form
      if (!existingReview) {
        setRating(0);
        setReviewText('');
        setReviewTitle('');
      }
      setIsReviewFormOpen(false);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to ${existingReview ? 'update' : 'add'} review. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (starValue) => {
    const isFilled = (hoveredRating || rating) >= starValue;
    
    return (
      <button
        key={starValue}
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

  // Show appropriate UI based on review state
  if (hasUserReviewed && existingReview) {
    return (
      <div className="review-cta-banner">
        <div className="cta-content">
          <div className="cta-text">
            <h3>Your Review</h3>
            <p>Update your rating or edit your review</p>
          </div>
          
          <div className="quick-rating-only">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(renderStar)}
            </div>
            {rating > 0 && (
              <div className="rating-preview">
                <span className="rating-text">{getRatingText(rating)}</span>
                <span className="rating-value">({rating}/5)</span>
              </div>
            )}
          </div>

          <div className="cta-actions">
            <button 
              className="cta-button secondary"
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
            >
              {isReviewFormOpen ? 'Cancel Edit' : 'Edit Full Review'}
            </button>
          </div>

          {isReviewFormOpen && (
            <form className="review-form-expanded" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="review-title">Review Title (Optional)</label>
                <input
                  id="review-title"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="review-text">Your Review</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this chocolate..."
                  rows="4"
                  required={!existingReview}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setIsReviewFormOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!currentUser) {
    return (
      <div className="review-cta-banner">
        <div className="cta-content">
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

  // New review state
  return (
    <div className="review-cta-banner">
      <div className="cta-content">
        <div className="cta-text">
          <h3>Rate This Chocolate</h3>
          <p>Click stars to rate, then optionally add your thoughts</p>
        </div>
        
        <div className="quick-rating-only">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          {rating > 0 && (
            <div className="rating-preview">
              <span className="rating-text">{getRatingText(rating)}</span>
              <span className="rating-value">({rating}/5)</span>
            </div>
          )}
        </div>

        {rating > 0 && (
          <div className="cta-actions">
            <button 
              className="cta-button secondary"
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
            >
              {isReviewFormOpen ? 'Just Save Rating' : 'Add Written Review'}
            </button>
          </div>
        )}

        {isReviewFormOpen && (
          <form className="review-form-expanded" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="review-title">Review Title (Optional)</label>
              <input
                id="review-title"
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength="100"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="review-text">Your Review</label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this chocolate..."
                rows="4"
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsReviewFormOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting || !rating}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuickReviewCTA;