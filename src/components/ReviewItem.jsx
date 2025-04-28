import RatingStars from './RatingStars';
import './ReviewItem.css';

function ReviewItem({ review }) {
  // Format date if available
  const formattedDate = review.createdAt 
    ? (typeof review.createdAt.toDate === 'function' 
        ? review.createdAt.toDate().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) 
        : new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
          }))
    : '';
    
  return (
    <div className="review-item">
      <div className="review-header">
        <span className="username">{review.user || 'Anonymous User'}</span>
        <div className="review-rating-stars">
          <RatingStars rating={review.rating} />
        </div>
        {formattedDate && <span className="review-date">{formattedDate}</span>}
      </div>
      <p className="review-text">{review.text}</p>
    </div>
  );
}

export default ReviewItem;