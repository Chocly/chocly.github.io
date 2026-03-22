// src/pages/PersonalizedHome.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFollowingFeedReviews, getDailyDiscovery, getRecommendedChocolates } from '../services/feedService';
import { getUserReviewOrigins } from '../services/reviewService';
import { getPhotoReviews } from '../services/reviewService';
import { findOriginCoords } from '../data/originCoordinates';
import ChocolateCard from '../components/ChocolateCard';
import ChocolateMap from '../components/ChocolateMap';
import RatingStars from '../components/RatingStars';
import './PersonalizedHome.css';

const GREETINGS = [
  (name) => `Happy Sunday, ${name}! Time to explore new flavors.`,
  (name) => `Happy Monday, ${name}! Start the week with something sweet.`,
  (name) => `Hey ${name}! What are you tasting today?`,
  (name) => `Welcome back, ${name}! Ready for something new?`,
  (name) => `Happy Thursday, ${name}! Almost time to treat yourself.`,
  (name) => `TGIF, ${name}! You deserve something indulgent.`,
  (name) => `Happy weekend, ${name}! Time to explore new flavors.`,
];

function Skeleton({ width, height, radius = 8 }) {
  return <div className="ph-skeleton" style={{ width, height, borderRadius: radius }} />;
}

function PersonalizedHome() {
  const { currentUser, userProfile } = useAuth();

  const [originCountries, setOriginCountries] = useState([]);
  const [originsLoaded, setOriginsLoaded] = useState(false);
  const [feedReviews, setFeedReviews] = useState([]);
  const [feedLoaded, setFeedLoaded] = useState(false);
  const [dailyChocolate, setDailyChocolate] = useState(null);
  const [dailyLoaded, setDailyLoaded] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [recsLoaded, setRecsLoaded] = useState(false);
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [communityLoaded, setCommunityLoaded] = useState(false);

  const firstName = (userProfile?.displayName || currentUser?.displayName || 'there').split(' ')[0];
  const dayOfWeek = new Date().getDay();
  const greeting = GREETINGS[dayOfWeek](firstName);

  useEffect(() => {
    if (!currentUser) return;
    loadOrigins();
    loadFeed();
    loadDaily();
    loadRecommended();
    loadCommunity();
  }, [currentUser]);

  const loadOrigins = async () => {
    try {
      const origins = await getUserReviewOrigins(currentUser.uid);
      const countries = new Map();
      for (const origin of origins) {
        const coords = findOriginCoords(origin);
        if (coords) {
          const key = coords.label;
          countries.set(key, { ...coords, count: (countries.get(key)?.count || 0) + 1 });
        }
      }
      setOriginCountries(Array.from(countries.values()));
    } catch (e) { console.error('Error loading origins:', e); }
    finally { setOriginsLoaded(true); }
  };

  const loadFeed = async () => {
    try { setFeedReviews(await getFollowingFeedReviews(currentUser.uid, 5)); }
    catch (e) { console.error('Error loading feed:', e); }
    finally { setFeedLoaded(true); }
  };

  const loadDaily = async () => {
    try { setDailyChocolate(await getDailyDiscovery()); }
    catch (e) { console.error('Error loading daily:', e); }
    finally { setDailyLoaded(true); }
  };

  const loadRecommended = async () => {
    try { setRecommended(await getRecommendedChocolates(userProfile?.favorites || [], 6)); }
    catch (e) { console.error('Error loading recommended:', e); }
    finally { setRecsLoaded(true); }
  };

  const loadCommunity = async () => {
    try {
      const c = await getPhotoReviews(null, 6);
      setCommunityPhotos(c.reviews || []);
    } catch (e) { console.error('Error loading community:', e); }
    finally { setCommunityLoaded(true); }
  };

  const formatRelativeTime = (date) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      const diff = Date.now() - d;
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const wantToTry = userProfile?.wantToTry || [];
  const favCount = userProfile?.favorites?.length || 0;
  const reviewCount = userProfile?.reviewCount || 0;

  return (
    <div className="ph-page">
      <div className="ph-container">

        {/* Hero */}
        <section className="ph-hero">
          <div className="ph-hero-content">
            <h1 className="ph-headline">{greeting}</h1>
            <p className="ph-subhead">Your chocolate journey at a glance</p>
            <div className="ph-hero-actions">
              <Link to="/add-chocolate" className="ph-btn-filled">+ Add Review</Link>
              <Link to="/browse" className="ph-btn-tonal">Browse Chocolates</Link>
            </div>
          </div>
          <div className="ph-stats-row">
            <div className="ph-stat">
              <span className="ph-stat-num">{reviewCount}</span>
              <span className="ph-stat-lbl">Reviews</span>
            </div>
            <div className="ph-stat-divider" />
            <div className="ph-stat">
              <span className="ph-stat-num">{favCount}</span>
              <span className="ph-stat-lbl">Favorites</span>
            </div>
            <div className="ph-stat-divider" />
            <div className="ph-stat">
              <span className="ph-stat-num">{originsLoaded ? originCountries.length : '-'}</span>
              <span className="ph-stat-lbl">Countries</span>
            </div>
          </div>
        </section>

        {/* Chocolate Map */}
        <section className="ph-surface">
          <h2 className="ph-title">Your Chocolate Map</h2>
          {originsLoaded ? (
            <ChocolateMap countries={originCountries} />
          ) : (
            <Skeleton width="100%" height={280} radius={16} />
          )}
        </section>

        {/* Daily Discovery */}
        {(dailyLoaded ? dailyChocolate : true) && (
          <section className="ph-surface">
            <h2 className="ph-title">Daily Discovery</h2>
            {!dailyLoaded ? (
              <Skeleton width="100%" height={140} radius={16} />
            ) : dailyChocolate ? (
              <Link to={`/chocolate/${dailyChocolate.id}`} className="ph-discovery">
                <img
                  src={dailyChocolate.imageUrl || '/placeholder-chocolate.jpg'}
                  alt={dailyChocolate.name}
                  className="ph-discovery-img"
                />
                <div className="ph-discovery-body">
                  <span className="ph-label-sm">Today's Pick</span>
                  <h3 className="ph-discovery-name">{dailyChocolate.name}</h3>
                  <p className="ph-discovery-maker">{dailyChocolate.maker}</p>
                  {dailyChocolate.averageRating > 0 && (
                    <RatingStars rating={dailyChocolate.averageRating} size="small" />
                  )}
                  <span className="ph-discovery-cta">Discover &rarr;</span>
                </div>
              </Link>
            ) : null}
          </section>
        )}

        {/* Want to Try */}
        {wantToTry.length > 0 && (
          <section className="ph-surface">
            <div className="ph-surface-header">
              <h2 className="ph-title">Want to Try</h2>
              <Link to="/profile" className="ph-link">View all</Link>
            </div>
            <div className="ph-wtt-scroll">
              {wantToTry.slice(0, 10).map((item, i) => (
                <Link key={item.chocolateId || i} to={`/chocolate/${item.chocolateId}`} className="ph-wtt-item">
                  <div className="ph-wtt-img">
                    <img src={item.imageUrl || '/placeholder-chocolate.jpg'} alt={item.name} loading="lazy" />
                  </div>
                  <p className="ph-wtt-name">{item.name}</p>
                  <p className="ph-wtt-maker">{item.maker}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommended */}
        <section className="ph-surface">
          <div className="ph-surface-header">
            <h2 className="ph-title">Recommended for You</h2>
            <Link to="/browse" className="ph-link">Browse all</Link>
          </div>
          {!recsLoaded ? (
            <div className="ph-scroll-row">
              {[1, 2, 3].map(i => (
                <div key={i} className="ph-skeleton-card-wrap">
                  <Skeleton width="100%" height={140} radius={12} />
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="60%" height={12} />
                </div>
              ))}
            </div>
          ) : recommended.length > 0 ? (
            <div className="ph-scroll-row">
              {recommended.map(choc => (
                <ChocolateCard key={choc.id} chocolate={choc} />
              ))}
            </div>
          ) : (
            <p className="ph-empty-text">We're curating picks for you. <Link to="/browse">Browse chocolates</Link></p>
          )}
        </section>

        {/* Activity Feed */}
        <section className="ph-surface">
          <div className="ph-surface-header">
            <h2 className="ph-title">From People You Follow</h2>
            <Link to="/community" className="ph-link">Community</Link>
          </div>
          {!feedLoaded ? (
            <div className="ph-feed-list">
              {[1, 2].map(i => (
                <div key={i} className="ph-feed-skeleton">
                  <Skeleton width={36} height={36} radius={18} />
                  <div className="ph-feed-skeleton-lines">
                    <Skeleton width="50%" height={14} />
                    <Skeleton width="35%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : feedReviews.length > 0 ? (
            <div className="ph-feed-list">
              {feedReviews.map(review => (
                <Link
                  key={review.id}
                  to={`/chocolate/${review.chocolate?.id || review.chocolateId}`}
                  className="ph-feed-item"
                >
                  <div className="ph-feed-top">
                    {review.userPhotoURL ? (
                      <img src={review.userPhotoURL} alt="" className="ph-feed-avatar" />
                    ) : (
                      <div className="ph-feed-avatar-ph">
                        {(review.userName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ph-feed-meta">
                      <span className="ph-feed-user">{review.userName || 'Anonymous'}</span>
                      <span className="ph-feed-choc">{review.chocolate?.name} — {review.chocolate?.maker}</span>
                    </div>
                    <span className="ph-feed-time">{formatRelativeTime(review.createdAt)}</span>
                  </div>
                  <div className="ph-feed-rating">
                    <RatingStars rating={review.rating} size="small" />
                  </div>
                  {review.text && (
                    <p className="ph-feed-text">
                      {review.text.length > 140 ? review.text.slice(0, 140) + '...' : review.text}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="ph-empty-text">
              Follow chocolate lovers to see their reviews here. <Link to="/community">Discover the community</Link>
            </p>
          )}
        </section>

        {/* Community Highlights */}
        {(communityLoaded ? communityPhotos.length > 0 : true) && (
          <section className="ph-surface">
            <div className="ph-surface-header">
              <h2 className="ph-title">Community Highlights</h2>
              <Link to="/community" className="ph-link">See more</Link>
            </div>
            {!communityLoaded ? (
              <div className="ph-community-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="ph-skeleton-card-wrap">
                    <Skeleton width="100%" height={120} radius={12} />
                    <Skeleton width="70%" height={12} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="ph-community-grid">
                {communityPhotos.map(review => (
                  <Link
                    key={review.id}
                    to={`/chocolate/${review.chocolate?.id || review.chocolateId}`}
                    className="ph-community-card"
                  >
                    {review.photoUrls?.[0] && (
                      <img src={review.photoUrls[0]} alt="" className="ph-community-img" loading="lazy" />
                    )}
                    <div className="ph-community-info">
                      <p className="ph-community-name">{review.chocolate?.name || 'Chocolate'}</p>
                      <p className="ph-community-by">by {review.userName || 'Anonymous'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

export default PersonalizedHome;
