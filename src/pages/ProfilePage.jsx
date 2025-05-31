// src/pages/ProfilePage.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews } from '../services/reviewService';
import { getFavoriteChocolates, removeFromFavorites } from '../services/userService';
import './ProfilePage.css';

// SVG Icons
const BadgeIcon = ({ name }) => {
  const badgeIcons = {
    'Newcomer': (
      <svg className="badge-icon newcomer" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H11V7H13V8H15V10H11V11H14A1,1 0 0,1 15,12V15A1,1 0 0,1 14,16H13V17H11Z" />
      </svg>
    ),
    'Reviewer': (
      <svg className="badge-icon reviewer" viewBox="0 0 24 24">
        <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
      </svg>
    ),
    'Enthusiast': (
      <svg className="badge-icon enthusiast" viewBox="0 0 24 24">
        <path d="M16,5V11H21V5M10,11H15V5H10M16,18H21V12H16M10,18H15V12H10M4,18H9V12H4M4,11H9V5H4V11Z" />
      </svg>
    ),
    'Connoisseur': (
      <svg className="badge-icon connoisseur" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z" />
      </svg>
    )
  };

  return badgeIcons[name] || null;
};

function ProfilePage() {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load reviews and favorites in parallel
        const [userReviews, userFavorites] = await Promise.all([
          getUserReviews(currentUser.uid),
          getFavoriteChocolates(currentUser.uid)
        ]);
        
        setReviews(userReviews);
        setFavorites(userFavorites);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Calculate user statistics
  const calculateStats = () => {
    if (!userProfile) return {
      totalReviews: 0,
      totalTasted: 0,
      averageRating: 0,
      favoriteType: 'None yet',
      favoriteMaker: 'None yet'
    };

    // Basic stats
    const totalReviews = reviews.length;
    const totalTasted = reviews.length;
    
    // Calculate average rating given by user
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    // Find most reviewed type
    const typeCount = {};
    reviews.forEach(review => {
      if (review.chocolate && review.chocolate.type) {
        const type = review.chocolate.type;
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    });
    
    let favoriteType = 'None yet';
    let maxCount = 0;
    
    Object.entries(typeCount).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteType = type;
      }
    });
    
    // Find top maker
    const makerCount = {};
    reviews.forEach(review => {
      if (review.chocolate && review.chocolate.maker) {
        const maker = review.chocolate.maker;
        makerCount[maker] = (makerCount[maker] || 0) + 1;
      }
    });
    
    let favoriteMaker = 'None yet';
    maxCount = 0;
    
    Object.entries(makerCount).forEach(([maker, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteMaker = maker;
      }
    });
    
    return {
      totalReviews,
      totalTasted,
      averageRating,
      favoriteType,
      favoriteMaker
    };
  };

  // Calculate badges
  const getBadges = () => {
    if (!userProfile) return ['Newcomer'];
    
    // Default badges - in a real app, these would be calculated based on activity
    const badges = userProfile.badges || ['Newcomer'];
    
    return badges;
  };

  // Handle removing favorites
  const handleRemoveFavorite = async (chocolateId) => {
    try {
      await removeFromFavorites(currentUser.uid, chocolateId);
      // Refresh favorites list
      const updatedFavorites = await getFavoriteChocolates(currentUser.uid);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing favorite. Please try again.');
    }
  };

  const stats = calculateStats();
  const badges = getBadges();

  // Show login prompt if not logged in
  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-logged-in">
            <h2>You need to sign in</h2>
            <p>Please log in or create an account to view your profile.</p>
            <div className="auth-buttons">
             <Link to="/login" className="auth-button">Log In</Link>
              <Link to="/signup" className="auth-button signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user profile
  if (!userProfile) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-logged-in">
            <h2>Profile Not Found</h2>
            <p>We couldn't load your profile. Please try refreshing the page.</p>
            <div className="auth-buttons">
             <Link to="/login" className="auth-button">Log In</Link>
              <Link to="/signup" className="auth-button signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-main">
            <div className="profile-avatar">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {userProfile.displayName ? userProfile.displayName.charAt(0) : 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{userProfile.displayName || 'User'}</h1>
              <p className="member-since">
                Member since {userProfile.createdAt?.toDate().toLocaleDateString() || 'Recently'}
              </p>
              <div className="profile-badges">
                {badges.map(badge => (
                  <div className="badge" key={badge}>
                    <BadgeIcon name={badge} />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="edit-profile-button">Edit Profile</button>
          </div>
        </div>

        {/* Profile Navigation */}
        <div className="profile-nav">
          <button 
            className={`profile-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`profile-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            className={`profile-nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favorites.length})
          </button>
          <button 
            className={`profile-nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-section">
                <h2>Your Chocolate Journey</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalTasted}</div>
                    <div className="stat-label">Chocolates Tasted</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalReviews}</div>
                    <div className="stat-label">Reviews Written</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{favorites.length}</div>
                    <div className="stat-label">Favorites</div>
                  </div>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Your Taste Profile</h3>
                  </div>
                  <div className="taste-profile">
                    <div className="taste-item">
                      <span className="taste-label">Favorite Chocolate Type:</span>
                      <span className="taste-value">{stats.favoriteType}</span>
                    </div>
                    <div className="taste-item">
                      <span className="taste-label">Favorite Maker:</span>
                      <span className="taste-value">{stats.favoriteMaker}</span>
                    </div>
                    <div className="taste-item">
                      <span className="taste-label">Top Flavor Notes:</span>
                      <span className="taste-value">
                        {userProfile.preferences?.flavorPreferences?.length > 0 
                          ? userProfile.preferences.flavorPreferences.join(', ') 
                          : 'Not specified yet'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="section-header">
                    <h3>Recent Activity</h3>
                  </div>
                  {reviews.length > 0 ? (
                    <div className="recent-reviews">
                      {reviews.slice(0, 3).map(review => (
                        <div className="recent-review" key={review.id}>
                          <Link to={`/chocolate/${review.chocolate?.id || review.chocolateId}`} className="review-chocolate">
                            <img 
                              src={review.chocolate?.imageUrl || 'https://placehold.co/50x50?text=🍫'} 
                              alt={review.chocolate?.name || 'Chocolate'} 
                            />
                            <div className="review-chocolate-info">
                              <h4>{review.chocolate?.name || 'Unknown Chocolate'}</h4>
                              <p>{review.chocolate?.maker || 'Unknown Maker'}</p>
                            </div>
                          </Link>
                          <div className="review-content">
                            <div className="review-rating">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                              ))}
                              <span className="review-date">
                                {review.createdAt?.toDate ? 
                                  review.createdAt.toDate().toLocaleDateString() : 
                                  'Recently'
                                }
                              </span>
                            </div>
                            <p className="review-text">
                              {review.text ? 
                                (review.text.length > 120 ? `${review.text.substring(0, 120)}...` : review.text) : 
                                'No review text'
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setActiveTab('reviews')} 
                        className="see-all-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        See all reviews
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>You haven't written any reviews yet.</p>
                      <Link to="/browse" className="action-button">Discover Chocolates to Review</Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="recommendations-section">
                <div className="section-header">
                  <h3>Recommended For You</h3>
                </div>
                <div className="recommendation-message">
                  <p>Keep reviewing chocolates to get personalized recommendations based on your taste preferences!</p>
                  <Link to="/browse" className="action-button">Browse Chocolates</Link>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="section-header">
                <h2>Your Reviews</h2>
              </div>
              
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div className="review-card" key={review.id}>
                      <div className="review-card-header">
                        <Link to={`/chocolate/${review.chocolate?.id || review.chocolateId}`} className="review-chocolate">
                          <img 
                            src={review.chocolate?.imageUrl || 'https://placehold.co/50x50?text=🍫'} 
                            alt={review.chocolate?.name || 'Chocolate'} 
                          />
                          <div className="review-chocolate-info">
                            <h3>{review.chocolate?.name || 'Unknown Chocolate'}</h3>
                            <p>{review.chocolate?.maker || 'Unknown Maker'}</p>
                          </div>
                        </Link>
                        <div className="review-meta">
                          <div className="review-rating-large">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                            ))}
                          </div>
                          <div className="review-date">
                            {review.createdAt?.toDate ? 
                              review.createdAt.toDate().toLocaleDateString() : 
                              'Recently'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="review-card-body">
                        <p className="review-text">{review.text || 'No review text'}</p>
                      </div>
                      <div className="review-card-actions">
                        <button className="edit-review">Edit</button>
                        <button className="delete-review">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't written any reviews yet.</p>
                  <Link to="/browse" className="action-button">Discover Chocolates to Review</Link>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              <div className="section-header">
                <h2>Your Favorite Chocolates</h2>
              </div>
              
              {favorites.length > 0 ? (
                <div className="favorites-grid">
                  {favorites.map(chocolate => (
                    <div className="favorite-card" key={chocolate.id}>
                      <Link to={`/chocolate/${chocolate.id}`} className="favorite-link">
                        <div className="favorite-image">
                          <img 
                            src={chocolate.imageUrl || 'https://placehold.co/300x300?text=🍫'} 
                            alt={chocolate.name || 'Chocolate'} 
                          />
                        </div>
                        <div className="favorite-info">
                          <h3>{chocolate.name || 'Unknown Chocolate'}</h3>
                          <p>{chocolate.maker || 'Unknown Maker'}</p>
                          <div className="favorite-details">
                            <span>{chocolate.type || 'Unknown Type'}</span>
                            <span>{chocolate.cacaoPercentage || 0}% Cacao</span>
                          </div>
                          <div className="favorite-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`star ${star <= (chocolate.averageRating || 0) ? 'filled' : ''}`}>★</span>
                            ))}
                            <span className="rating-count">({chocolate.ratings || chocolate.reviewCount || 0})</span>
                          </div>
                        </div>
                      </Link>
                      <button 
                        className="remove-favorite"
                        onClick={() => handleRemoveFavorite(chocolate.id)}
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't added any favorites yet.</p>
                  <p>Click the heart ❤️ button on chocolates you love to save them here!</p>
                  <Link to="/browse" className="action-button">Discover Chocolates</Link>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="preferences-tab">
              <div className="section-header">
                <h2>Taste Preferences</h2>
              </div>
              
              <form className="preferences-form">
                <div className="preference-section">
                  <h3>Chocolate Types You Enjoy</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Dark') || false} 
                        onChange={() => {}} 
                      />
                      Dark Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Milk') || false} 
                        onChange={() => {}} 
                      />
                      Milk Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('White') || false} 
                        onChange={() => {}} 
                      />
                      White Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Single Origin') || false} 
                        onChange={() => {}} 
                      />
                      Single Origin
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Flavored') || false} 
                        onChange={() => {}} 
                      />
                      Flavored/Infused
                    </label>
                  </div>
                </div>
                
                <div className="preference-section">
                  <h3>Flavor Notes You Prefer</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Fruity') || false} 
                        onChange={() => {}} 
                      />
                      Fruity
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Nutty') || false} 
                        onChange={() => {}} 
                      />
                      Nutty
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Floral') || false} 
                        onChange={() => {}} 
                      />
                      Floral
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Spicy') || false} 
                        onChange={() => {}} 
                      />
                      Spicy
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Earthy') || false} 
                        onChange={() => {}} 
                      />
                      Earthy
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Caramel') || false} 
                        onChange={() => {}} 
                      />
                      Caramel
                    </label>
                  </div>
                </div>
                
                <div className="preference-section">
                  <h3>Dietary Preferences</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Dairy-Free') || false} 
                        onChange={() => {}} 
                      />
                      Dairy-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Vegan') || false} 
                        onChange={() => {}} 
                      />
                      Vegan
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Gluten-Free') || false} 
                        onChange={() => {}} 
                      />
                      Gluten-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Nut-Free') || false} 
                        onChange={() => {}} 
                      />
                      Nut-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Sugar-Free') || false} 
                        onChange={() => {}} 
                      />
                      Sugar-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Fair Trade') || false} 
                        onChange={() => {}} 
                      />
                      Fair Trade
                    </label>
                  </div>
                </div>
                
                <button type="submit" className="save-preferences">Save Preferences</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;