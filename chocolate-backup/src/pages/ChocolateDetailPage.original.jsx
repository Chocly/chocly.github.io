import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChocolateById } from '../services/chocolateFirebaseService';
import { getChocolateReviews } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import './ChocolateDetailPage.css';

function ChocolateDetailPage() {
  console.log('ChocolateDetailPage component rendering');
  const { id } = useParams();
  const [chocolate, setChocolate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const { currentUser } = useAuth();
  console.log('Chocolate ID from URL:', id);

  
  useEffect(() => {
    console.log('UseEffect running, fetching chocolate with ID:', id);
    const fetchChocolateData = async () => {
      try {
        console.log('Attempting to fetch chocolate data...');
        setLoading(true);
        // Fetch chocolate details
        const chocolateData = await getChocolateById(id);
        console.log('Chocolate data received:', data);
        setChocolate(chocolateData);
        
        // Fetch reviews for this chocolate
        const reviewsData = await getChocolateReviews(id);
        setReviews(reviewsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chocolate details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChocolateData();
  }, [id]);
  
  console.log('Component state:', { loading, error, chocolate });

  const handleRatingChange = (rating) => {
    setUserRating(rating);
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to leave a review');
      return;
    }
    
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    // In a real app, you would call a service to save the review
    alert('Review submission functionality will be implemented soon!');
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Loading chocolate details...</p>
      </div>
    );
  }
  
  if (error || !chocolate) {
    return (
      <div className="chocolate-detail-page">
        <h1>Chocolate Detail: {chocolate.name}</h1>
        <p>This is a basic version just to check if rendering works</p>
      </div>
    );
  }   
  // Prepare flavor profile data or use default if not available
  const flavorProfile = chocolate.flavorProfile || [
    { name: 'Sweet', intensity: 3 },
    { name: 'Bitter', intensity: 3 },
    { name: 'Fruity', intensity: 0 },
    { name: 'Nutty', intensity: 0 },
    { name: 'Earthy', intensity: 0 }
  ];
  
  // Prepare ingredients as array if it's a string
  const ingredients = Array.isArray(chocolate.ingredients) 
    ? chocolate.ingredients 
    : (chocolate.ingredients || '').split(',').map(item => item.trim());
  
  return (
    <div className="chocolate-detail-page">
      <div className="detail-header">
        <div className="container">
          <div className="detail-header-content">
            <div className="detail-image">
              <img 
                src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'} 
                alt={chocolate.name} 
              />
            </div>
            <div className="detail-info">
              <h1>{chocolate.name}</h1>
              <p className="maker">{chocolate.maker}</p>
              
              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">{(chocolate.averageRating || 0).toFixed(1)}</span>
                  <RatingStars rating={chocolate.averageRating || 0} size="large" />
                  <span className="rating-count">({chocolate.reviewCount || 0} ratings)</span>
                </div>
                
                <div className="user-rating">
                  <p>Your Rating:</p>
                  <RatingStars 
                    rating={userRating} 
                    size="large" 
                    interactive={true}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              </div>
              
              <div className="chocolate-meta">
                <div className="meta-item">
                  <span className="meta-label">Origin</span>
                  <span className="meta-value">{chocolate.origin || 'Various'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Cacao</span>
                  <span className="meta-value">{chocolate.cacaoPercentage || 0}%</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Type</span>
                  <span className="meta-value">{chocolate.type || 'N/A'}</span>
                </div>
              </div>
              
              {chocolate.tags && chocolate.tags.length > 0 && (
                <div className="chocolate-tags">
                  {chocolate.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <section className="description-section">
          <h2>Description</h2>
          <p>{chocolate.description || 'No description available.'}</p>
        </section>
        
        <section className="flavor-section">
          <h2>Flavor Profile</h2>
          <div className="flavor-list">
            {flavorProfile.map(flavor => (
              <div key={flavor.name} className="flavor-item">
                <span className="flavor-name">{flavor.name}</span>
                <div className="flavor-bar">
                  <div 
                    className="flavor-level" 
                    style={{ width: `${(flavor.intensity || 0) * 20}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="ingredients-section">
          <h2>Ingredients</h2>
          {ingredients.length > 0 ? (
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p>Ingredients information not available.</p>
          )}
        </section>
        
        {chocolate.nutritionalInfo && (
          <section className="nutrition-section">
            <h2>Nutritional Information</h2>
            <div className="nutrition-info">
              {Object.entries(chocolate.nutritionalInfo).map(([key, value]) => (
                <div className="nutrition-item" key={key}>
                  <span className="nutrition-label">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="nutrition-value">
                    {typeof value === 'number' ? value + (key.includes('calories') ? '' : 'g') : value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        
        <section className="reviews-section">
          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this chocolate!</p>
          )}
          
          <div className="add-review">
            <h3>Add Your Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <textarea 
                placeholder="Share your thoughts on this chocolate..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="submit-review">
                Submit Review
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;