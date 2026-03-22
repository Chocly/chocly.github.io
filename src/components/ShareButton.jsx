// src/components/ShareButton.jsx
import React, { useState } from 'react';
import './ShareButton.css';

function ShareButton({ title, text, url, className = '' }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http')
    ? url
    : `${typeof window !== 'undefined' ? window.location.origin : 'https://chocly.co'}${url}`;

  const handleShare = async (e) => {
    e.stopPropagation();

    // Use native Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
      } catch (err) {
        // User cancelled — not an error
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
      return;
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      className={`share-button ${copied ? 'share-copied' : ''} ${className}`}
      onClick={handleShare}
      aria-label="Share"
      type="button"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="share-label">Copied</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="share-label">Share</span>
        </>
      )}
    </button>
  );
}

export default ShareButton;
