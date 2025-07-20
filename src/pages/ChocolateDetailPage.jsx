// src/pages/ChocolateDetailPage.jsx - SEO OPTIMIZED VERSION
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChocolateById } from '../services/chocolateFirebaseService';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import FavoriteButton from '../components/FavoriteButton';
import WantToTryButton from '../components/WantToTryButton';
import SEO from '../components/SEO'; // ADD THIS IMPORT
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

  // SEO HELPER FUNCTIONS
  const generateSEOData = () => {
    if (!chocolate) return {};

    // Calculate average rating from reviews
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : chocolate.averageRating || 0;

    // Generate comprehensive title for SEO
    const seoTitle = `${chocolate.name} by ${chocolate.maker} - ${chocolate.cacaoPercentage}% Chocolate`;
    
    // Generate rich meta description
    const seoDescription = generateMetaDescription(averageRating);
    
    // Generate targeted keywords
    const seoKeywords = generateKeywords();

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
      rating: averageRating,
      reviewCount: reviews.length
    };
  };

  const generateMetaDescription = (avgRating) => {
    if (!chocolate) return '';

    const parts = [];
    
    // Core product info
    parts.push(`${chocolate.name} by ${chocolate.maker} chocolate review`);
    
    // Add rating and social proof
    if (reviews.length > 0) {
      parts.push(`Rated ${avgRating.toFixed(1)}/5 stars by ${reviews.length} chocolate lover${reviews.length !== 1 ? 's' : ''}`);
    }
    
    // Add key product details
    const details = [];
    if (chocolate.cacaoPercentage) details.push(`${chocolate.cacaoPercentage}% cacao`);
    if (chocolate.type) details.push(`${chocolate.type.toLowerCase()} chocolate`);
    if (chocolate.origin) details.push(`from ${chocolate.origin}`);
    
    if (details.length > 0) {
      parts.push(`This ${details.join(', ')} offers exceptional quality`);
    }
    
    // Call to action with buying intent
    parts.push('Read detailed tasting notes, compare prices, and see why chocolate enthusiasts recommend this bar');
    
    return parts.join('. ') + '.';
  };

  const generateKeywords = () => {
    if (!chocolate) return '';

    const keywords = new Set();
    
    // Core product keywords (high search volume)
    keywords.add(chocolate.name);
    keywords.add(`${chocolate.name} review`);
    keywords.add(`${chocolate.name} rating`);
    keywords.add(`${chocolate.name} chocolate`);
    keywords.add(`${chocolate.name} bar`);
    
    // Maker keywords (brand searches)
    keywords.add(chocolate.maker);
    keywords.add(`${chocolate.maker} chocolate`);
    keywords.add(`${chocolate.maker} ${chocolate.name}`);
    keywords.add(`best ${chocolate.maker} chocolate`);
    
    // Category keywords (high intent)
    if (chocolate.type) {
      keywords.add(`${chocolate.type.toLowerCase()} chocolate`);
      keywords.add(`best ${chocolate.type.toLowerCase()} chocolate`);
      keywords.add(`${chocolate.type.toLowerCase()} chocolate review`);
      keywords.add(`premium ${chocolate.type.toLowerCase()} chocolate`);
    }
    
    // Percentage keywords (very specific searches)
    if (chocolate.cacaoPercentage) {
      keywords.add(`${chocolate.cacaoPercentage}% chocolate`);
      keywords.add(`${chocolate.cacaoPercentage}% cacao`);
      keywords.add(`${chocolate.cacaoPercentage} percent chocolate`);
      keywords.add(`${chocolate.cacaoPercentage}% dark chocolate`);
    }
    
    // Origin keywords (terroir searches)
    if (chocolate.origin) {
      keywords.add(`${chocolate.origin} chocolate`);
      keywords.add(`chocolate from ${chocolate.origin}`);
      keywords.add(`${chocolate.origin} cacao`);
      keywords.add(`single origin ${chocolate.origin}`);
    }
    
    // Buying intent keywords (high conversion)
    keywords.add(`buy ${chocolate.name}`);
    keywords.add(`${chocolate.name} price`);
    keywords.add(`where to buy ${chocolate.name}`);
    keywords.add(`${chocolate.name} online`);
    keywords.add(`order ${chocolate.name}`);
    
    // Comparison keywords (competitive)
    keywords.add(`${chocolate.name} vs`);
    keywords.add(`chocolate like ${chocolate.name}`);
    keywords.add(`similar to ${chocolate.name}`);
    keywords.add(`${chocolate.maker} comparison`);
    
    // General chocolate keywords
    keywords.add('chocolate review');
    keywords.add('chocolate rating');
    keywords.add('chocolate tasting notes');
    keywords.add('premium chocolate');
    keywords.add('artisan chocolate');

    return Array.from(keywords).join(', ');
  };
  
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

  const handleQuickReview = async (reviewData) => {
    try {
      const reviewToSubmit = {
        chocolateId: reviewData.chocolateId,
        userId: currentUser.uid,
        rating: reviewData.rating,
        text: reviewData.text || '',
        user: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || null,
        helpful: 0,
        createdAt: new Date(),
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
        {/* SEO for error page */}
        <SEO 
          title="Chocolate Not Found" 
          description="The chocolate you're looking for could not be found. Browse our collection of premium chocolates with reviews and ratings."
          url={`/chocolate/${id}`}
        />
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

  // Calculate average rating for display
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : chocolate.averageRating || 0;

  // Generate SEO data
  const seoData = generateSEOData();

  return (
    <div className="chocolate-detail-page">
      {/* DYNAMIC SEO COMPONENT */}
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`/chocolate/${chocolate.id}`}
        chocolateName={chocolate.name}
        rating={seoData.rating}
        reviewCount={seoData.reviewCount}
        type="product"
      />

      <div className="detail-header">
        <div className="container">
          <div className="detail-header-content">
            <div className="detail-image">
              <img 
                src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'} 
                alt={`${chocolate.name} by ${chocolate.maker} - ${chocolate.cacaoPercentage}% chocolate bar`}
              />
            </div>
            <div className="detail-info">
              {/* SEO-OPTIMIZED MAKER LINK */}
              <Link 
                to={`/maker?maker=${encodeURIComponent(chocolate.maker || 'Unknown Maker')}`}
                className="maker-link-prominent"
              >
                <h2 className="maker-name-prominent">{chocolate.maker || 'Unknown Maker'}</h2>
              </Link>

              {/* SEO-OPTIMIZED H1 TITLE */}
              <h1 className="chocolate-name">
                {chocolate.name}
              </h1>
              
              {/* SEO-RICH SUBTITLE */}
              <h2 className="chocolate-subtitle">
                Premium {chocolate.type} Chocolate 
                {chocolate.origin && ` from ${chocolate.origin}`}
                {chocolate.cacaoPercentage && ` - ${chocolate.cacaoPercentage}% Cacao`}
              </h2>
              
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

              {/* SEO-ENHANCED RATING SECTION */}
              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  <RatingStars rating={averageRating} />
                  <span className="rating-count">
                    ({reviews.length} customer review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
                {/* Add schema-friendly rating text */}
                <div className="rating-summary-text">
                  {reviews.length > 0 && (
                    <p className="rating-description">
                      Based on {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}, 
                      {chocolate.name} receives an average rating of {averageRating.toFixed(1)} out of 5 stars.
                    </p>
                  )}
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
                  <h3>Popular Chocolate Tags</h3>
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
        {/* SEO-ENHANCED DESCRIPTION - Only show if no description in header */}
        {chocolate.description && !(chocolate.description || chocolate.details || chocolate.subtitle) && (
          <section className="description-section">
            <h3>About {chocolate.name} by {chocolate.maker}</h3>
            <p className="description">
              {chocolate.description}
              {chocolate.origin && ` This exceptional ${chocolate.type?.toLowerCase()} chocolate is crafted from ${chocolate.origin} cacao beans.`}
              {chocolate.cacaoPercentage && ` At ${chocolate.cacaoPercentage}% cacao content, it offers ${
                chocolate.cacaoPercentage >= 80 ? 'an intense, complex flavor profile' :
                chocolate.cacaoPercentage >= 70 ? 'a perfect balance of richness and sweetness' :
                'smooth, approachable flavors'
              }.`}
            </p>
          </section>
        )}

        {/* SEO-ENHANCED INGREDIENTS SECTION */}
        <section className="ingredients-section">
          <h3>Ingredients in {chocolate.name}</h3>
          {ingredients.length > 0 ? (
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p>Complete ingredient information for {chocolate.name} by {chocolate.maker} is being updated. 
               Contact us for specific ingredient details.</p>
          )}
        </section>
        
        {/* Nutritional Information */}
        {chocolate.nutritionalInfo && (
          <section className="nutrition-section">
            <h3>Nutritional Information for {chocolate.name}</h3>
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
        
        {/* SEO-ENHANCED REVIEWS SECTION */}
        <section className="reviews-section">
          <h3>Customer Reviews for {chocolate.name} ({reviews.length})</h3>
          
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
              <h4>Be the First to Review {chocolate.name}</h4>
              <p>Share your experience with {chocolate.name} by {chocolate.maker}. 
                 Help other chocolate lovers discover this {chocolate.cacaoPercentage}% {chocolate.type?.toLowerCase()} chocolate.</p>
              {!currentUser && (
                <p><Link to="/login">Sign in</Link> to write the first review of {chocolate.name}.</p>
              )}
            </div>
          )}
        </section>

        {/* COMING SOON: WHERE TO BUY SECTION */}
        <section className="buying-guide-section">
          <h3>Where to Buy {chocolate.name}</h3>
          <div className="coming-soon-notice">
            <p>
              <strong>🚀 Coming Soon:</strong> We're building an integrated shopping experience to help you 
              find the best prices for {chocolate.name} by {chocolate.maker} across trusted retailers.
            </p>
            <p>
              Our upcoming price comparison tool will show real-time availability and pricing for this 
              premium {chocolate.cacaoPercentage}% {chocolate.type?.toLowerCase()} chocolate from multiple sources, 
              including specialty chocolate shops, online retailers, and direct from {chocolate.maker}.
            </p>
          </div>
          
          <div className="current-options">
            <h4>Current Shopping Options:</h4>
            <ul>
              <li><strong>Specialty Chocolate Retailers:</strong> Visit local gourmet food stores and chocolate boutiques</li>
              <li><strong>Online Gourmet Stores:</strong> Check premium food retailers for {chocolate.name}</li>
              <li><strong>Direct from Maker:</strong> Purchase directly from {chocolate.maker}'s official website</li>
              <li><strong>Artisan Food Markets:</strong> Look for {chocolate.name} at farmer's markets and food festivals</li>
            </ul>
          </div>
          
          <div className="alternatives">
            <p>
              <strong>Looking for similar chocolates?</strong> While we prepare our shopping integration, 
              explore other {chocolate.cacaoPercentage}% chocolates
              {chocolate.origin && ` or premium chocolates from ${chocolate.origin}`} 
              in our <Link to="/browse">chocolate database</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;