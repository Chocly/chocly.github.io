import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPublicUserProfile, getFavoriteChocolates } from '../services/userService';
import { getUserReviews } from '../services/reviewService';
import { followUser, unfollowUser, isFollowing } from '../services/followService';
import './UserProfilePage.css';

const BadgeIcon = ({ name }) => {
  const icons = {
    'Newcomer': (
      <svg className="newcomer" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H11V7H13V8H15V10H11V11H14A1,1 0 0,1 15,12V15A1,1 0 0,1 14,16H13V17H11Z" />
      </svg>
    ),
    'Reviewer': (
      <svg className="reviewer" viewBox="0 0 24 24">
        <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
      </svg>
    ),
    'Enthusiast': (
      <svg className="enthusiast" viewBox="0 0 24 24">
        <path d="M16,5V11H21V5M10,11H15V5H10M16,18H21V12H16M10,18H15V12H10M4,18H9V12H4M4,11H9V5H4V11Z" />
      </svg>
    ),
    'Connoisseur': (
      <svg className="connoisseur" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Redirect to own profile
  useEffect(() => {
    if (currentUser && currentUser.uid === userId) {
      navigate('/profile', { replace: true });
    }
  }, [currentUser, userId, navigate]);

  // Load profile
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getPublicUserProfile(userId);
        if (!p) {
          setError('User not found');
          setLoading(false);
          return;
        }
        setProfile(p);

        if (p.isProfilePublic) {
          const [r, f] = await Promise.all([
            getUserReviews(userId).catch(() => []),
            getFavoriteChocolates(userId).catch(() => []),
          ]);
          setReviews(r);
          setFavorites(f);
        }

        if (currentUser && currentUser.uid !== userId) {
          const is = await isFollowing(currentUser.uid, userId);
          setFollowing(is);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(currentUser.uid, userId);
        setFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followerCount: Math.max(0, (prev.followerCount || 0) - 1),
        }));
      } else {
        await followUser(currentUser.uid, userId);
        setFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followerCount: (prev.followerCount || 0) + 1,
        }));
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <div className="up-error">
            <h2>Profile Not Found</h2>
            <p>This user doesn't exist or their profile is unavailable.</p>
            <Link to="/browse" className="btn btn-primary">Browse Chocolates</Link>
          </div>
        </div>
      </div>
    );
  }

  const avatar = profile.photoURL ? (
    <img src={profile.photoURL} alt={profile.displayName} />
  ) : (
    <div className="up-avatar-placeholder">
      {profile.displayName.charAt(0).toUpperCase()}
    </div>
  );

  // Private profile
  if (!profile.isProfilePublic) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <div className="up-header">
            <div className="up-header-top">
              <div className="up-avatar">{avatar}</div>
              <div className="up-info">
                <h1>{profile.displayName}</h1>
              </div>
            </div>
          </div>
          <div className="up-private">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h3>This profile is private</h3>
            <p>This user has chosen to keep their profile private.</p>
          </div>
        </div>
      </div>
    );
  }

  // Public profile
  return (
    <div className="user-profile-page">
      <div className="container">
        <div className="up-header">
          <div className="up-header-top">
            <div className="up-avatar">{avatar}</div>
            <div className="up-info">
              <div className="up-name-row">
                <h1>{profile.displayName}</h1>
                {currentUser && currentUser.uid !== userId && (
                  <button
                    className={`follow-btn ${following ? 'is-following' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : following ? 'Following' : 'Follow'}
                  </button>
                )}
                {!currentUser && (
                  <button className="follow-btn" onClick={() => navigate('/auth')}>
                    Follow
                  </button>
                )}
              </div>

              {profile.location && (
                <div className="up-location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {profile.location}
                </div>
              )}

              {profile.bio && <p className="up-bio">{profile.bio}</p>}

              <div className="up-stats">
                <span><strong>{profile.reviewCount || 0}</strong> reviews</span>
                <span><strong>{profile.followerCount || 0}</strong> followers</span>
                <span><strong>{profile.followingCount || 0}</strong> following</span>
              </div>

              {profile.badges && profile.badges.length > 0 && (
                <div className="up-badges">
                  {profile.badges.map((badge) => (
                    <div className="up-badge" key={badge}>
                      <BadgeIcon name={badge} />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="up-tabs">
          <button
            className={`up-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button
            className={`up-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="up-review">
                  <div className="up-review-header">
                    <Link
                      to={`/chocolate/${review.chocolateId}`}
                      className="up-review-chocolate"
                    >
                      {review.chocolate?.name || 'Unknown Chocolate'}
                    </Link>
                    <span className="up-review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s > review.rating ? 'empty' : ''}>
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="up-review-maker">
                    {review.chocolate?.maker || 'Unknown Maker'}
                  </p>
                  {review.text && <p className="up-review-text">{review.text}</p>}
                  <p className="up-review-date">{formatDate(review.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="up-empty">
                <h4>No reviews yet</h4>
                <p>{profile.displayName} hasn't written any reviews yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length > 0 ? (
              <div className="up-favorites-grid">
                {favorites.map((choc) => (
                  <Link
                    to={`/chocolate/${choc.id}`}
                    key={choc.id}
                    className="up-fav-card"
                  >
                    <div className="up-fav-img">
                      {choc.imageUrl ? (
                        <img src={choc.imageUrl} alt={choc.name} loading="lazy" />
                      ) : (
                        <span className="placeholder">🍫</span>
                      )}
                    </div>
                    <div className="up-fav-info">
                      <p className="up-fav-name">{choc.name}</p>
                      <p className="up-fav-maker">{choc.maker}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="up-empty">
                <h4>No favorites yet</h4>
                <p>{profile.displayName} hasn't added any favorites yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
