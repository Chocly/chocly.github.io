// src/pages/ProfilePage.jsx - IMPROVED: Better loading and error handling
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserReviews } from '../services/reviewService';
import { getFavoriteChocolates, removeFromFavorites } from '../services/userService';
import { updateUserProfile } from '../services/authService';
import { getUserWantToTryList, removeFromWantToTry } from '../services/userService';
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
  const { currentUser, userProfile, loading: authLoading, error: authError, profileCreating, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  // Add this state variable with your other useState declarations
const [wantToTryList, setWantToTryList] = useState([]);

  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    favoriteChocolateTypes: [],
    isProfilePublic: true,
    profilePicture: null
  });
  const [preferences, setPreferences] = useState({
    favoriteTypes: [],
    dietaryRestrictions: [],
    flavorPreferences: []
  });
  const navigate = useNavigate();

  // IMPROVED: Better conditional rendering with retry logic
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

  // IMPROVED: Handle profile creation state better
  if (currentUser && (!userProfile || profileCreating)) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-logged-in">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍫</div>
              <h2>Setting up your chocolate journey!</h2>
              <p>We're creating your profile. This should only take a moment.</p>
            </div>
            
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Creating your profile...</p>
            </div>
            
            {/* IMPROVED: Better retry options */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                This is taking longer than expected.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    setRetryCount(prev => prev + 1);
                    refreshProfile();
                  }}
                  style={{ 
                    color: 'var(--primary)', 
                    background: 'white', 
                    border: '2px solid var(--primary)', 
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Refresh Profile {retryCount > 0 && `(${retryCount})`}
                </button>
                
                <button 
                  onClick={() => window.location.reload()} 
                  style={{ 
                    color: 'var(--primary)', 
                    background: 'white', 
                    border: '2px solid var(--primary)', 
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Reload Page
                </button>
                
                <Link 
                  to="/" 
                  style={{ 
                    color: 'white', 
                    background: 'var(--primary)', 
                    border: '2px solid var(--primary)', 
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  Go to Homepage
                </Link>
              </div>
              
              {authError && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#FEE2E2', 
                  color: '#DC2626', 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <strong>Error:</strong> {authError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

// Updated useEffect section - replace your current one with this:
useEffect(() => {
  if (currentUser && userProfile) {
    loadUserData();
    // Initialize edit form with current profile data
    setEditForm({
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      favoriteChocolateTypes: userProfile.favoriteChocolateTypes || [],
      isProfilePublic: userProfile.isProfilePublic !== false, // Default to true
      profilePicture: null // File input, not the current URL
    });
  }
}, [currentUser, userProfile]);


 // Updated loadUserData function - replace your current one with this:
const loadUserData = async () => {
  setLoading(true);
  try {
    // Load reviews, favorites, and want-to-try list in parallel
    const [userReviews, userFavorites, userWantToTry] = await Promise.all([
      getUserReviews(currentUser.uid).catch(() => []),
      getFavoriteChocolates(currentUser.uid).catch(() => []),
      getUserWantToTryList(currentUser.uid).catch(() => [])
    ]);
    
    setReviews(userReviews);
    setFavorites(userFavorites);
    setWantToTryList(userWantToTry);
    
    // Set preferences from user profile
    if (userProfile.preferences) {
      setPreferences(userProfile.preferences);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  } finally {
    setLoading(false);
  }
};

// Add this function for handling want-to-try removal
const handleRemoveFromWantToTry = async (chocolate) => {
  try {
    await removeFromWantToTry(currentUser.uid, chocolate);
    setWantToTryList(prev => prev.filter(item => item.chocolateId !== chocolate.id));
  } catch (error) {
    console.error('Error removing from want to try:', error);
    alert('Error removing from want to try list. Please try again.');
  }
};

  const calculateStats = () => {
    return {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0,
      favoriteChocolates: favorites.length,
      chocolatesDiscovered: reviews.length // Number of unique chocolates they've reviewed
    };
  };

  // Helper function to format dates nicely
  const formatDate = (date) => {
    if (!date) return 'Recently';
    
    try {
      // Handle different date formats
      let dateObj;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (date?.toDate && typeof date.toDate === 'function') {
        // Firestore timestamp
        dateObj = date.toDate();
      } else if (date?.seconds) {
        // Firestore timestamp object
        dateObj = new Date(date.seconds * 1000);
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return 'Recently';
      }
  
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Recently';
      }
  
      const now = new Date();
      const diffTime = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      // Return relative time for recent dates
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
      } else {
        // For older dates, show the actual date
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Recently';
    }
  };
  
  // Helper function to format review dates properly
  const formatReviewDate = (date) => {
    if (!date) return 'No date available';
    
    try {
      // Handle different date formats
      let dateObj;
      
      if (date.toDate && typeof date.toDate === 'function') {
        // Firestore Timestamp
        dateObj = date.toDate();
      } else if (date.seconds) {
        // Firestore Timestamp object with seconds
        dateObj = new Date(date.seconds * 1000);
      } else if (typeof date === 'string' || typeof date === 'number') {
        // String or timestamp
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        // Already a Date object
        dateObj = date;
      } else {
        return 'Invalid date';
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date nicely
      const now = new Date();
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date unavailable';
    }
  };

  const getBadges = () => {
    const badges = ['Newcomer'];
    const reviewCount = reviews.length;
    
    if (reviewCount >= 5) badges.push('Reviewer');
    if (reviewCount >= 20) badges.push('Enthusiast');
    if (reviewCount >= 50) badges.push('Connoisseur');
    
    return badges;
  };

  const handleRemoveFavorite = async (chocolateId) => {
    try {
      await removeFromFavorites(currentUser.uid, chocolateId);
      setFavorites(prev => prev.filter(fav => fav.id !== chocolateId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing from favorites. Please try again.');
    }
  };

  const handlePreferenceChange = (type, value) => {
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

  // Edit Profile Functions
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current profile data
    setEditForm({
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      favoriteChocolateTypes: userProfile.favoriteChocolateTypes || [],
      isProfilePublic: userProfile.isProfilePublic !== false,
      profilePicture: null
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChocolateTypeToggle = (type) => {
    setEditForm(prev => ({
      ...prev,
      favoriteChocolateTypes: prev.favoriteChocolateTypes.includes(type)
        ? prev.favoriteChocolateTypes.filter(t => t !== type)
        : [...prev.favoriteChocolateTypes, type]
    }));
  };

  // Add this function to fetch want-to-try chocolates
const fetchWantToTryList = async () => {
  if (!currentUser) return;
  
  try {
    const wantToTryData = await getUserWantToTryList(currentUser.uid);
    setWantToTryList(wantToTryData);
  } catch (error) {
    console.error('Error fetching want to try list:', error);
  }
};

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image must be smaller than 5MB');
        return;
      }
      setEditForm(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.displayName.trim()) {
      alert('Display name is required');
      return;
    }

    setLoading(true);
    try {
      // Prepare update data
      const updateData = {
        displayName: editForm.displayName.trim(),
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        favoriteChocolateTypes: editForm.favoriteChocolateTypes,
        isProfilePublic: editForm.isProfilePublic
      };

      // Add profile picture if selected
      if (editForm.profilePicture) {
        updateData.profilePicture = editForm.profilePicture;
      }

      // Update the profile
      await updateUserProfile(currentUser.uid, updateData);
      
      // Refresh profile data
      await refreshProfile();
      
      alert('Profile updated successfully!');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = calculateStats();
  const badges = getBadges();

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
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
              {userProfile?.location && (
                <p className="user-location">📍 {userProfile.location}</p>
              )}
              {userProfile?.bio && (
                <p className="user-bio">{userProfile.bio}</p>
              )}
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
            <button 
              className="edit-profile-button"
              onClick={handleEditClick}
              disabled={isEditing}
            >
              {isEditing ? 'Editing...' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Edit Profile Modal/Section */}
        {isEditing && (
          <div className="edit-profile-section">
            <div className="edit-profile-header">
              <h3>Edit Your Profile</h3>
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="edit-profile-form">
              {/* Profile Picture */}
              <div className="form-section">
                <label className="form-label">Profile Picture</label>
                <div className="profile-picture-upload">
                  <div className="current-picture">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Current profile" />
                    ) : (
                      <div className="avatar-placeholder">
                        {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="upload-controls">
                    <input
                      type="file"
                      id="profile-picture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profile-picture" className="upload-btn">
                      Choose New Picture
                    </label>
                    {editForm.profilePicture && (
                      <p className="file-selected">
                        ✓ {editForm.profilePicture.name}
                      </p>
                    )}
                    <p className="upload-hint">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="form-section">
                <label className="form-label">Display Name *</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => handleEditFormChange('displayName', e.target.value)}
                  placeholder="Your display name"
                  className="form-input"
                  maxLength={50}
                />
                <p className="form-hint">This is how other users will see your name</p>
              </div>

              {/* Location */}
              <div className="form-section">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => handleEditFormChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="form-input"
                  maxLength={100}
                />
                <p className="form-hint">Help others discover chocolate communities near you</p>
              </div>

              {/* Bio */}
              <div className="form-section">
                <label className="form-label">About Me</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleEditFormChange('bio', e.target.value)}
                  placeholder="Tell us about your chocolate journey..."
                  className="form-textarea"
                  rows={4}
                  maxLength={500}
                />
                <p className="form-hint">{editForm.bio.length}/500 characters</p>
              </div>

              {/* Favorite Chocolate Types */}
              <div className="form-section">
                <label className="form-label">Favorite Chocolate Types</label>
                <div className="checkbox-grid">
                  {['Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 'Single Origin', 'Bean-to-Bar', 'Artisanal', 'Organic', 'Fair Trade'].map(type => (
                    <label key={type} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={editForm.favoriteChocolateTypes.includes(type)}
                        onChange={() => handleChocolateTypeToggle(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                <p className="form-hint">These will be highlighted on your profile</p>
              </div>

              {/* Privacy Settings */}
              <div className="form-section">
                <label className="form-label">Privacy Settings</label>
                <div className="privacy-options">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="privacy"
                      checked={editForm.isProfilePublic === true}
                      onChange={() => handleEditFormChange('isProfilePublic', true)}
                    />
                    <div className="radio-content">
                      <span className="radio-title">🌍 Public Profile</span>
                      <span className="radio-description">Other users can see your profile, reviews, and favorites</span>
                    </div>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="privacy"
                      checked={editForm.isProfilePublic === false}
                      onChange={() => handleEditFormChange('isProfilePublic', false)}
                    />
                    <div className="radio-content">
                      <span className="radio-title">🔒 Private Profile</span>
                      <span className="radio-description">Only you can see your profile details</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Save Changes Button - Moved to bottom */}
              <div className="form-actions-bottom">
                <button 
                  className="save-btn-bottom"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

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
    Reviews ({stats.totalReviews})
  </button>
  <button 
    className={`profile-nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
    onClick={() => setActiveTab('favorites')}
  >
    Favorites ({favorites.length})
  </button>
  {/* ADD THIS NEW BUTTON HERE */}
  <button 
    className={`profile-nav-link ${activeTab === 'wantToTry' ? 'active' : ''}`}
    onClick={() => setActiveTab('wantToTry')}
  >
    Want to Try ({wantToTryList.length})
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
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalReviews}</div>
                  <div className="stat-label">Reviews Written</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.averageRating}</div>
                  <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.favoriteChocolates}</div>
                  <div className="stat-label">Favorite Chocolates</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.chocolatesDiscovered}</div>
                  <div className="stat-label">Chocolates Discovered</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                {reviews.length > 0 ? (
                  <div className="activity-list">
                    {reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="activity-item">
                        <div className="activity-content">
                          <p>Reviewed <strong>{review.chocolate?.name || 'Unknown Chocolate'}</strong></p>
                          <p className="activity-date">{formatReviewDate(review.createdAt)}</p>
                        </div>
                        <div className="activity-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${star <= review.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-activity">
                    <p>No recent activity. <Link to="/browse">Start exploring chocolates!</Link></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <h3>Your Reviews</h3>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <h4 className="reviewed-chocolate">{review.chocolate?.name || 'Unknown Chocolate'}</h4>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${star <= review.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="review-maker">{review.chocolate?.maker || 'Unknown Maker'}</p>
                      {review.title && <h5 className="review-title">"{review.title}"</h5>}
                      <p className="review-text">{review.text}</p>
                      <div className="review-footer">
                        <p className="review-date">
                          {formatReviewDate(review.createdAt)}
                        </p>
                        <Link 
                          to={`/chocolate/${review.chocolateId}`}
                          className="view-chocolate-link"
                        >
                          View Chocolate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h4>No reviews yet</h4>
                  <p>Share your chocolate experiences with the community!</p>
                  <Link to="/browse" className="btn btn-primary">Find Chocolates to Review</Link>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              <h3>Your Favorite Chocolates</h3>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading favorites...</p>
                </div>
              ) : favorites.length > 0 ? (
                <div className="favorites-grid">
                  {favorites.map(chocolate => (
                    <div key={chocolate.id} className="favorite-chocolate-card">
                      <div className="favorite-image">
                        {chocolate.imageUrl ? (
                          <img src={chocolate.imageUrl} alt={chocolate.name} />
                        ) : (
                          <div className="placeholder-image">
                            <span>🍫</span>
                          </div>
                        )}
                      </div>
                      <div className="favorite-info">
                        <h4 className="favorite-name">{chocolate.name}</h4>
                        <p className="favorite-maker">{chocolate.maker}</p>
                        {chocolate.type && (
                          <span className="favorite-type">{chocolate.type}</span>
                        )}
                        {chocolate.averageRating && (
                          <div className="favorite-rating">
                            <span className="rating-value">{chocolate.averageRating.toFixed(1)}</span>
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                  key={star} 
                                  className={`star ${star <= Math.round(chocolate.averageRating) ? 'filled' : ''}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="favorite-actions">
                        <Link 
                          to={`/chocolate/${chocolate.id}`}
                          className="view-chocolate-btn"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleRemoveFavorite(chocolate.id)}
                          className="remove-favorite-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💔</div>
                  <h4>No favorites yet</h4>
                  <p>Start exploring chocolates and add some to your favorites!</p>
                  <Link to="/browse" className="btn btn-primary">Discover Chocolates</Link>
                </div>
              )}
            </div>
          )}

          {/* Want to Try Tab */}
          {activeTab === 'wantToTry' && (
  <div className="profile-section">
    <div className="section-header">
      <h3>Want to Try ({wantToTryList.length})</h3>
      <p>Chocolates you're planning to taste</p>
    </div>
    
    {wantToTryList.length > 0 ? (
      <div className="want-to-try-grid">
        {wantToTryList.map((item) => (
          <div key={item.chocolateId} className="want-to-try-card">
            <div className="want-to-try-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="placeholder-image">🍫</div>
              )}
            </div>
            
            <div className="want-to-try-info">
              <h4 className="want-to-try-name">{item.name}</h4>
              <p className="want-to-try-maker">{item.maker}</p>
              <p className="want-to-try-date">
                Added {formatDate(item.addedAt)}
              </p>
            </div>
            
            <div className="want-to-try-actions">
              <Link 
                to={`/chocolate/${item.chocolateId}`}
                className="view-chocolate-btn"
              >
                View Details
              </Link>
              <button 
                onClick={() => handleRemoveFromWantToTry(item)}
                className="remove-want-to-try-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h4>No chocolates in your want to try list yet</h4>
        <p>Start exploring chocolates and click the bookmark icon to add them here!</p>
        <Link to="/browse" className="browse-chocolates-btn">
          Browse Chocolates
        </Link>
      </div>
    )}
  </div>
)}


          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="preferences-tab">
              <h3>Your Preferences</h3>
              <div className="preferences-form">
                <div className="preference-section">
                  <h4>Favorite Types</h4>
                  <div className="preference-options">
                    {['Dark', 'Milk', 'White', 'Single Origin', 'Bean-to-Bar'].map(type => (
                      <label key={type} className="preference-option">
                        <input
                          type="checkbox"
                          checked={preferences.favoriteTypes.includes(type)}
                          onChange={() => handlePreferenceChange('favoriteTypes', type)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-section">
                  <h4>Dietary Restrictions</h4>
                  <div className="preference-options">
                    {['Vegan', 'Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Sugar-Free'].map(restriction => (
                      <label key={restriction} className="preference-option">
                        <input
                          type="checkbox"
                          checked={preferences.dietaryRestrictions.includes(restriction)}
                          onChange={() => handlePreferenceChange('dietaryRestrictions', restriction)}
                        />
                        {restriction}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-section">
                  <h4>Flavor Preferences</h4>
                  <div className="preference-options">
                    {['Fruity', 'Nutty', 'Floral', 'Earthy', 'Spicy', 'Sweet'].map(flavor => (
                      <label key={flavor} className="preference-option">
                        <input
                          type="checkbox"
                          checked={preferences.flavorPreferences.includes(flavor)}
                          onChange={() => handlePreferenceChange('flavorPreferences', flavor)}
                        />
                        {flavor}
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={savePreferences} className="save-preferences-btn">
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