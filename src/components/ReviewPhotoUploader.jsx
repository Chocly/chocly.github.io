// src/components/ReviewPhotoUploader.jsx
import React, { useRef } from 'react';
import './ReviewPhotoUploader.css';

function ReviewPhotoUploader({ photos, onPhotosChange, existingUrls = [] }) {
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const totalCount = photos.length + existingUrls.length;
    const remaining = 3 - totalCount;

    if (remaining <= 0) {
      alert('Maximum 3 photos per review.');
      return;
    }

    const newFiles = files.slice(0, remaining);
    onPhotosChange([...photos, ...newFiles]);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeNewPhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const totalCount = photos.length + existingUrls.length;
  const canAddMore = totalCount < 3;

  return (
    <div className="photo-uploader">
      <div className="photo-uploader-strip">
        {/* Existing photo previews (editing) */}
        {existingUrls.map((url, i) => (
          <div key={`existing-${i}`} className="photo-preview">
            <img src={url} alt={`Existing photo ${i + 1}`} />
            <span className="photo-existing-badge">Saved</span>
          </div>
        ))}

        {/* New file previews */}
        {photos.map((file, i) => (
          <div key={`new-${i}`} className="photo-preview">
            <img src={URL.createObjectURL(file)} alt={`New photo ${i + 1}`} />
            <button
              type="button"
              className="photo-remove"
              onClick={() => removeNewPhoto(i)}
              aria-label={`Remove photo ${i + 1}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <button
            type="button"
            className="photo-add-btn"
            onClick={() => inputRef.current?.click()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>Add Photo</span>
          </button>
        )}
      </div>

      <div className="photo-counter">
        {totalCount}/3 photos
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="photo-file-input"
      />
    </div>
  );
}

export default ReviewPhotoUploader;
