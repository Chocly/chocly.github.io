// QuickReviewCTA.jsx - Add this component to your chocolate detail page
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from '../components/RatingStars';
import './QuickReviewCTA.css';

function QuickReviewCTA({ chocolateId, chocolateName, onQuickReview, hasUserReviewed }) {
  const { currentUser } = useAuth();
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickRating, setQuickRating] = useState(0);
  const [quickText, setQuickText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (quickRating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onQuickReview({
        rating: quickRating,
        text: quickText.trim(),
        chocolateId
      });
      
      // Reset form and close
      setQuickRating(0);
      setQuickText('');
      setShowQuickForm(false);
    } catch (error) {
      console.error('Error submitting quick review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingOnly = async (rating) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      await onQuickReview({
        rating,
        text: '',
        chocolateId
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show if user already reviewed
  if (hasUserReviewed) {
    return (
      <div className="review-cta-completed">
        <div className="cta-icon">✅</div>
        <span>Thanks for your review!</span>
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
            <h3>Share your experience with {chocolateName}</h3>
            <p>Help others discover great chocolate</p>
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

  // Logged in - show quick review options
  return (
    <div className="review-cta-banner">
      <div className="cta-content">
        <div className="cta-icon">⭐</div>
        <div className="cta-text">
          <h3>Rate this chocolate</h3>
          <p>Quick rating or full review - your choice!</p>
        </div>
        
        {!showQuickForm ? (
          <div className="cta-actions">
            {/* Quick star rating - no text required */}
            <div className="quick-rating">
              <span className="quick-label">Quick rate:</span>
              <RatingStars 
                rating={0} 
                onRatingChange={handleRatingOnly}
                interactive={true}
                size="large"
              />
            </div>
            
            <button 
              onClick={() => setShowQuickForm(true)}
              className="cta-button secondary"
            >
              Write Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleQuickSubmit} className="quick-review-form">
            <div className="form-rating">
              <label htmlFor="quick-rating-stars">Rating *</label>
              <div id="quick-rating-stars" role="radiogroup" aria-label="Rate this chocolate from 1 to 5 stars">
                <RatingStars 
                  rating={quickRating} 
                  onRatingChange={setQuickRating}
                  interactive={true}
                  size="medium"
                />
              </div>
            </div>
            
            <div className="form-text">
              <label htmlFor="quick-review-text">Your thoughts (optional)</label>
              <textarea
                id="quick-review-text"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="Share your thoughts (optional)..."
                rows={3}
                maxLength={500}
              />
              <div className="char-count">{quickText.length}/500</div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowQuickForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={quickRating === 0 || isSubmitting}
                className="btn-submit"
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