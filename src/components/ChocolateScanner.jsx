import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChocolateCard from './ChocolateCard';
import './ChocolateScanner.css';

function ChocolateScanner() {
  const navigate = useNavigate();
  const [chocolateDatabase, setChocolateDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [visionResult, setVisionResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadChocolateDatabase();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const loadChocolateDatabase = async () => {
    try {
      const { getAllChocolates } = await import('../services/chocolateFirebaseService');
      const chocolates = await getAllChocolates();

      const chocolatesForMatching = chocolates
        .filter((c) => c.name)
        .map((c) => ({
          id: c.id,
          name: c.name || 'Unnamed',
          maker: c.maker || 'Unknown Maker',
          cocoaPercent: c.cacaoPercentage || c.cocoaPercent || 0,
          origin: c.origin || 'Unknown',
          imageUrl: c.imageUrl,
          averageRating: c.averageRating || 0,
          reviewCount: c.reviewCount || c.ratings || 0,
          type: c.type,
          description: c.description,
        }));

      setChocolateDatabase(chocolatesForMatching);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load database:', err);
      setChocolateDatabase([]);
      setError('Could not load chocolate database. Please refresh and try again.');
      setLoading(false);
    }
  };

  const identifyChocolate = async (imageBlob) => {
    setIsScanning(true);
    setProgress(0);
    setError('');
    setMatches([]);
    setVisionResult(null);

    try {
      setProgress(20);
      const { analyzeChocolateImage, findMatchingChocolates } = await import(
        '../services/visionService'
      );

      setProgress(40);
      const result = await analyzeChocolateImage(imageBlob);
      setProgress(60);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.data.confidence === 'none') {
        setError(
          'Could not identify a chocolate product in this image. Try a clearer photo of the label.'
        );
        setProgress(100);
        return;
      }

      setVisionResult(result.data);

      setProgress(80);
      const matchedChocolates = findMatchingChocolates(result.data, chocolateDatabase);
      setProgress(100);

      setMatches(matchedChocolates);

      if (matchedChocolates.length === 0) {
        setError(
          "We identified this chocolate but couldn't find it in our database yet."
        );
      }
    } catch (err) {
      console.error('Identification error:', err);
      setError(err.message || 'Failed to identify chocolate. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));

    await identifyChocolate(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch {
      setError('Could not access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
        await identifyChocolate(blob);
      },
      'image/jpeg',
      0.85
    );
  };

  const handleChocolateClick = (chocolateId) => {
    navigate(`/chocolate/${chocolateId}`);
  };

  const resetScanner = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setVisionResult(null);
    setMatches([]);
    setError('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="scanner-page">
        <div className="scanner-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading chocolate database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        {/* Minimal header */}
        <header className="scanner-header">
          <h1>Identify Chocolate</h1>
          <p className="scanner-subtitle">
            Snap a photo or upload an image of any chocolate label
          </p>
        </header>

        {/* Side-by-side input options */}
        {!cameraActive && !imagePreview && (
          <div className="scanner-input-grid">
            <button
              onClick={startCamera}
              className="input-card"
              disabled={isScanning}
            >
              <div className="input-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div className="input-card-text">
                <h3>Take Photo</h3>
                <p>Use your camera</p>
              </div>
            </button>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="input-card"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className="input-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="input-card-text">
                <h3>Upload Image</h3>
                <p>Choose from files</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Active camera view */}
        {cameraActive && (
          <div className="camera-container">
            <div className="camera-viewport">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <div className="camera-overlay">
                <div className="scan-frame">
                  <span className="scan-hint">Position label here</span>
                </div>
              </div>
            </div>
            <div className="camera-controls">
              <button
                onClick={capturePhoto}
                className="btn btn-primary"
                disabled={isScanning}
              >
                {isScanning ? 'Processing...' : 'Capture'}
              </button>
              <button onClick={stopCamera} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className="preview-section">
            <div className="preview-row">
              <img
                src={imagePreview}
                alt="Uploaded chocolate"
                className="image-preview"
              />
              <div className="preview-actions">
                {!isScanning && (
                  <button onClick={resetScanner} className="btn btn-secondary btn-small">
                    Scan Another
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isScanning && (
          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-text">
              {progress < 60 ? 'Analyzing label...' : 'Searching database...'}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        {/* Detection tags */}
        {visionResult && visionResult.confidence !== 'none' && (
          <div className="detection-result">
            <span className="detection-label">Detected:</span>
            <div className="detection-details">
              {visionResult.brand && (
                <span className="detection-tag">{visionResult.brand}</span>
              )}
              {visionResult.productName && (
                <span className="detection-tag">{visionResult.productName}</span>
              )}
              {visionResult.type && (
                <span className="detection-tag">{visionResult.type}</span>
              )}
              {visionResult.cacaoPercentage && (
                <span className="detection-tag">{visionResult.cacaoPercentage}%</span>
              )}
              {visionResult.origin && (
                <span className="detection-tag">{visionResult.origin}</span>
              )}
            </div>
          </div>
        )}

        {/* Best Match */}
        {matches.length > 0 && matches[0] && (
          <div
            className="best-match-card"
            onClick={() => handleChocolateClick(matches[0].id)}
          >
            <div className="best-match-label">
              <span className="best-match-text">Best Match</span>
              <span className="match-score-pill">
                {Math.round(matches[0].matchScore)}%
              </span>
            </div>
            <div className="best-match-content">
              {matches[0].imageUrl && (
                <div className="match-image">
                  <img
                    src={matches[0].imageUrl}
                    alt={matches[0].name}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="match-details">
                <h3>{matches[0].name}</h3>
                <p className="match-maker">{matches[0].maker}</p>
                <div className="match-meta">
                  {matches[0].origin && matches[0].origin !== 'Unknown' && (
                    <span>{matches[0].origin}</span>
                  )}
                  {matches[0].cocoaPercent > 0 && (
                    <span>{matches[0].cocoaPercent}% Cocoa</span>
                  )}
                </div>
                {matches[0].averageRating > 0 && (
                  <div className="match-rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(matches[0].averageRating || 0))}
                      {'☆'.repeat(5 - Math.floor(matches[0].averageRating || 0))}
                    </span>
                    <span className="rating-text">
                      {matches[0].averageRating?.toFixed(1)} ({matches[0].reviewCount})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Matches */}
        {matches.length > 1 && (
          <div className="other-matches">
            <h3 className="other-matches-title">Other Matches</h3>
            <div className="chocolate-grid">
              {matches.slice(1).map((chocolate) => (
                <div key={chocolate.id} style={{ position: 'relative' }}>
                  <span
                    className="match-confidence-badge"
                    style={{
                      background: chocolate.matchScore > 60
                        ? 'var(--brand-sage)'
                        : 'var(--brand-blue-gray)',
                    }}
                  >
                    {Math.round(chocolate.matchScore)}%
                  </span>
                  <ChocolateCard chocolate={chocolate} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback actions */}
        {matches.length > 0 && (
          <div className="fallback-actions">
            <span>Not the right match?</span>
            <Link
              to={`/search?query=${encodeURIComponent(
                [visionResult?.brand, visionResult?.productName]
                  .filter(Boolean)
                  .join(' ')
              )}`}
              className="btn btn-secondary btn-small"
            >
              Search by Text
            </Link>
            <Link to="/add-chocolate" className="btn btn-secondary btn-small">
              Add Chocolate
            </Link>
          </div>
        )}

        {/* No matches but vision result exists */}
        {!isScanning &&
          matches.length === 0 &&
          visionResult &&
          visionResult.confidence !== 'none' && (
            <div className="no-matches-card">
              <h3>Not in Our Database Yet</h3>
              <p>
                We identified{' '}
                <strong>
                  {[visionResult.brand, visionResult.productName]
                    .filter(Boolean)
                    .join(' — ') || 'this chocolate'}
                </strong>
                , but it's not in our database.
              </p>
              <div className="no-matches-actions">
                <Link to="/add-chocolate" className="btn btn-primary">
                  Add This Chocolate
                </Link>
                <Link
                  to={`/search?query=${encodeURIComponent(
                    [visionResult?.brand, visionResult?.productName]
                      .filter(Boolean)
                      .join(' ')
                  )}`}
                  className="btn btn-secondary"
                >
                  Search by Text
                </Link>
              </div>
            </div>
          )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ChocolateScanner;
