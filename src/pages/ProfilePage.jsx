// src/pages/ProfilePage.jsx - Clean version with favorites
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews } from '../services/reviewService';
import { getFavoriteChocolates, removeFromFavorites } from '../services/userService';
import { getUserContributionStats, getUserContributedChocolates } from '../services/chocolateFirebaseService';
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
    // Redirect if not logged in
    if (!currentUser && !loading) {
      navigate('/login');
      return;
    }

    // Load user data
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
        // Load reviews, favorites, and contribution stats in parallel
        const [userReviews, userFavorites, contributionStats, contributedChocolates] = await Promise.all([
          getUserReviews(currentUser.uid),
          getFavoriteChocolates(currentUser.uid),
          getUserContributionStats(currentUser.uid),
          getUserContributedChocolates(currentUser.uid)
        ]);
          
        setReviews(userReviews);
        setFavorites(userFavorites);
        setContributionStats(contributionStats); // Add this state
        setContributedChocolates(contributedChocolates); // Add this state
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

    loadUserData();
  }, [currentUser, navigate, loading]);

  // ADD THE DEBUG BLOCK HERE (inside the function)
  useEffect(() => {
    if (currentUser) {
      console.log("🔍 DEBUG: User ID being used for query:", currentUser.uid);
      
      const testQuery = async () => {
        try {
          const userReviews = await getUserReviews(currentUser.uid);
          console.log("🔍 DEBUG: Reviews returned:", userReviews);
          console.log("🔍 DEBUG: Number of reviews:", userReviews.length);
        } catch (error) {
          console.error("🔍 DEBUG: Query error:", error);
        }
      };
      
      testQuery();
    }
  }, [currentUser]);

// Add these new state variables at the top of your component:
const [contributionStats, setContributionStats] = useState({
  chocolatesAdded: 0,
  reviewsWritten: 0,
  totalContributions: 0
});


  // Calculate user statistics
  const calculateStats = () => {
    if (!userProfile) return {};

    // Basic stats
    const totalReviews = reviews.length;
    const totalTasted = reviews.length;
    const totalContributions = contributionStats.chocolatesAdded;

    
    // Calculate average rating given by user
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    // Find most reviewed type
    const typeCount = {};
    reviews.forEach(review => {
      const type = review.chocolate.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
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
      const maker = review.chocolate.maker;
      makerCount[maker] = (makerCount[maker] || 0) + 1;
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
      totalContributions,
      favoriteType,
      favoriteMaker
    };
  };

// Update your badges function to include contribution badges:
const getBadges = () => {
  if (!userProfile) return [];
  
  // Get existing badges and add contribution-based ones
  const badges = [...(userProfile.badges || ['Newcomer'])];
  
  // Add contribution badges based on stats
  const chocolatesAdded = contributionStats.chocolatesAdded;
  
  if (chocolatesAdded >= 1 && !badges.includes('Contributor')) {
    badges.push('Contributor');
  }
  if (chocolatesAdded >= 5 && !badges.includes('Chocolate Scout')) {
    badges.push('Chocolate Scout');
  }
  if (chocolatesAdded >= 10 && !badges.includes('Database Builder')) {
    badges.push('Database Builder');
  }
  
  return badges;
};

// Add this new BadgeIcon for contribution badges in your existing BadgeIcon component:
const contributionBadges = {
  'Contributor': (
    <svg className="badge-icon contributor" viewBox="0 0 24 24">
      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
    </svg>
  ),
  'Chocolate Scout': (
    <svg className="badge-icon scout" viewBox="0 0 24 24">
      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L15.5,7.5L17,11L15.5,14.5L12,16L8.5,14.5L7,11L8.5,7.5L12,6M12,8.2L10,9L9.2,11L10,13L12,13.8L14,13L14.8,11L14,9L12,8.2Z" />
    </svg>
  ),
  'Database Builder': (
    <svg className="badge-icon builder" viewBox="0 0 24 24">
      <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" />
    </svg>
  )
};

  const stats = calculateStats();
  const badges = getBadges();

  if (!currentUser || !userProfile) {
    return (
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
                <div className="avatar-placeholder">{userProfile.displayName.charAt(0)}</div>
              )}
            </div>
            <div className="profile-info">
              <h1>{userProfile.displayName}</h1>
              <p className="member-since">Member since {userProfile.createdAt?.toDate().toLocaleDateString() || 'Recently'}</p>
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
                  <div className="stat-card contribution-stat">
                    <div className="stat-value">{stats.totalContributions}</div>
                    <div className="stat-label">Chocolates Added</div>
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
                          <Link to={`/chocolate/${review.chocolate.id}`} className="review-chocolate">
                            <img src={review.chocolate.imageUrl} alt={review.chocolate.name} />
                            <div className="review-chocolate-info">
                              <h4>{review.chocolate.name}</h4>
                              <p>{review.chocolate.maker}</p>
                            </div>
                          </Link>
                          <div className="review-content">
                            <div className="review-rating">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                              ))}
                              <span className="review-date">
                                {new Date(review.createdAt.toDate()).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="review-text">{review.text.substring(0, 120)}...</p>
                          </div>
                        </div>
                      ))}
                      <Link to="#" onClick={() => setActiveTab('reviews')} className="see-all-link">
                        See all reviews
                      </Link>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>You haven't written any reviews yet.</p>
                      <Link to="/" className="action-button">Discover Chocolates to Review</Link>
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
                        <Link to={`/chocolate/${review.chocolate.id}`} className="review-chocolate">
                          <img src={review.chocolate.imageUrl} alt={review.chocolate.name} />
                          <div className="review-chocolate-info">
                            <h3>{review.chocolate.name}</h3>
                            <p>{review.chocolate.maker}</p>
                          </div>
                        </Link>
                        <div className="review-meta">
                          <div className="review-rating-large">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                            ))}
                          </div>
                          <div className="review-date">
                            {new Date(review.createdAt.toDate()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="review-card-body">
                        <p className="review-text">{review.text}</p>
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
                  <Link to="/" className="action-button">Discover Chocolates to Review</Link>
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
                <img src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'} alt={chocolate.name} />
              </div>
              <div className="favorite-info">
                <h3>{chocolate.name}</h3>
                <p>{chocolate.maker}</p>
                <div className="favorite-details">
                  <span>{chocolate.type}</span>
                  <span>{chocolate.cacaoPercentage}% Cacao</span>
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
              onClick={async () => {
                try {
                  await removeFromFavorites(currentUser.uid, chocolate.id);
                  // Refresh favorites list
                  const updatedFavorites = await getFavoriteChocolates(currentUser.uid);
                  setFavorites(updatedFavorites);
                } catch (error) {
                  console.error('Error removing favorite:', error);
                  alert('Error removing favorite. Please try again.');
                }
              }}
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
                        checked={userProfile.preferences?.favoriteTypes?.includes('Dark')} 
                        onChange={() => {}} 
                      />
                      Dark Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Milk')} 
                        onChange={() => {}} 
                      />
                      Milk Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('White')} 
                        onChange={() => {}} 
                      />
                      White Chocolate
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Single Origin')} 
                        onChange={() => {}} 
                      />
                      Single Origin
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.favoriteTypes?.includes('Flavored')} 
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
                        checked={userProfile.preferences?.flavorPreferences?.includes('Fruity')} 
                        onChange={() => {}} 
                      />
                      Fruity
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Nutty')} 
                        onChange={() => {}} 
                      />
                      Nutty
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Floral')} 
                        onChange={() => {}} 
                      />
                      Floral
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Spicy')} 
                        onChange={() => {}} 
                      />
                      Spicy
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Earthy')} 
                        onChange={() => {}} 
                      />
                      Earthy
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.flavorPreferences?.includes('Caramel')} 
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
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Dairy-Free')} 
                        onChange={() => {}} 
                      />
                      Dairy-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Vegan')} 
                        onChange={() => {}} 
                      />
                      Vegan
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Gluten-Free')} 
                        onChange={() => {}} 
                      />
                      Gluten-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Nut-Free')} 
                        onChange={() => {}} 
                      />
                      Nut-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Sugar-Free')} 
                        onChange={() => {}} 
                      />
                      Sugar-Free
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences?.dietaryRestrictions?.includes('Fair Trade')} 
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

