import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChocolateById } from '../services/chocolateService';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import './ChocolateDetailPage.css';

function ChocolateDetailPage() {
  const { id } = useParams();
  const [chocolate, setChocolate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  
  useEffect(() => {
    const fetchChocolate = async () => {
      try {
        setLoading(true);
        const data = await getChocolateById(id);
        setChocolate(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChocolate();
  }, [id]);
  
  const handleRatingChange = (rating) => {
    setUserRating(rating);
    // In a real app, this would save the rating to the backend
  };
  
  if (loading) {
    return <div className="loading">Loading chocolate details...</div>;
  }
  
  if (error || !chocolate) {
    return <div className="error">Error: {error || 'Chocolate not found'}</div>;
  }
  
  return (
    <div className="chocolate-detail-page">
      <div className="detail-header">
        <div className="container">
          <div className="detail-header-content">
            <div className="detail-image">
              <img src={chocolate.imageUrl} alt={chocolate.name} />
            </div>
            <div className="detail-info">
              <h1>{chocolate.name}</h1>
              <p className="maker">{chocolate.maker}</p>
              
              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">{chocolate.averageRating.toFixed(1)}</span>
                  <RatingStars rating={chocolate.averageRating} size="large" />
                  <span className="rating-count">({chocolate.ratings} ratings)</span>
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
                  <span className="meta-value">{chocolate.origin}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Cacao</span>
                  <span className="meta-value">{chocolate.cacaoPercentage}%</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Type</span>
                  <span className="meta-value">{chocolate.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <section className="flavor-section">
          <h2>Flavor Profile</h2>
          <div className="flavor-list">
            {chocolate.flavorProfile.map(flavor => (
              <div key={flavor.name} className="flavor-item">
                <span className="flavor-name">{flavor.name}</span>
                <div className="flavor-bar">
                  <div 
                    className="flavor-level" 
                    style={{ width: `${flavor.intensity * 20}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="description-section">
          <h2>Description</h2>
          <p>{chocolate.description}</p>
        </section>
        
        <section className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {chocolate.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </section>
        
        <section className="nutrition-section">
          <h2>Nutritional Information</h2>
          <div className="nutrition-info">
            <div className="nutrition-item">
              <span className="nutrition-label">Serving Size</span>
              <span className="nutrition-value">{chocolate.nutritionalInfo.servingSize}</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">{chocolate.nutritionalInfo.calories}</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Fat</span>
              <span className="nutrition-value">{chocolate.nutritionalInfo.fat}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Sugar</span>
              <span className="nutrition-value">{chocolate.nutritionalInfo.sugar}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">{chocolate.nutritionalInfo.protein}g</span>
            </div>
          </div>
        </section>
        
        <section className="reviews-section">
          <h2>Reviews</h2>
          <div className="reviews-list">
            {chocolate.reviews.map(review => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
          
          <div className="add-review">
            <h3>Add Your Review</h3>
            <textarea placeholder="Share your thoughts on this chocolate..."></textarea>
            <button className="submit-review">Submit Review</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;