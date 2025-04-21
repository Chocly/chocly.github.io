import './RatingStars.css';

function RatingStars({ rating, size = 'small', interactive = false, onRatingChange }) {
  const stars = [];
  
  const handleStarClick = (selectedRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  for (let i = 1; i <= 5; i++) {
    let starClass = 'star';
    if (i <= Math.floor(rating)) {
      starClass += ' filled';
    } else if (i - 0.5 <= rating) {
      starClass += ' half-filled';
    }
    
    if (size === 'large') {
      starClass += ' star-large';
    }
    
    if (interactive) {
      starClass += ' interactive';
    }
    
    stars.push(
      <span 
        key={i} 
        className={starClass}
        onClick={() => handleStarClick(i)}
      >★</span>
    );
  }
  
  return <div className="rating-stars">{stars}</div>;
}

export default RatingStars;