// src/components/ReviewPhotoGallery.jsx
import React, { useState } from 'react';
import PhotoReviewLightbox from './PhotoReviewLightbox';
import './ReviewPhotoGallery.css';

function ReviewPhotoGallery({ photos }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const count = photos.length;
  const layoutClass = count === 1 ? 'single' : count === 2 ? 'double' : 'triple';

  return (
    <>
      <div className={`photo-gallery photo-gallery--${layoutClass}`}>
        {photos.slice(0, 3).map((url, i) => (
          <button
            key={i}
            className={`gallery-photo gallery-photo--${i}`}
            onClick={() => openLightbox(i)}
            aria-label={`View photo ${i + 1}`}
          >
            <img src={url} alt={`Review photo ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <PhotoReviewLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

export default ReviewPhotoGallery;
