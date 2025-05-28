// src/components/FavoriteButton.jsx - Beautiful production version
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite, isChocolateFavorited } from '../services/userService';
import './FavoriteButton.css';

function FavoriteButton({ chocolateId, size = 'medium', className = '' }) {
  const { currentUser } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if chocolate is favorited when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (currentUser && chocolateId) {
        try {
          const favorited = await isChocolateFavorited(currentUser.uid, chocolateId);
          setIsFavorited(favorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [currentUser, chocolateId]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Please sign in to save favorites!');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setIsAnimating(true);
      
      const newFavoriteStatus = await toggleFavorite(currentUser.uid, chocolateId);
      setIsFavorited(newFavoriteStatus);
      
      // Reset animation after it completes
      setTimeout(() => setIsAnimating(false), 600);
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`favorite-button ${size} ${isFavorited ? 'favorited' : ''} ${isAnimating ? 'animating' : ''} ${loading ? 'loading' : ''} ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        className="heart-icon" 
        viewBox="0 0 24 24" 
        fill={isFavorited ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      
      {loading && (
        <div className="loading-spinner">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="60">
              <animate attributeName="stroke-dashoffset" dur="1s" values="60;0" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      )}
    </button>
  );
}

export default FavoriteButton;