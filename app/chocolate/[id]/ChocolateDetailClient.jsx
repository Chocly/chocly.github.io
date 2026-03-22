'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../src/firebase';
import RatingStars from '../../../src/components/RatingStars';
import ReviewItem from '../../../src/components/ReviewItem';
import FavoriteButton from '../../../src/components/FavoriteButton';
import WantToTryButton from '../../../src/components/WantToTryButton';
import Breadcrumb from '../../../src/components/Breadcrumb';
import ShareButton from '../../../src/components/ShareButton';
import QuickReviewCTA from '../../../src/components/QuickReviewCTA';
import { useAuth } from '../../../src/contexts/AuthContext';
import { addReview } from '../../../src/services/reviewService';
import { getUserLikeStatuses } from '../../../src/services/likeService';
import { formatReviewerName } from '../../../src/utils/nameFormatter';
import { isSuperAdmin } from '../../../src/config/adminConfig';
import '../../../src/views/ChocolateDetailPage.css';

export default function ChocolateDetailClient({ chocolateId, serverChocolate, serverReviews }) {
  const router = useRouter();
  const [chocolate, setChocolate] = useState(serverChocolate);
  const [reviews, setReviews] = useState(serverReviews || []);
  const [tags, setTags] = useState(serverChocolate?.tags || []);
  const [loading, setLoading] = useState(!serverChocolate);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [likeStatuses, setLikeStatuses] = useState({});
  const { currentUser } = useAuth();

  const id = chocolateId;

  // Fetch fresh reviews client-side and load like statuses
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

      // Deduplicate by userId
      const uniqueReviews = [];
      const seenUserIds = new Set();
      for (const review of reviewsData) {
        if (review.userId && !seenUserIds.has(review.userId)) {
          uniqueReviews.push(review);
          seenUserIds.add(review.userId);
        } else if (!review.userId) {
          uniqueReviews.push(review);
        }
      }

      setReviews(uniqueReviews);

      if (currentUser && uniqueReviews.length > 0) {
        try {
          const reviewIds = uniqueReviews.map(r => r.id);
          const statuses = await getUserLikeStatuses(reviewIds, currentUser.uid);
          setLikeStatuses(statuses);
        } catch (err) {
          console.error('Error fetching like statuses:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Refresh reviews client-side on mount (to get latest + like statuses)
  useEffect(() => {
    if (id && currentUser) {
      fetchReviews();
    }
  }, [id, currentUser]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { alert('Please sign in to leave a review'); return; }
    if (userRating === 0) { alert('Please select a rating'); return; }
    if (!reviewText.trim()) { alert('Please write a review'); return; }

    try {
      const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User';
      const reviewData = {
        chocolateId: id,
        userId: currentUser.uid,
        user: fullName,
        userName: fullName,
        displayName: formatReviewerName(fullName),
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
      setUserRating(0);
      setReviewText('');
      setReviewSuccess(true);
      await fetchReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const handleQuickReview = async (reviewData) => {
    try {
      const existingUserReview = reviews.find(review => review.userId === currentUser?.uid);
      if (existingUserReview) {
        await fetchReviews();
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
        return;
      }

      const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User';
      const reviewToSubmit = {
        chocolateId: reviewData.chocolateId || id,
        userId: currentUser.uid,
        rating: reviewData.rating,
        text: reviewData.text || '',
        user: fullName,
        userName: fullName,
        displayName: formatReviewerName(fullName),
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

  const userHasReviewed = reviews.some(review => review.userId === currentUser?.uid);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-animation"><span></span><span></span><span></span></div>
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
            <p>Sorry, we couldn&apos;t find the chocolate you&apos;re looking for.</p>
            <Link href="/browse" className="btn btn-primary">Browse All Chocolates</Link>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : chocolate.averageRating || 0;

  return (
    <div className="chocolate-detail-page">
      <Breadcrumb items={[
        { label: 'Home', path: '/' },
        { label: 'Browse', path: '/browse' },
        { label: chocolate.name }
      ]} />

      <div className="detail-header">
        <div className="container">
          <div className="detail-header-content">
            <div className="detail-image">
              <img
                src={chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate'}
                alt={`${chocolate.name} by ${chocolate.maker} - ${chocolate.cacaoPercentage || ''}% chocolate bar`}
              />
              {isSuperAdmin(currentUser) && (
                <button
                  onClick={() => router.push(`/chocolate/${chocolate.id}/edit`)}
                  className="super-admin-edit-btn"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', marginTop: '15px', fontWeight: 'bold', display: 'block',
                    width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Super Admin Edit
                </button>
              )}
            </div>

            <div className="detail-info">
              <div className="chocolate-header-minimal">
                <Link
                  href={`/maker?maker=${encodeURIComponent(chocolate.maker || 'Unknown Maker')}`}
                  className="maker-link-minimal"
                >
                  <span className="maker-name-minimal">{chocolate.maker || 'Unknown Maker'}</span>
                </Link>

                <h1 className="chocolate-name-minimal">{chocolate.name}</h1>

                <div className="chocolate-characteristics">
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

                  {(chocolate.flavorNotes || tags.length > 0) && (
                    <div className="characteristics-divider">&bull;</div>
                  )}

                  {(chocolate.flavorNotes || tags.length > 0) && (
                    <div className="flavor-group">
                      {chocolate.flavorNotes && chocolate.flavorNotes.slice(0, 3).map((note, index) => (
                        <button
                          key={`note-${index}`}
                          className="flavor-note"
                          onClick={() => router.push(`/browse?flavor=${note}`)}
                          title={`Find more ${note} chocolates`}
                        >
                          {note}
                        </button>
                      ))}
                      {tags.slice(0, 2).map((tag, index) => (
                        <button
                          key={`tag-${index}`}
                          className="flavor-note secondary"
                          onClick={() => router.push(`/browse?tag=${tag}`)}
                          title={`Find more ${tag} chocolates`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rating-minimal">
                  <span className="rating-value">{averageRating.toFixed(1)}</span>
                  <RatingStars rating={averageRating} />
                  <span className="review-count-minimal">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {(chocolate.description || chocolate.details || chocolate.subtitle) && (
                  <p className="chocolate-description-minimal">
                    {chocolate.description || chocolate.details || chocolate.subtitle}
                  </p>
                )}

                <QuickReviewCTA
                  chocolateId={chocolate.id}
                  chocolateName={chocolate.name}
                  onQuickReview={handleQuickReview}
                  hasUserReviewed={userHasReviewed}
                  existingReview={userHasReviewed ? reviews.find(review => review.userId === currentUser?.uid) : null}
                />

                <div className="action-buttons-minimal">
                  <FavoriteButton chocolateId={chocolate.id} size="large" className="detail-page-favorite" showText={true} />
                  <WantToTryButton chocolate={chocolate} currentUser={currentUser} className="detail-page-want-to-try" showText={true} size="large" />
                  <ShareButton title={`${chocolate.name} by ${chocolate.maker}`} text={`Check out ${chocolate.name} by ${chocolate.maker} on Chocly`} url={`/chocolate/${chocolate.id}`} className="share-detail" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="reviews-section">
          <h3>Customer Reviews for {chocolate.name} ({reviews.length})</h3>

          {reviewSuccess && (
            <div className="review-success-message">Your review has been added successfully!</div>
          )}

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} isLiked={!!likeStatuses[review.id]} />
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <h4>Be the First to Review {chocolate.name}</h4>
              <p>Share your experience with {chocolate.name} by {chocolate.maker}.
                Help other chocolate lovers discover this {chocolate.cacaoPercentage}% {chocolate.type?.toLowerCase()} chocolate.</p>
              {!currentUser && (
                <p><Link href="/auth">Sign in</Link> to write the first review of {chocolate.name}.</p>
              )}
            </div>
          )}
        </section>

        <section className="seo-section-collapsed">
          <h3>Where to Buy {chocolate.name}</h3>
          <p className="seo-summary">
            Find <span className="highlight">{chocolate.name}</span> at specialty chocolate shops,
            gourmet food stores, and online retailers.
            Available directly from {chocolate.maker}&apos;s website or at local artisan markets.
          </p>
          <details className="seo-expandable">
            <summary>Shopping options &amp; availability</summary>
            <div className="seo-expandable-content">
              <p><strong>Price comparison coming soon</strong> &ndash; We&apos;re building tools to help you find the best prices across retailers.</p>
              <ul>
                <li>Specialty chocolate boutiques</li>
                <li>Online gourmet retailers</li>
                <li>Direct from {chocolate.maker}</li>
                <li>Local farmer&apos;s markets</li>
              </ul>
              <p>
                Explore more{' '}
                <Link href={`/browse?cacao=${chocolate.cacaoPercentage}`}>
                  {chocolate.cacaoPercentage}% chocolates
                </Link>
                {chocolate.origin && (
                  <>
                    {' '}or{' '}
                    <Link href={`/browse?origin=${chocolate.origin}`}>
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
