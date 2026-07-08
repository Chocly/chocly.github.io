// QuickReviewCTA.jsx — tap-to-rate + optional written review
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addReview, updateReview } from '../services/reviewService';
import { authUrl } from '../utils/authRedirect';
import { useToast } from './ui/Toast';
import ReviewPhotoUploader from './ReviewPhotoUploader';
import './QuickReviewCTA.css';

function QuickReviewCTA({
  chocolateId,
  chocolateName,
  onQuickReview,
  hasUserReviewed,
  existingReview
}) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  // A rating-only review created by tapping a star this session — from then
  // on star taps are updates to it, not new reviews.
  const [quickSavedReview, setQuickSavedReview] = useState(null);

  const activeReview = existingReview || quickSavedReview;

  // If editing, populate with existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReviewText(existingReview.text || '');
      setReviewTitle(existingReview.title || '');
    }
  }, [existingReview]);

  // A star tap IS a rating: it saves immediately, whether or not a review
  // exists yet. Written text is optional, added later via the form.
  const handleStarClick = (value) => {
    setRating(value);

    if (isReviewFormOpen) return; // form submit will handle persistence

    if (activeReview?.id) {
      handleQuickRatingUpdate(value);
    } else {
      saveQuickRating(value);
    }
  };

  // First star tap for this user+chocolate: create a rating-only review.
  const saveQuickRating = async (value) => {
    if (!currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const saved = await addReview({
        rating: value,
        text: '',
        title: '',
        chocolateId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || null,
        helpful: 0,
        createdAt: new Date()
      });

      setQuickSavedReview(saved);
      if (onQuickReview) {
        onQuickReview(saved);
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Failed to save your rating. Please try again.');
      setRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  // Quick rating update for a review that already exists
  const handleQuickRatingUpdate = async (newRating) => {
    if (!activeReview?.id) return;

    setIsSubmitting(true);
    try {
      await updateReview(activeReview.id, {
        rating: newRating,
        text: activeReview.text || '',
        title: activeReview.title || ''
      });

      if (onQuickReview) {
        onQuickReview({
          ...activeReview,
          rating: newRating
        });
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a star rating first');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        text: reviewText.trim(),
        title: reviewTitle.trim()
      };

      let savedReview;
      if (activeReview?.id) {
        // UPDATE existing review (including one just created by a star tap).
        // Pass photoFiles so newly attached photos aren't dropped.
        savedReview = await updateReview(activeReview.id, reviewData, photoFiles);
        savedReview = { ...activeReview, ...savedReview };
      } else {
        // ADD new review (text optional — the rating is the review)
        const fullReviewData = {
          ...reviewData,
          chocolateId,
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous',
          userPhotoURL: currentUser.photoURL || null,
          helpful: 0,
          createdAt: new Date()
        };

        savedReview = await addReview(fullReviewData, photoFiles);
        setQuickSavedReview(savedReview);
      }

      // Call the parent callback
      if (onQuickReview) {
        onQuickReview(savedReview);
      }

      setIsReviewFormOpen(false);

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(`Failed to ${activeReview ? 'update' : 'add'} your review. Please try again.`);
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

              <div className="form-group">
                <label>Photos</label>
                <ReviewPhotoUploader
                  photos={photoFiles}
                  onPhotosChange={setPhotoFiles}
                  existingUrls={existingReview?.photoUrls || []}
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
            <Link to={authUrl(location.pathname)} className="cta-button primary">
              Sign In to Review
            </Link>
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
          <p>
            {activeReview
              ? 'Rating saved! Add your thoughts to help fellow chocolate lovers.'
              : 'Tap a star to rate — it saves instantly'}
          </p>
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
              {isReviewFormOpen ? 'Cancel' : 'Add Written Review'}
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
              <label htmlFor="review-text">Your Review (Optional)</label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this chocolate..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Photos (optional)</label>
              <ReviewPhotoUploader
                photos={photoFiles}
                onPhotosChange={setPhotoFiles}
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