// src/components/ReviewThankYouModal.jsx
import React, { useEffect } from 'react';
import './ReviewThankYouModal.css';

function ReviewThankYouModal({ isOpen, onClose, reviewerName = '' }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Success checkmark */}
        <div className="success-icon">
          <svg viewBox="0 0 52 52" className="checkmark">
            <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle"/>
            <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check"/>
          </svg>
        </div>
        
        {/* Thank you message */}
        <h2 className="thank-you-title">Thank You!</h2>
        <p className="thank-you-message">
          Your review has been submitted successfully.
        </p>
        <p className="thank-you-submessage">
          Your feedback helps other chocolate lovers discover great bars.
        </p>
        
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          Continue Browsing
        </button>
        
        {/* X close button in corner */}
        <button className="modal-x-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}

export default ReviewThankYouModal;