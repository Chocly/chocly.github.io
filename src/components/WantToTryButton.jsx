// src/components/WantToTryButton.jsx
import React, { useState, useEffect } from 'react';
import { addToWantToTry, removeFromWantToTry, isChocolateInWantToTry } from '../services/userService';

function WantToTryButton({ chocolate, currentUser, className = "" }) {
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
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } else {
        // Add to want to try list
        await addToWantToTry(currentUser.uid, chocolate);
        setIsInWantToTry(true);
        
        // Show feedback
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
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

  return (
    <div className="relative">
      <button
        onClick={handleToggleWantToTry}
        disabled={loading}
        className={`
          relative flex items-center justify-center p-2 rounded-full transition-all duration-200
          ${isInWantToTry 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${className}
        `}
        title={isInWantToTry ? 'Remove from want to try list' : 'Add to want to try list'}
        aria-label={isInWantToTry ? 'Remove from want to try list' : 'Add to want to try list'}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          // Bookmark icon - using SVG instead of lucide-react
          <svg 
            className="w-4 h-4" 
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
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
          {isInWantToTry ? 'Added to want to try!' : 'Removed from want to try!'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
}

export default WantToTryButton;