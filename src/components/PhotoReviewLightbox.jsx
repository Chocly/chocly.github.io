// src/components/PhotoReviewLightbox.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import './PhotoReviewLightbox.css';

function PhotoReviewLightbox({ photos, currentIndex, onClose, onNavigate }) {
  const touchStartX = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
  }, [onClose, onNavigate, currentIndex, photos.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
      if (diff < 0 && currentIndex > 0) onNavigate(currentIndex - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {photos.length > 1 && currentIndex > 0 && (
        <button
          className="lightbox-arrow lightbox-prev"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          aria-label="Previous photo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div
        className="lightbox-image-wrap"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={photos[currentIndex]}
          alt={`Photo ${currentIndex + 1} of ${photos.length}`}
          className="lightbox-image"
        />
      </div>

      {photos.length > 1 && currentIndex < photos.length - 1 && (
        <button
          className="lightbox-arrow lightbox-next"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          aria-label="Next photo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {photos.length > 1 && (
        <div className="lightbox-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export default PhotoReviewLightbox;
