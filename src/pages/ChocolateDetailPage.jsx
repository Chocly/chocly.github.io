// src/pages/ChocolateDetailPage.jsx - UPDATED WITH MINIMALIST HEADER
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChocolateById } from '../services/chocolateFirebaseService';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import FavoriteButton from '../components/FavoriteButton';
import WantToTryButton from '../components/WantToTryButton';
import SEO from '../components/SEO';
import './ChocolateDetailPage.css';
import { useAuth } from '../contexts/AuthContext';
import { addReview } from '../services/reviewService';
import QuickReviewCTA from '../components/QuickReviewCTA';
import { formatReviewerName } from '../utils/nameFormatter';
import { isSuperAdmin } from '../config/adminConfig';

function ChocolateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      // Store the full name but display only first name + last initial
      const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User';
      
      const reviewData = {
        chocolateId: id,
        userId: currentUser.uid,
        user: fullName, // Keep full name in database for record
        userName: fullName, // Keep full name in database
        displayName: formatReviewerName(fullName), // Add formatted name for display
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
      const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User';
      
      const reviewToSubmit = {
        chocolateId: reviewData.chocolateId,
        userId: currentUser.uid,
        rating: reviewData.rating,
        text: reviewData.text || '',
        user: fullName, // Keep full name in database
        userName: fullName, // Keep full name in database  
        displayName: formatReviewerName(fullName), // Add formatted name for display
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
              
              {/* SUPER ADMIN EDIT BUTTON - Placed under the image */}
              {isSuperAdmin(currentUser) && (
                <button
                  onClick={() => navigate(`/chocolate/${chocolate.id}/edit`)}
                  className="super-admin-edit-btn"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '15px',
                    fontWeight: 'bold',
                    display: 'block',
                    width: '100%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  🛡️ Super Admin Edit
                </button>
              )}
            </div>
            
            <div className="detail-info">
              {/* MINIMALIST HEADER */}
              <div className="chocolate-header-minimal">
                {/* Maker Name - subtle and elegant */}
                <Link
                  to={`/maker?maker=${encodeURIComponent(chocolate.maker || 'Unknown Maker')}`}
                  className="maker-link-minimal"
                >
                  <span className="maker-name-minimal">{chocolate.maker || 'Unknown Maker'}</span>
                </Link>

                {/* Product Name - the hero */}
                <h1 className="chocolate-name-minimal">{chocolate.name}</h1>

                {/* Single unified characteristics section */}
                <div className="chocolate-characteristics">
                  {/* Core specs - non-clickable, just informative */}
                  <div className="spec-group">
                    {chocolate.origin && (
                      <span className="spec-item">
                        <span className="spec-label">Origin</span>
                        <span className="spec-value">{chocolate.origin}</span>
                      </span>
                    )}
                    {chocolate.cacaoPercentage && (
                      <span className="spec-item">
                        <span className="spec-label">Cacao</span>
                        <span className="spec-value">{chocolate.cacaoPercentage}%</span>
                      </span>
                    )}
                    {chocolate.type && (
                      <span className="spec-item">
                        <span className="spec-label">Type</span>
                        <span className="spec-value">{chocolate.type}</span>
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  {(chocolate.flavorNotes || tags.length > 0) && (
                    <div className="characteristics-divider">•</div>
                  )}

                  {/* Flavor notes - clickable but subtle */}
                  {(chocolate.flavorNotes || tags.length > 0) && (
                    <div className="flavor-group">
                      {chocolate.flavorNotes && chocolate.flavorNotes.slice(0, 3).map((note, index) => (
                        <button 
                          key={`note-${index}`}
                          className="flavor-note"
                          onClick={() => navigate(`/browse?flavor=${note}`)}
                          title={`Find more ${note} chocolates`}
                        >
                          {note}
                        </button>
                      ))}
                      {tags.slice(0, 2).map((tag, index) => (
                        <button 
                          key={`tag-${index}`}
                          className="flavor-note secondary"
                          onClick={() => navigate(`/browse?tag=${tag}`)}
                          title={`Find more ${tag} chocolates`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clean Rating Display */}
                <div className="rating-minimal">
                  <span className="rating-value">{averageRating.toFixed(1)}</span>
                  <RatingStars rating={averageRating} />
                  <span className="review-count-minimal">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {/* Description if present */}
                {(chocolate.description || chocolate.details || chocolate.subtitle) && (
                  <p className="chocolate-description-minimal">
                    {chocolate.description || chocolate.details || chocolate.subtitle}
                  </p>
                )}

                {/* Quick Review CTA */}
                <QuickReviewCTA
                  chocolateId={chocolate.id}
                  chocolateName={chocolate.name}
                  onQuickReview={handleQuickReview}
                  hasUserReviewed={userHasReviewed}
                  existingReview={userHasReviewed ? reviews.find(review => review.userId === currentUser?.uid) : null} 
                />

                {/* Action buttons */}
                <div className="action-buttons-minimal">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* REMOVED INGREDIENTS SECTION - As requested */}

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

        <section className="seo-section-collapsed">
          <h3>Where to Buy {chocolate.name}</h3>
          <p className="seo-summary">
            Find <span className="highlight">{chocolate.name}</span> at specialty chocolate shops, 
            gourmet food stores, and online retailers. 
            Available directly from {chocolate.maker}'s website or at local artisan markets.
          </p>
          <details className="seo-expandable">
            <summary>Shopping options & availability</summary>
            <div className="seo-expandable-content">
              <p><strong>🚀 Price comparison coming soon</strong> – We're building tools to help you find the best prices across retailers.</p>
              <ul>
                <li>Specialty chocolate boutiques</li>
                <li>Online gourmet retailers</li>
                <li>Direct from {chocolate.maker}</li>
                <li>Local farmer's markets</li>
              </ul>
              <p>
                Explore more{' '}
                <Link to={`/browse?cacao=${chocolate.cacaoPercentage}`}>
                  {chocolate.cacaoPercentage}% chocolates
                </Link>
                {chocolate.origin && (
                  <>
                    {' '}or{' '}
                    <Link to={`/browse?origin=${chocolate.origin}`}>
                      {chocolate.origin} chocolates
                    </Link>
                  </>
                )}
                {' '}in our database.
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}

export default ChocolateDetailPage;