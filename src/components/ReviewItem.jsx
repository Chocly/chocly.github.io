import RatingStars from './RatingStars';
import './ReviewItem.css';

function ReviewItem({ review }) {
  // Format date if available
  const formattedDate = review.date 
    ? new Date(review.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : '';
    
  return (
    <div className="review-item">
      <div className="review-header">
        <span className="username">{review.user}</span>
        <RatingStars rating={review.rating} />
        {formattedDate && <span className="review-date">{formattedDate}</span>}
      </div>
      <p className="review-text">{review.text}</p>
    </div>
  );
}

export default ReviewItem;