// src/pages/ChocolateDetailPage.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChocolateById } from '../services/chocolateFirebaseService';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import FavoriteButton from '../components/FavoriteButton';
import WantToTryButton from '../components/WantToTryButton';
import './ChocolateDetailPage.css';
import { useAuth } from '../contexts/AuthContext';
import { addReview } from '../services/reviewService';
import QuickReviewCTA from '../components/QuickReviewCTA';

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
        const chocolateData = await getChocolateById(id);
        setChocolate(chocolateData);
        
        // Fetch reviews
        await fetchReviews();
        
        // Fetch tags if available
        if (chocolateData?.tags) {
          setTags(chocolateData.tags);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chocolate details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (id) {
      fetchChocolateData();
    }
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
      const reviewData = {
        chocolateId: id,
        userId: currentUser.uid,
        user: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || null,
        rating: userRating,
        text: reviewText.trim(),
        helpful: 0,
        chocolate: {
          id: chocolate.id,
          name: chocolate.name,
          maker: chocolate.maker,
          imageUrl: chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
        }
      };
      await addReview(reviewData);
      
      // Reset form and refresh reviews
      setUserRating(0);
      setReviewText('');
      setReviewSuccess(true);
      await fetchReviews();
      
      // Hide success message after 3 seconds
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  // COMMENTED OUT QUICK REVIEW FUNCTION FOR NOW
  
  const handleQuickReview = async (reviewData) => {
    try {
      const reviewToSubmit = {
        chocolateId: reviewData.chocolateId,
        userId: currentUser.uid,  // This is what your rules check for
        rating: reviewData.rating,
        text: reviewData.text || '',
        // Add ALL the required fields that your regular reviews have:
        user: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || null,
        helpful: 0,
        createdAt: new Date(), // Make sure this is included
        chocolate: {
          id: chocolate.id,
          name: chocolate.name,
          maker: chocolate.maker,
          imageUrl: chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
        }
      };
  

      await addReview(reviewToSubmit);
      
      setReviewSuccess(true);
      await fetchReviews();
      
      setTimeout(() => setReviewSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };
  

  // Check if user has already reviewed this chocolate
  const userHasReviewed = reviews.some(review => 
    review.userId === currentUser?.uid
  );
  
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
        <div className="container">
          <div className="error-message">
            <h1>Chocolate Not Found</h1>
            <p>Sorry, we couldn't find the chocolate you're looking for.</p>
            <Link to="/browse" className="btn btn-primary">Browse All Chocolates</Link>
          </div>
        </div>
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
    : chocolate.ingredients 
      ? chocolate.ingredients.split(',').map(i => i.trim()) 
      : [];

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
              {/* Maker name - clickable and prominent */}
              <Link 
                to={`/maker?maker=${encodeURIComponent(chocolate.maker || 'Unknown Maker')}`}
                className="maker-link-prominent"
              >
                <h2 className="maker-name-prominent">{chocolate.maker || 'Unknown Maker'}</h2>
              </Link>
              
              
            
              

              {/* Chocolate name */}
              <h1 className="chocolate-name">{chocolate.name}</h1>
              
              {/* Origin and Cacao percentage */}
              <div className="chocolate-specs">
                <span className="origin">{chocolate.origin || 'Origin Unknown'}</span>
                <span className="percentage">{chocolate.cacaoPercentage || 0}% Cacao</span>
                {chocolate.type && <span className="type">{chocolate.type}</span>}
              </div>

              {/* Additional chocolate details - formatted nicely */}
              {(chocolate.description || chocolate.details || chocolate.subtitle) && (
                <div className="chocolate-details">
                  <span className="details-text">
                    {chocolate.description || chocolate.details || chocolate.subtitle}
                  </span>
                </div>
              )}              
              {/* Rating section */}
              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">{(chocolate.averageRating || 0).toFixed(1)}</span>
                  <RatingStars rating={chocolate.averageRating || 0} />
                  <span className="rating-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              </div>
              
              <QuickReviewCTA 
                chocolateId={chocolate.id}
                chocolateName={chocolate.name}
                onQuickReview={handleQuickReview}
                hasUserReviewed={userHasReviewed}
                existingReview={userHasReviewed ? reviews.find(review => review.userId === currentUser?.uid) : null}
              />

              {/* Action buttons */}
              <div className="action-buttons">
                <FavoriteButton 
                  chocolateId={chocolate.id} 
                  size="large" 
                  className="detail-page-favorite"
                  showText={true}
                />
                
                <WantToTryButton 
                  chocolate={chocolate} 
                  currentUser={currentUser}
                  className="detail-page-want-to-try"
                  showText={true}
                  size="large"
                />
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="tags-section">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Description */}
        {chocolate.description && (
          <section className="description-section">
            <h2>About This Chocolate</h2>
            <p className="description">{chocolate.description}</p>
          </section>
        )}
        
        {/* Flavor Profile - TODO: Add back when user reviews are implemented */}
        {/* 
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
        */}

        
        {/* Ingredients */}
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
        
        {/* Nutritional Information */}
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
        
        {/* Reviews Section */}
        <section className="reviews-section">
          <h2>Reviews ({reviews.length})</h2>
          
          {/* Success message */}
          {reviewSuccess && (
            <div className="review-success-message">
              ✅ Your review has been added successfully!
            </div>
          )}
          
          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this chocolate!</p>
              {!currentUser && (
                <p><Link to="/login">Sign in</Link> to write the first review.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;