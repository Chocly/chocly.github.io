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

  // Load chocolate database from Firebase
  useEffect(() => {
    loadChocolateDatabase();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const loadChocolateDatabase = async () => {
    try {
      const { getAllChocolates } = await import('../services/chocolateFirebaseService');
      const chocolates = await getAllChocolates();

      // Include all chocolates that have a name (no image filter needed — we match on text)
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

  // ── Core identification flow ──────────────────────────────────────────

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

      // Fuzzy match against database
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

  // ── File upload ───────────────────────────────────────────────────────

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

  // ── Camera ────────────────────────────────────────────────────────────

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

  // ── Navigation ────────────────────────────────────────────────────────

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
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Chocolate Database</h2>
            <p>Preparing to identify chocolates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <div className="container">
        <header className="scanner-header">
          <h1>Identify Chocolate</h1>
          <p className="scanner-subtitle">
            Take a photo or upload an image of any chocolate label
          </p>
          <div className="scanner-stats">
            {chocolateDatabase.length} chocolates in our database
          </div>
        </header>

        <div className="scanner-card">
          {/* Camera Section */}
          <section className="scanner-section">
            <h2 className="section-title">
              <span className="section-icon">📸</span>
              Camera
            </h2>

            {!cameraActive ? (
              <div className="camera-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>Snap a photo of chocolate packaging</p>
                <button
                  onClick={startCamera}
                  className="btn btn-primary btn-large"
                  disabled={isScanning}
                >
                  Start Camera
                </button>
              </div>
            ) : (
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
                      <span className="scan-hint">Position chocolate label here</span>
                    </div>
                  </div>
                </div>
                <div className="camera-controls">
                  <button
                    onClick={capturePhoto}
                    className="btn btn-primary btn-large"
                    disabled={isScanning}
                  >
                    {isScanning ? 'Processing...' : 'Capture Photo'}
                  </button>
                  <button onClick={stopCamera} className="btn btn-secondary">
                    Stop Camera
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* File Upload Section */}
          <section className="scanner-section">
            <h2 className="section-title">
              <span className="section-icon">📁</span>
              Upload Image
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="upload-area"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className="upload-icon">⬆️</div>
              <h3>Choose Image</h3>
              <p>Select a photo of chocolate packaging</p>
            </div>
          </section>

          {/* Image Preview */}
          {imagePreview && (
            <section className="scanner-section">
              <div className="image-preview-header">
                <h2 className="section-title">
                  <span className="section-icon">📷</span>
                  Your Photo
                </h2>
                {!isScanning && (
                  <button onClick={resetScanner} className="btn btn-secondary btn-small">
                    Scan Another
                  </button>
                )}
              </div>
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Uploaded chocolate"
                  className="image-preview"
                />
              </div>
            </section>
          )}

          {/* Progress Bar */}
          {isScanning && (
            <section className="scanner-section">
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="progress-text">
                  {progress < 60
                    ? 'Analyzing chocolate label...'
                    : 'Searching our database...'}
                  {' '}{Math.round(progress)}%
                </p>
              </div>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <section className="scanner-section">
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            </section>
          )}
        </div>

        {/* Detection Result */}
        {visionResult && visionResult.confidence !== 'none' && (
          <div className="detection-result">
            <h3>We detected:</h3>
            <div className="detection-details">
              {visionResult.brand && (
                <span className="detection-tag">
                  <strong>Brand:</strong> {visionResult.brand}
                </span>
              )}
              {visionResult.productName && (
                <span className="detection-tag">
                  <strong>Product:</strong> {visionResult.productName}
                </span>
              )}
              {visionResult.type && (
                <span className="detection-tag">
                  <strong>Type:</strong> {visionResult.type}
                </span>
              )}
              {visionResult.cacaoPercentage && (
                <span className="detection-tag">
                  {visionResult.cacaoPercentage}% Cacao
                </span>
              )}
              {visionResult.origin && (
                <span className="detection-tag">
                  <strong>Origin:</strong> {visionResult.origin}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div className="results-container">
            <h2 className="results-title">Matches Found</h2>

            {/* Best Match */}
            {matches[0] && (
              <div className="best-match-card">
                <div className="best-match-header">
                  <h2>Best Match</h2>
                  <div className="confidence-indicator">
                    <span className="confidence-value">
                      {Math.round(matches[0].matchScore)}% Match
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => handleChocolateClick(matches[0].id)}
                  className="best-match-content chocolate-card"
                  style={{ cursor: 'pointer' }}
                >
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
                    <p className="card-maker">{matches[0].maker}</p>
                    <div className="card-details">
                      {matches[0].origin && matches[0].origin !== 'Unknown' && (
                        <span className="origin">{matches[0].origin}</span>
                      )}
                      {matches[0].cocoaPercent > 0 && (
                        <span className="percentage">
                          {matches[0].cocoaPercent}% Cocoa
                        </span>
                      )}
                    </div>
                    {matches[0].averageRating > 0 && (
                      <div className="card-rating">
                        <span className="rating-value">
                          {matches[0].averageRating?.toFixed(1)}
                        </span>
                        <div className="stars">
                          {'★'.repeat(Math.floor(matches[0].averageRating || 0))}
                          {'☆'.repeat(5 - Math.floor(matches[0].averageRating || 0))}
                        </div>
                        <span className="rating-count">
                          ({matches[0].reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Matches */}
            {matches.length > 1 && (
              <div className="other-matches-card">
                <div className="other-matches-header">
                  <h3>Other Possible Matches</h3>
                </div>

                <div className="chocolate-grid">
                  {matches.slice(1).map((chocolate) => (
                    <div key={chocolate.id} style={{ position: 'relative' }}>
                      <div
                        className="match-confidence-badge"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background:
                            chocolate.matchScore > 60 ? '#6C6C4E' : '#788990',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          zIndex: 10,
                        }}
                      >
                        {Math.round(chocolate.matchScore)}% Match
                      </div>
                      <ChocolateCard chocolate={chocolate} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback actions */}
            <div className="fallback-actions">
              <p>Not what you're looking for?</p>
              <div className="fallback-buttons">
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
                <Link to="/add-chocolate" className="btn btn-secondary">
                  Add This Chocolate
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No matches but vision result exists */}
        {!isScanning &&
          matches.length === 0 &&
          visionResult &&
          visionResult.confidence !== 'none' && (
            <div className="no-matches-card">
              <div className="no-matches-content">
                <div className="no-matches-icon">🤔</div>
                <h3>Not in Our Database Yet</h3>
                <p>
                  We identified{' '}
                  {[visionResult.brand, visionResult.productName]
                    .filter(Boolean)
                    .join(' — ') || 'this chocolate'}
                  , but it's not in our database yet.
                </p>
                <div className="fallback-buttons">
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
            </div>
          )}

        {/* Hidden canvas for camera capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ChocolateScanner;
