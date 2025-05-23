// src/pages/ChocolateDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import './ChocolateDetailPage.css';
import { useAuth } from '../contexts/AuthContext';
import { addReview } from '../services/reviewService';

function ChocolateDetailPage() {
  const { id } = useParams();
  const [chocolate, setChocolate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const { currentUser } = useAuth();
  
  // Function to fetch reviews
  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('chocolateId', '==', id),
        orderBy('createdAt', 'desc')
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    const fetchChocolateData = async () => {
      try {
        setLoading(true);
        
        // Fetch chocolate details
        const docRef = doc(db, 'chocolates', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError('Chocolate not found');
          setLoading(false);
          return;
        }
        
        const chocolateData = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        console.log('Chocolate data received:', chocolateData); // Fixed: using chocolateData instead of data
        setChocolate(chocolateData);
        
        // Fetch tags if the chocolate has tagIds
        if (chocolateData.tagIds && chocolateData.tagIds.length > 0) {
          const tagNames = [];
          for (const tagId of chocolateData.tagIds) {
            try {
              const tagDoc = await getDoc(doc(db, 'tags', tagId));
              if (tagDoc.exists()) {
                tagNames.push(tagDoc.data().name);
              }
            } catch (err) {
              console.error("Error fetching tag:", err);
            }
          }
          setTags(tagNames);
        }
        
        // Fetch reviews
        await fetchReviews();
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chocolate details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChocolateData();
  }, [id]);

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
    
    if (!reviewText.trim()) {
      alert('Please write a review');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the review data
      const reviewData = {
        chocolateId: id,
        userId: currentUser.uid,
        user: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || null,
        rating: userRating,
        text: reviewText,
        chocolate: {
          id: chocolate.id,
          name: chocolate.name,
          maker: chocolate.maker,
          imageUrl: chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
        }
      };
      
      // Add the review to Firestore
      await addReview(reviewData);
      
      // Show success message
      setReviewSuccess(true);
      
      // Reset form
      setUserRating(0);
      setReviewText('');
      
      // Refresh reviews list
      await fetchReviews();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Error submitting review: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
    return <div className="error">Error: {error || 'Chocolate not found'}</div>;
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
    : (typeof chocolate.ingredients === 'string' 
        ? chocolate.ingredients.split(',').map(item => item.trim())
        : []);
  
        return (
          <div className="chocolate-detail-page">
            <div className="detail-header">
              <div className="container">
                <div className="detail-header-content">
                  <div className="detail-image">
                    <img 
                      src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'} 
                      alt={chocolate.name} 
                      className="chocolate-label-image"
                    />
                    <div className="image-caption">Product Label</div>
                  </div>
                  <div className="detail-info">
                    <h1>{chocolate.name}</h1>
                    {/* Make the maker name a clickable link */}
                    <p className="maker">
                      <Link to={`/search?query=${encodeURIComponent(chocolate.maker)}`} className="maker-link">
                        {chocolate.maker}
                      </Link>
                    </p>
              
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
              
              {tags.length > 0 && (
                <div className="chocolate-tags">
                  {tags.map(tag => (
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
            {reviewSuccess && (
              <div className="review-success">
                Your review has been submitted successfully!
              </div>
            )}
            <form onSubmit={handleReviewSubmit}>
              <textarea 
                placeholder="Share your thoughts on this chocolate..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              ></textarea>
              <button 
                type="submit" 
                className="submit-review"
                disabled={!currentUser || loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;