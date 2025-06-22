// src/pages/ProfilePage.jsx - COMPLETE VERSION WITH ALL FEATURES
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews } from '../services/reviewService';
import { getFavoriteChocolates, removeFromFavorites } from '../services/userService';
import './ProfilePage.css';

// SVG Icons - Complete BadgeIcon component
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
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false); // FIXED: Don't start as true
  const [preferences, setPreferences] = useState({
    favoriteTypes: [],
    dietaryRestrictions: [],
    flavorPreferences: []
  });
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🔍 ProfilePage Debug:');
    console.log('Auth loading:', authLoading);
    console.log('Current user:', currentUser?.uid || 'None');
    console.log('User profile:', userProfile ? 'Exists' : 'None');
  }, [authLoading, currentUser, userProfile]);

  // FIXED: Better data loading logic
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser || authLoading) {
        return;
      }

      try {
        setLoading(true);
        console.log('Loading user data for:', currentUser.uid);
        
        // Load reviews and favorites in parallel
        const [userReviews, userFavorites] = await Promise.all([
          getUserReviews(currentUser.uid).catch(err => {
            console.warn('Failed to load reviews:', err);
            return []; // Return empty array on error
          }),
          getFavoriteChocolates(currentUser.uid).catch(err => {
            console.warn('Failed to load favorites:', err);
            return []; // Return empty array on error
          })
        ]);
        
        console.log('Loaded reviews:', userReviews.length);
        console.log('Loaded favorites:', userFavorites.length);
        
        setReviews(userReviews);
        setFavorites(userFavorites);

        // Load preferences from userProfile
        if (userProfile?.preferences) {
          setPreferences(userProfile.preferences);
        }
        
      } catch (error) {
        console.error("Error loading user data:", error);
        // Don't throw error, just log it
      } finally {
        setLoading(false);
      }
    };

    // Only load data if we have a current user and auth is not loading
    if (currentUser && !authLoading) {
      loadUserData();
    }
  }, [currentUser, authLoading, userProfile]);

  // Calculate user statistics - COMPLETE VERSION
  const calculateStats = () => {
    if (!userProfile) return {
      totalReviews: 0,
      totalTasted: 0,
      averageRating: 0,
      favoriteType: 'None yet',
      favoriteMaker: 'None yet'
    };

    const totalReviews = reviews.length;
    const totalTasted = reviews.length;
    
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews 
      : 0;
    
    // Calculate favorite type
    const typeCount = {};
    reviews.forEach(review => {
      if (review.chocolate?.type) {
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
    
    // Calculate favorite maker
    const makerCount = {};
    reviews.forEach(review => {
      if (review.chocolate?.maker) {
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

  // Calculate badges - COMPLETE VERSION
  const getBadges = () => {
    if (!userProfile) return ['Newcomer'];
    
    const badges = ['Newcomer'];
    const reviewCount = reviews.length;
    
    if (reviewCount >= 5) badges.push('Reviewer');
    if (reviewCount >= 15) badges.push('Enthusiast');
    if (reviewCount >= 50) badges.push('Connoisseur');
    
    return badges;
  };

  // Handle removing favorites - COMPLETE VERSION
  const handleRemoveFavorite = async (chocolateId) => {
    try {
      await removeFromFavorites(currentUser.uid, chocolateId);
      const updatedFavorites = await getFavoriteChocolates(currentUser.uid);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing favorite. Please try again.');
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const savePreferences = async () => {
    try {
      // In a real app, you would save preferences to Firestore
      console.log('Saving preferences:', preferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    }
  };

  // FIXED: Better conditional rendering
  if (!authLoading && !currentUser) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-logged-in">
            <h2>You need to sign in</h2>
            <p>Please log in or create an account to view your profile.</p>
            <div className="auth-buttons">
              <Link to="/auth" className="auth-button">Log In</Link>
              <Link to="/auth" className="auth-button signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while auth is loading
  if (authLoading) {
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

  // Handle case where user exists but profile hasn't been created yet
  if (currentUser && !userProfile) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-logged-in">
            <h2>Setting up your profile...</h2>
            <p>We're creating your profile. This should only take a moment.</p>
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Please wait...</p>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
              If this takes too long, try{' '}
              <button 
                onClick={() => window.location.reload()} 
                style={{ color: 'var(--primary)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
              >
                refreshing the page
              </button>
              {' '}or{' '}
              <Link to="/auth" style={{ color: 'var(--primary)' }}>signing in again</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const badges = getBadges();

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header - COMPLETE VERSION */}
        <div className="profile-header">
          <div className="profile-header-main">
            <div className="profile-avatar">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName || 'User'} />
              ) : (
                <div className="avatar-placeholder">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{userProfile?.displayName || 'User'}</h1>
              <p className="member-since">
                Member since {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
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

        {/* Profile Navigation - COMPLETE VERSION */}
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
            Reviews ({stats.totalReviews})
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

        {/* Tab Content - COMPLETE VERSION */}
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
                        {preferences.flavorPreferences?.length > 0 
                          ? preferences.flavorPreferences.slice(0, 3).join(', ')
                          : 'Keep reviewing to discover your preferences!'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <div className="section-header">
                    <h3>Recent Reviews</h3>
                  </div>
                  {reviews.length > 0 ? (
                    <div className="recent-reviews">
                      {reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="recent-review-item">
                          <div className="review-header">
                            <h4>{review.chocolate?.name || 'Unknown Chocolate'}</h4>
                            <div className="review-rating">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= (review.rating || 0) ? 'filled' : ''}`}>★</span>
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

          {/* Reviews Tab - COMPLETE VERSION */}
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="section-header">
                <h2>Your Reviews</h2>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-card">
                      <div className="review-card-header">
                        <div>
                          <h3>{review.chocolate?.name || 'Unknown Chocolate'}</h3>
                          <p>{review.chocolate?.maker || 'Unknown Maker'}</p>
                        </div>
                        <div className="review-meta">
                          <div className="review-rating-large">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`star ${star <= (review.rating || 0) ? 'filled' : ''}`}>★</span>
                            ))}
                          </div>
                          <div className="review-date">
                            {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </div>
                        </div>
                      </div>
                      <div className="review-card-body">
                        <p>{review.text || 'No review text provided.'}</p>
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
                  <Link to="/browse" className="action-button">Start Reviewing Chocolates</Link>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab - COMPLETE VERSION */}
          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              <div className="section-header">
                <h2>Your Favorites</h2>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your favorites...</p>
                </div>
              ) : favorites.length > 0 ? (
                <div className="favorites-grid">
                  {favorites.map((favorite, index) => (
                    <div key={index} className="favorite-card">
                      <Link to={`/chocolate/${favorite.id}`} className="favorite-link">
                        <div className="favorite-image">
                          <img 
                            src={favorite.imageUrl || '/placeholder-chocolate.jpg'} 
                            alt={favorite.name}
                            onError={(e) => {
                              e.target.src = '/placeholder-chocolate.jpg';
                            }}
                          />
                        </div>
                        <div className="favorite-info">
                          <h3>{favorite.name}</h3>
                          <p>{favorite.maker}</p>
                          <div className="favorite-details">
                            <span>{favorite.type}</span>
                            <span>{favorite.cacaoPercentage}%</span>
                          </div>
                          <div className="favorite-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`star ${star <= (favorite.averageRating || 0) ? 'filled' : ''}`}>★</span>
                            ))}
                            <span className="rating-count">({favorite.reviewCount || 0})</span>
                          </div>
                        </div>
                      </Link>
                      <button 
                        className="remove-favorite"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(favorite.id);
                        }}
                        title="Remove from favorites"
                      ></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't added any favorites yet.</p>
                  <Link to="/browse" className="action-button">Discover Amazing Chocolates</Link>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab - COMPLETE VERSION */}
          {activeTab === 'preferences' && (
            <div className="preferences-tab">
              <div className="section-header">
                <h2>Your Preferences</h2>
              </div>
              
              <div className="preferences-form">
                <div className="preference-section">
                  <h3>Favorite Chocolate Types</h3>
                  <div className="checkbox-group">
                    {['Dark', 'Milk', 'White', 'Ruby', 'Single Origin', 'Flavored'].map(type => (
                      <label key={type} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferences.favoriteTypes?.includes(type) || false}
                          onChange={() => handlePreferencesUpdate('favoriteTypes', type)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-section">
                  <h3>Dietary Restrictions</h3>
                  <div className="checkbox-group">
                    {['Vegan', 'Dairy-Free', 'Gluten-Free', 'Sugar-Free', 'Nut-Free'].map(restriction => (
                      <label key={restriction} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferences.dietaryRestrictions?.includes(restriction) || false}
                          onChange={() => handlePreferencesUpdate('dietaryRestrictions', restriction)}
                        />
                        {restriction}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-section">
                  <h3>Flavor Preferences</h3>
                  <div className="checkbox-group">
                    {['Fruity', 'Nutty', 'Floral', 'Spicy', 'Earthy', 'Caramel', 'Vanilla', 'Berry', 'Citrus'].map(flavor => (
                      <label key={flavor} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferences.flavorPreferences?.includes(flavor) || false}
                          onChange={() => handlePreferencesUpdate('flavorPreferences', flavor)}
                        />
                        {flavor}
                      </label>
                    ))}
                  </div>
                </div>

                <button className="save-preferences" onClick={savePreferences}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;