// src/components/WantToTryButton.jsx
import React, { useState, useEffect } from 'react';
import { addToWantToTry, removeFromWantToTry, isChocolateInWantToTry } from '../services/userService';
import './WantToTryButton.css';

function WantToTryButton({ 
  chocolate, 
  currentUser, 
  className = "", 
  showText = false, 
  size = "medium" 
}) {
  const [isInWantToTry, setIsInWantToTry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if chocolate is already in want to try list
  useEffect(() => {
    if (currentUser && chocolate) {
      checkWantToTryStatus();
    }
  }, [currentUser, chocolate]);

  const checkWantToTryStatus = async () => {
    try {
      const isInList = await isChocolateInWantToTry(currentUser.uid, chocolate.id);
      setIsInWantToTry(isInList);
    } catch (error) {
      console.error('Error checking want to try status:', error);
    }
  };

  const handleToggleWantToTry = async (e) => {
    e.preventDefault(); // Prevent navigation if button is in a card link
    e.stopPropagation(); // Stop event bubbling

    if (!currentUser) {
      alert('Please sign in to add chocolates to your want to try list');
      return;
    }

    setLoading(true);
    try {
      if (isInWantToTry) {
        // Remove from want to try list
        await removeFromWantToTry(currentUser.uid, chocolate);
        setIsInWantToTry(false);
        
        // Show feedback
        if (!showText) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
        }
      } else {
        // Add to want to try list
        await addToWantToTry(currentUser.uid, chocolate);
        setIsInWantToTry(true);
        
        // Show feedback
        if (!showText) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error updating want to try list:', error);
      alert('Failed to update want to try list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // Don't show button if user is not logged in
  }

  // Define button text based on state
  const getButtonText = () => {
    if (loading) return "Updating...";
    if (isInWantToTry) return "Added to List";
    return "Want to Try";
  };

  // Determine if this is a detail page button
  const isDetailPage = className.includes('detail-page');

  return (
    <div className={`want-to-try-container ${isDetailPage ? 'detail-page' : 'relative'}`}>
      <button
        onClick={handleToggleWantToTry}
        disabled={loading}
        className={`
          want-to-try-button
          ${showText || isDetailPage ? 'with-text' : 'icon-only'}
          ${size}
          ${isInWantToTry ? 'in-want-to-try' : ''}
          ${loading ? 'loading' : ''}
          ${className}
        `}
        title={isInWantToTry ? 'Remove from want to try list' : 'Add to want to try list'}
        aria-label={isInWantToTry ? 'Remove from want to try list' : 'Add to want to try list'}
      >
        {loading ? (
          <>
            <div className="loading-spinner" />
            {(showText || isDetailPage) && <span className="button-text">Updating...</span>}
          </>
        ) : (
          <>
            <svg 
              className="bookmark-icon" 
              fill={isInWantToTry ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            {(showText || isDetailPage) && (
              <span className="button-text">
                {getButtonText()}
              </span>
            )}
          </>
        )}
      </button>

      {/* Tooltip for icon-only buttons */}
      {!showText && !isDetailPage && showTooltip && (
        <div className="tooltip">
          {isInWantToTry ? 'Added to want to try!' : 'Removed from want to try!'}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
}

export default WantToTryButton;