import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChocolates } from '../services/chocolateFirebaseService';
import './ChocolateScanner.css';

function ChocolateScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [chocolateDatabase, setChocolateDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDebugText, setShowDebugText] = useState(false);
  
  const navigate = useNavigate();

  // Navigate to chocolate detail
  const viewChocolateDetails = (chocolateId) => {
    navigate(`/chocolate/${chocolateId}`);
  };
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load chocolate database
  useEffect(() => {
    const loadChocolates = async () => {
      try {
        console.log('📥 Loading chocolate database...');
        const chocolates = await getAllChocolates();
        setChocolateDatabase(chocolates);
        console.log(`✅ Loaded ${chocolates.length} chocolates for scanning`);
      } catch (err) {
        console.error('❌ Failed to load chocolate database:', err);
        setError('Failed to load chocolate database. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadChocolates();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions or use file upload.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  // Enhanced chocolate search with multi-stage matching
  const searchChocolates = (text) => {
    const cleanedText = preprocessOCRText(text);
    const results = [];
    
    if (!cleanedText || chocolateDatabase.length === 0) return results;
    
    console.log('🔍 === ENHANCED MATCHING ALGORITHM ===');
    console.log('📝 Original text:', text);
    console.log('🧹 Cleaned text:', cleanedText);
    
    const words = cleanedText.split(/\s+/).filter(w => w.length > 2);
    const percentages = extractPercentages(text);
    
    chocolateDatabase.forEach((chocolate, index) => {
      let score = 0;
      const reasons = [];
      
      // STAGE 1: Exact brand/maker matching
      if (chocolate.maker) {
        const makerLower = chocolate.maker.toLowerCase();
        const makerWords = makerLower.split(/[\s&\-']+/).filter(w => w.length > 2);
        
        if (cleanedText.includes(makerLower)) {
          score += 100;
          reasons.push(`Exact maker: ${chocolate.maker}`);
        } else {
          let makerWordMatches = 0;
          makerWords.forEach(word => {
            if (words.includes(word)) {
              makerWordMatches++;
              score += 40;
            }
          });
          if (makerWordMatches > 0) {
            reasons.push(`Maker words: ${makerWordMatches}/${makerWords.length}`);
          }
        }
        
        const fuzzyScore = fuzzyMatchMaker(chocolate.maker, words);
        if (fuzzyScore > 0) {
          score += fuzzyScore;
          reasons.push(`Fuzzy maker match`);
        }
      }
      
      // STAGE 2: Product name matching
      if (chocolate.name) {
        const nameWords = chocolate.name.toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 3 && !['dark', 'milk', 'white', 'chocolate', 'cacao', 'cocoa', 'bar'].includes(w));
        
        let nameMatches = 0;
        nameWords.forEach(word => {
          if (words.includes(word)) {
            nameMatches++;
            score += 30;
          }
        });
        
        if (nameMatches > 0) {
          reasons.push(`Product words: ${nameMatches}/${nameWords.length}`);
          if (nameMatches > 1) {
            score += nameMatches * 15;
            reasons.push(`Multi-name bonus`);
          }
        }
      }
      
      // STAGE 3: Percentage matching
      if (chocolate.cocoaPercent || chocolate.cacaoPercentage) {
        const chocolatePercent = chocolate.cocoaPercent || chocolate.cacaoPercentage;
        if (percentages.includes(chocolatePercent)) {
          score += 50;
          reasons.push(`${chocolatePercent}% match`);
        }
      }
      
      // STAGE 4: Origin and type matching
      if (chocolate.origin) {
        const originWords = chocolate.origin.toLowerCase().split(/\s+/);
        originWords.forEach(word => {
          if (word.length > 3 && words.includes(word)) {
            score += 25;
            reasons.push(`Origin: ${word}`);
          }
        });
      }
      
      if (chocolate.type) {
        const typeWords = [chocolate.type.toLowerCase()];
        if (chocolate.type === 'dark') typeWords.push('noir', 'black');
        if (chocolate.type === 'milk') typeWords.push('lait', 'creamy');
        
        typeWords.forEach(typeWord => {
          if (words.includes(typeWord)) {
            score += 20;
            reasons.push(`Type: ${typeWord}`);
          }
        });
      }
      
      if (score > 30) {
        const confidence = Math.min(score / 120, 0.95);
        results.push({
          ...chocolate,
          confidence,
          matchReasons: reasons,
          searchScore: score
        });
      }
    });
    
    return results.sort((a, b) => b.searchScore - a.searchScore).slice(0, 4);
  };

  // Helper functions
  const preprocessOCRText = (text) => {
    return text
      .toLowerCase()
      .replace(/[0o]/g, 'o')
      .replace(/[1il|]/g, 'l')
      .replace(/[5s]/g, 's')
      .replace(/[6g]/g, 'g')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s%]/g, ' ')
      .trim();
  };

  const extractPercentages = (text) => {
    const percentageMatches = text.match(/(\d{1,3})\s*%/g);
    if (!percentageMatches) return [];
    
    return percentageMatches.map(match => {
      const num = parseInt(match.match(/\d+/)[0]);
      return num >= 30 && num <= 100 ? num : null;
    }).filter(Boolean);
  };

  const fuzzyMatchMaker = (makerName, words) => {
    const commonMakerPatterns = {
      'compartés': ['compartes', 'compar', 'ghogolattier', 'chocolatier'],
      'lindt': ['lint', 'lind', 'linot'],
      'ghirardelli': ['ghirard', 'ghirar', 'girardelli'],
      'valrhona': ['valron', 'valrh', 'varhona'],
      'tony\'s chocolonely': ['tonys', 'tony', 'chocolonely'],
      'endangered species': ['endangered', 'species'],
      'green & blacks': ['green', 'blacks'],
      'theo': ['theo', 'thea']
    };
    
    const makerLower = makerName.toLowerCase();
    if (commonMakerPatterns[makerLower]) {
      for (const pattern of commonMakerPatterns[makerLower]) {
        if (words.some(word => word.includes(pattern) || pattern.includes(word))) {
          return 60;
        }
      }
    }
    
    return 0;
  };

  // Handle file upload with OCR
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please use an image smaller than 10MB.');
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setError('');
    setExtractedText('');
    setMatches([]);

    try {
      console.log('🔍 Processing image:', file.name);
      
      const imageUrl = URL.createObjectURL(file);
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
      });
      
      URL.revokeObjectURL(imageUrl);
      
      const text = result.data.text;
      console.log('📝 Extracted text:', text);
      setExtractedText(text);
      
      if (!text.trim()) {
        setError('No text found in the image. Try a clearer image with more readable text.');
        return;
      }
      
      const results = searchChocolates(text);
      setMatches(results);
      
      if (results.length === 0) {
        setError('No chocolates found matching the text. Try a clearer image with visible brand names or percentages.');
      }
      
    } catch (err) {
      console.error('❌ OCR error:', err);
      setError(`Failed to process image. Please try again with a different image.`);
    } finally {
      setIsScanning(false);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="scanner-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Chocolate Database</h2>
            <p>Preparing {chocolateDatabase.length || 'your'} chocolates for scanning...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <div className="container">
        {/* Page Header */}
        <header className="scanner-header">
          <h1>🍫 Scan Any Chocolate</h1>
          <p className="scanner-subtitle">
            Point your camera at any chocolate label for instant reviews and ratings
          </p>
          <div className="scanner-stats">
            {chocolateDatabase.length.toLocaleString()} chocolates ready to identify
          </div>
        </header>

        {/* Main Scanner Card */}
        <div className="scanner-card">
          {/* Camera Section */}
          <section className="scanner-section">
            <h2 className="section-title">
              <span className="section-icon">📸</span>
              Camera Scanner
            </h2>
            
            {!cameraActive ? (
              <div className="camera-placeholder">
                <div className="placeholder-icon">📱</div>
                <p>Use your camera to scan chocolate labels instantly</p>
                <button onClick={startCamera} className="btn btn-primary">
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
                    muted
                    className="camera-video"
                  />
                  <div className="camera-overlay">
                    <div className="scan-frame">
                      <div className="scan-content">
                        <div className="scan-icon">🍫</div>
                        <div className="scan-text">Position chocolate label here</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="camera-controls">
                  <button 
                    onClick={handleFileUpload}
                    disabled={isScanning}
                    className="btn btn-primary"
                  >
                    {isScanning ? '🔍 Scanning...' : '📸 Capture & Scan'}
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
              Upload Photo
            </h2>
            
            <div className="upload-area">
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Choose a photo from your device</h3>
                <p>Best results with clear, well-lit photos of chocolate packaging</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="file-input"
                  disabled={isScanning}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="btn btn-primary"
                >
                  Choose Photo
                </button>
              </div>
            </div>
          </section>

          {/* Progress Section */}
          {isScanning && (
            <section className="scanner-section">
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span className="progress-icon">🔍</span>
                  Analyzing chocolate label... {progress}%
                </div>
              </div>
            </section>
          )}

          {/* Error Section */}
          {error && (
            <section className="scanner-section">
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            </section>
          )}
        </div>

        {/* Results Section */}
        {matches.length > 0 && !isScanning && (
          <div className="results-container">
            {/* Best Match */}
            <div className="best-match-card">
              <div className="best-match-header">
                <h2>🎯 Best Match Found!</h2>
                <p>{Math.round(matches[0].confidence * 100)}% confident this is your chocolate</p>
                <div className="match-badge">#1</div>
              </div>
              
              <div className="best-match-content">
                <button 
                  onClick={viewChocolateDetails(matches[0].id)}
                  className="chocolate-card featured"
                >
                  <div className="image-container">
                    <img 
                      src={matches[0].imageUrl || '/placeholder-chocolate.jpg'} 
                      alt={matches[0].name}
                      className="card-image" 
                    />
                  </div>
                  
                  <div className="card-content">
                    <p className="card-maker">{matches[0].maker || 'Unknown Maker'}</p>
                    <h3 className="card-title">{matches[0].name || 'Unnamed Chocolate'}</h3>
                    
                    <div className="card-details">
                      <span className="origin">{matches[0].origin || 'Unknown'}</span>
                      <span className="percentage">
                        {matches[0].cocoaPercent || matches[0].cacaoPercentage || 0}% Cacao
                      </span>
                    </div>
                    
                    <div className="card-rating">
                      <span className="rating-value">{(matches[0].averageRating || 0).toFixed(1)}</span>
                      <div className="stars">
                        {renderStars(matches[0].averageRating || 0)}
                      </div>
                      <span className="rating-count">
                        ({matches[0].reviewCount || matches[0].ratings || 0})
                      </span>
                    </div>
                  </div>
                </button>
                
                <div className="best-match-actions">
                  <button 
                    onClick={() => viewChocolateDetails(matches[0].id)}
                    className="btn btn-primary btn-large"
                  >
                    View Full Details & Reviews →
                  </button>
                </div>
                
                {matches[0].matchReasons && (
                  <div className="match-reasons">
                    <strong>Why this matches:</strong> {matches[0].matchReasons.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Other Matches */}
            {matches.length > 1 && (
              <div className="other-matches-card">
                <div className="other-matches-header">
                  <h3>Other Possible Matches ({matches.length - 1})</h3>
                </div>
                
                <div className="chocolate-grid">
                  {matches.slice(1).map((chocolate) => (
                    <button 
                      key={chocolate.id} 
                      onClick={() => viewChocolateDetails(chocolate.id)}
                      className="chocolate-card"
                    >
                      <div className="image-container">
                        <img 
                          src={chocolate.imageUrl || '/placeholder-chocolate.jpg'} 
                          alt={chocolate.name}
                          className="card-image" 
                        />
                      </div>
                      
                      <div className="card-content">
                        <div className="card-header">
                          <p className="card-maker">{chocolate.maker || 'Unknown Maker'}</p>
                          <span className="confidence-badge">
                            {Math.round(chocolate.confidence * 100)}%
                          </span>
                        </div>
                        
                        <h4 className="card-title">{chocolate.name || 'Unnamed Chocolate'}</h4>
                        
                        <div className="card-details">
                          <span className="origin">{chocolate.origin || 'Unknown'}</span>
                          <span className="percentage">
                            {chocolate.cocoaPercent || chocolate.cacaoPercentage || 0}%
                          </span>
                        </div>
                        
                        <div className="card-rating">
                          <span className="rating-value">{(chocolate.averageRating || 0).toFixed(1)}</span>
                          <div className="stars">
                            {renderStars(chocolate.averageRating || 0)}
                          </div>
                          <span className="rating-count">
                            ({chocolate.reviewCount || chocolate.ratings || 0})
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No matches found */}
        {!isScanning && extractedText && matches.length === 0 && (
          <div className="no-matches-card">
            <div className="no-matches-content">
              <div className="no-matches-icon">🤔</div>
              <h3>No Matches Found</h3>
              <p>
                We couldn't find this chocolate in our database of {chocolateDatabase.length.toLocaleString()} chocolates.
              </p>
              <p className="no-matches-suggestion">
                Try a clearer photo with visible brand names, or this might be a chocolate we don't have yet!
              </p>
              
              <button 
                onClick={() => setShowDebugText(!showDebugText)}
                className="debug-toggle"
              >
                {showDebugText ? 'Hide' : 'Show'} detected text
              </button>
              
              {showDebugText && extractedText && (
                <div className="debug-text">
                  <strong>Detected text:</strong>
                  <pre>{extractedText}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ChocolateScanner;