// Add a new "Contributions" tab to your navigation:
<button 
  className={`profile-nav-link ${activeTab === 'contributions' ? 'active' : ''}`}
  onClick={() => setActiveTab('contributions')}
>
  My Contributions ({contributionStats.chocolatesAdded})
</button>

// Add the Contributions tab content:
{activeTab === 'contributions' && (
  <div className="contributions-tab">
    <div className="section-header">
      <h2>Your Chocolate Contributions</h2>
      <p>Thank you for helping build our chocolate database!</p>
    </div>
    
    {contributedChocolates.length > 0 ? (
      <div className="contributions-grid">
        {contributedChocolates.map(chocolate => (
          <div className="contribution-card" key={chocolate.id}>
            <Link to={`/chocolate/${chocolate.id}`} className="contribution-link">
              <div className="contribution-image">
                <img src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'} alt={chocolate.name} />
              </div>
              <div className="contribution-info">
                <h3>{chocolate.name}</h3>
                <p className="contribution-maker">{chocolate.maker}</p>
                <div className="contribution-meta">
                  <span className="contribution-date">
                    Added {chocolate.createdAt?.toDate().toLocaleDateString()}
                  </span>
                  <span className="contribution-status approved">✓ Approved</span>
                </div>
                <div className="contribution-stats">
                  <span className="stat">
                    ⭐ {(chocolate.averageRating || 0).toFixed(1)} 
                    ({chocolate.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">🍫</div>
        <h3>Start Contributing!</h3>
        <p>Help fellow chocolate lovers by adding chocolates you've discovered to our database.</p>
        <Link to="/add-chocolate" className="action-button">
          Add Your First Chocolate
        </Link>
      </div>
    )}
    
    <div className="contribution-achievements">
      <h3>Your Impact</h3>
      <div className="achievement-stats">
        <div className="achievement-item">
          <div className="achievement-number">{contributionStats.chocolatesAdded}</div>
          <div className="achievement-label">Chocolates Added</div>
        </div>
        <div className="achievement-item">
          <div className="achievement-number">
            {contributedChocolates.reduce((sum, chocolate) => sum + (chocolate.reviewCount || 0), 0)}
          </div>
          <div className="achievement-label">Reviews on Your Chocolates</div>
        </div>
        <div className="achievement-item">
          <div className="achievement-number">
            {(contributedChocolates.reduce((sum, chocolate) => sum + (chocolate.averageRating || 0), 0) / Math.max(contributedChocolates.length, 1)).toFixed(1)}
          </div>
          <div className="achievement-label">Average Rating</div>
        </div>
      </div>
    </div>
  </div>
)}

export default ProfilePage;