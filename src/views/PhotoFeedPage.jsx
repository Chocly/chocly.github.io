// src/pages/PhotoFeedPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPhotoReviews } from '../services/reviewService';
import { getUserLikeStatuses } from '../services/likeService';
import ReviewPhotoGallery from '../components/ReviewPhotoGallery';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import RatingStars from '../components/RatingStars';
import ShareButton from '../components/ShareButton';
import SEO from '../components/SEO';
import './PhotoFeedPage.css';

function PhotoFeedPage() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [likeStatuses, setLikeStatuses] = useState({});
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadReviews = async (cursor = null) => {
    const isInitial = !cursor;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getPhotoReviews(cursor, 10);
      const newReviews = isInitial ? result.reviews : [...reviews, ...result.reviews];
      setReviews(newReviews);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);

      // Batch-fetch like statuses
      if (currentUser && result.reviews.length > 0) {
        const ids = result.reviews.map(r => r.id);
        const statuses = await getUserLikeStatuses(ids, currentUser.uid);
        setLikeStatuses(prev => ({ ...prev, ...statuses }));
      }
    } catch (error) {
      console.error('Error loading photo feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      const now = new Date();
      const diff = now - d;
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="photo-feed-page">
        <SEO title="Community - Chocly" description="See what chocolate lovers are sharing. Browse photo reviews from the Chocly community." />
        <div className="feed-container">
          <h1 className="feed-title">Community</h1>
          <p className="feed-loading">Loading photo reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-feed-page">
      <SEO title="Community - Chocly" description="See what chocolate lovers are sharing. Browse photo reviews from the Chocly community." />

      <div className="feed-container">
        <h1 className="feed-title">Community</h1>
        <p className="feed-subtitle">Photo reviews from chocolate lovers</p>

        {reviews.length === 0 ? (
          <div className="feed-empty">
            <p>No photo reviews yet. Be the first to share a photo with your review!</p>
          </div>
        ) : (
          <div className="feed-list">
            {reviews.map(review => (
              <article key={review.id} className="feed-card">
                {/* User info */}
                <div className="feed-card-header">
                  <Link to={`/user/${review.userId}`} className="feed-user">
                    {review.userPhotoURL ? (
                      <img src={review.userPhotoURL} alt="" className="feed-avatar" />
                    ) : (
                      <div className="feed-avatar-placeholder">
                        {(review.userName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="feed-username">{review.userName || 'Anonymous'}</span>
                  </Link>
                  <span className="feed-time">{formatDate(review.createdAt)}</span>
                </div>

                {/* Photos */}
                <ReviewPhotoGallery photos={review.photoUrls} />

                {/* Chocolate info + rating */}
                <div className="feed-card-body">
                  {review.chocolate && (
                    <Link to={`/chocolate/${review.chocolate.id || review.chocolateId}`} className="feed-chocolate">
                      <span className="feed-chocolate-name">{review.chocolate.name}</span>
                      <span className="feed-chocolate-maker">{review.chocolate.maker}</span>
                    </Link>
                  )}

                  <div className="feed-rating">
                    <RatingStars rating={review.rating} size="small" />
                  </div>

                  {review.text && (
                    <p className="feed-text">
                      {review.text.length > 200 ? review.text.slice(0, 200) + '...' : review.text}
                    </p>
                  )}

                  <div className="feed-actions">
                    <LikeButton
                      reviewId={review.id}
                      initialLikeCount={review.likeCount || 0}
                      initialIsLiked={!!likeStatuses[review.id]}
                    />
                    <CommentSection
                      reviewId={review.id}
                      commentCount={review.commentCount || 0}
                    />
                    <ShareButton
                      title={`${review.chocolate?.name || 'Chocolate'} review on Chocly`}
                      text={`Check out this review of ${review.chocolate?.name || 'chocolate'} by ${review.chocolate?.maker || ''} on Chocly`}
                      url={`/chocolate/${review.chocolate?.id || review.chocolateId}`}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            className="feed-load-more"
            onClick={() => loadReviews(lastDoc)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PhotoFeedPage;
