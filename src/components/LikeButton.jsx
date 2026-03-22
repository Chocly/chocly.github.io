// src/components/LikeButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toggleLike } from '../services/likeService';
import './LikeButton.css';

function LikeButton({ reviewId, initialLikeCount = 0, initialIsLiked = false }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (loading) return;

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    setIsAnimating(true);

    try {
      setLoading(true);
      await toggleLike(reviewId, currentUser.uid);
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'like-animating' : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-label={isLiked ? 'Unlike this review' : 'Like this review'}
      aria-pressed={isLiked}
    >
      <svg
        className="like-heart"
        viewBox="0 0 24 24"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {likeCount > 0 && <span className="like-count">{likeCount}</span>}
    </button>
  );
}

export default LikeButton;
