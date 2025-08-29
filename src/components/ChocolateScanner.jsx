import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Add React Router navigation
import ChocolateCard from './ChocolateCard'; // Import your existing ChocolateCard component
import './ChocolateScanner.css'; // Import your existing CSS file

function ChocolateScanner() {
  const navigate = useNavigate(); // Initialize navigation hook
  const [chocolateDatabase, setChocolateDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load chocolate database from Firebase
  useEffect(() => {
    loadChocolateDatabase();
  }, []);

  const loadChocolateDatabase = async () => {
    try {
      // Import your Firebase service - path is correct!
      const { getAllChocolates } = await import('../services/chocolateFirebaseService');
      
      console.log('🔄 Loading chocolates from Firebase...');
      const chocolates = await getAllChocolates();
      
      // Filter only chocolates with images and map to needed format
      const chocolatesWithImages = chocolates
        .filter(chocolate => {
          // Filter out placeholders and missing images
          return chocolate.imageUrl && 
                 chocolate.imageUrl !== '/placeholder-chocolate.jpg' &&
                 !chocolate.imageUrl.includes('placehold.co');
        })
        .map(chocolate => ({
          id: chocolate.id,
          name: chocolate.name || 'Unnamed',
          maker: chocolate.maker || 'Unknown Maker',
          cocoaPercent: chocolate.cacaoPercentage || chocolate.cocoaPercent || 0,
          origin: chocolate.origin || 'Unknown',
          imageUrl: chocolate.imageUrl,
          averageRating: chocolate.averageRating || 0,
          reviewCount: chocolate.reviewCount || chocolate.ratings || 0,
          type: chocolate.type,
          description: chocolate.description
        }));
      
      console.log(`✅ Loaded ${chocolatesWithImages.length} chocolates with real images from Firebase`);
      setChocolateDatabase(chocolatesWithImages);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load database:', err);
      
      // Fallback to a smaller set of sample data if Firebase fails
      console.log('⚠️ Using fallback data');
      const fallbackData = [
        {
          id: 'fallback1',
          name: "Sample Dark Chocolate",
          maker: "Sample Maker",
          cocoaPercent: 70,
          origin: "Ecuador",
          imageUrl: "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Sample",
          averageRating: 4.5,
          reviewCount: 10
        }
      ];
      
      setChocolateDatabase(fallbackData);
      setError('Using limited database. Some features may be unavailable.');
      setLoading(false);
    }
  };

  // Create perceptual hash of image for comparison - IMPROVED ALGORITHM
  const createImageHash = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use 16x16 for better accuracy (was 8x8)
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        
        // Draw resized image with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        
        // Get pixel data and convert to grayscale
        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;
        
        const grayscale = [];
        for (let i = 0; i < pixels.length; i += 4) {
          // Better grayscale conversion
          const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
          grayscale.push(gray);
        }
        
        // Calculate median instead of average for better results
        const sorted = [...grayscale].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        
        // Create binary hash based on median
        const hash = grayscale.map(val => val > median ? 1 : 0).join('');
        
        resolve(hash);
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', imageUrl);
        resolve(null);
      };
      
      img.src = imageUrl;
    });
  };

  // Calculate similarity between two image hashes
  const calculateSimilarity = (hash1, hash2) => {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
    
    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    
    // Return similarity as percentage
    return (matches / hash1.length) * 100;
  };

  // Extract dominant colors for additional matching
  const extractDominantColors = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Sample image at lower resolution
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        
        const imageData = ctx.getImageData(0, 0, 50, 50);
        const pixels = imageData.data;
        
        // Count color frequencies (quantized to reduce variations)
        const colorCounts = {};
        
        for (let i = 0; i < pixels.length; i += 4) {
          // Quantize colors to 32 levels
          const r = Math.floor(pixels[i] / 32) * 32;
          const g = Math.floor(pixels[i + 1] / 32) * 32;
          const b = Math.floor(pixels[i + 2] / 32) * 32;
          
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        
        // Get top 5 dominant colors
        const topColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([color]) => color);
        
        resolve(topColors);
      };
      
      img.onerror = () => {
        resolve([]);
      };
      
      img.src = imageUrl;
    });
  };

  // Compare color palettes between images
  const compareColors = (colors1, colors2) => {
    if (!colors1.length || !colors2.length) return 0;
    
    let matchCount = 0;
    colors1.forEach(color1 => {
      if (colors2.includes(color1)) {
        matchCount++;
      }
    });
    
    return (matchCount / Math.max(colors1.length, colors2.length)) * 100;
  };

  // Add text extraction for brand names (optional fallback)
  const extractTextFromImage = async (imageUrl) => {
    // This is a placeholder - you'd need to implement OCR here
    // For now, we'll use filename parsing as a simple fallback
    return null;
  };

  // Enhanced matching with multiple strategies
  const performVisualMatching = async (uploadedImageUrl, uploadedFileName = '') => {
    setIsScanning(true);
    setProgress(0);
    setError('');
    setMatches([]);

    try {
      // Step 1: Process uploaded image
      setProgress(20);
      const uploadedHash = await createImageHash(uploadedImageUrl);
      const uploadedColors = await extractDominantColors(uploadedImageUrl);
      
      console.log('📸 Uploaded Image Analysis:', {
        hash: uploadedHash?.substring(0, 20) + '...',
        colors: uploadedColors,
        imageUrl: uploadedImageUrl,
        fileName: uploadedFileName
      });
      
      if (!uploadedHash) {
        throw new Error('Could not process uploaded image');
      }
      
      // Extract possible brand from filename
      const fileNameLower = uploadedFileName.toLowerCase();
      const knownBrands = [...new Set(chocolateDatabase.map(c => c.maker?.toLowerCase()).filter(Boolean))];
      const detectedBrand = knownBrands.find(brand => fileNameLower.includes(brand));
      
      if (detectedBrand) {
        console.log('🏷️ Detected brand from filename:', detectedBrand);
      }
      
      setProgress(40);
      
      // Step 2: Process in batches for better performance
      const results = [];
      const batchSize = 10;
      const totalChocolates = chocolateDatabase.length;
      
      console.log(`🔍 Comparing against ${totalChocolates} chocolates...`);
      
      for (let i = 0; i < totalChocolates; i += batchSize) {
        const batch = chocolateDatabase.slice(i, Math.min(i + batchSize, totalChocolates));
        
        // Process batch in parallel
        const batchPromises = batch.map(async (chocolate) => {
          if (!chocolate.imageUrl) return null;
          
          // Calculate visual similarities
          const [chocolateHash, chocolateColors] = await Promise.all([
            createImageHash(chocolate.imageUrl),
            extractDominantColors(chocolate.imageUrl)
          ]);
          
          const hashSimilarity = calculateSimilarity(uploadedHash, chocolateHash);
          const colorSimilarity = compareColors(uploadedColors, chocolateColors);
          
          // Base visual score
          let visualScore = (hashSimilarity * 0.7 + colorSimilarity * 0.3);
          
          // Boost score if brand matches
          if (detectedBrand && chocolate.maker?.toLowerCase() === detectedBrand) {
            visualScore = Math.min(visualScore + 30, 100);
            console.log(`🎯 Brand match boost for ${chocolate.name}: +30 points`);
          }
          
          // Debug high scores
          if (visualScore > 40) {
            console.log(`🎯 Potential match: ${chocolate.name}`, {
              maker: chocolate.maker,
              hashSim: hashSimilarity.toFixed(1),
              colorSim: colorSimilarity.toFixed(1),
              totalScore: visualScore.toFixed(1),
              brandMatch: detectedBrand && chocolate.maker?.toLowerCase() === detectedBrand
            });
          }
          
          // Lower threshold for more matches
          if (visualScore > 25) {
            return {
              ...chocolate,
              confidence: visualScore / 100,
              matchScore: visualScore,
              hashSimilarity,
              colorSimilarity,
              isBrandMatch: detectedBrand && chocolate.maker?.toLowerCase() === detectedBrand
            };
          }
          return null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean));
        
        // Update progress smoothly (no decimals)
        const progressValue = Math.round(40 + ((i + batchSize) / totalChocolates) * 50);
        setProgress(Math.min(progressValue, 90));
      }
      
      // Sort by best match first (prioritize brand matches)
      results.sort((a, b) => {
        // Brand matches go first
        if (a.isBrandMatch && !b.isBrandMatch) return -1;
        if (!a.isBrandMatch && b.isBrandMatch) return 1;
        // Then sort by score
        return b.matchScore - a.matchScore;
      });
      
      console.log(`✅ Found ${results.length} matches above threshold`);
      if (results.length > 0) {
        console.log('🏆 Best match:', results[0].name, 'Score:', results[0].matchScore.toFixed(1));
      }
      
      setProgress(100);
      setMatches(results.slice(0, 10)); // Top 10 matches
      
      if (results.length === 0) {
        setError('No visual matches found. Try a clearer photo or this might be a new chocolate.');
      }
      
    } catch (err) {
      console.error('Visual matching error:', err);
      setError('Failed to match image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setUploadedImage(file);
    const imageUrl = URL.createObjectURL(file);
    
    // Pass filename to help with matching
    await performVisualMatching(imageUrl, file.name);
    
    URL.revokeObjectURL(imageUrl);
  };

  // Navigate to chocolate detail page
  const handleChocolateClick = (chocolateId) => {
    navigate(`/chocolate/${chocolateId}`);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Could not access camera. Please use file upload.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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
    
    canvas.toBlob(async (blob) => {
      const imageUrl = URL.createObjectURL(blob);
      await performVisualMatching(imageUrl);
      URL.revokeObjectURL(imageUrl);
    }, 'image/jpeg', 0.9);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="scanner-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Visual Database</h2>
            <p>Preparing chocolate images for matching...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <div className="container">
        <header className="scanner-header">
          <h1>🍫 Visual Chocolate Scanner</h1>
          <p className="scanner-subtitle">
            Upload or capture a photo for instant visual matching
          </p>
          <div className="scanner-stats">
            {chocolateDatabase.length} chocolates ready for visual recognition
          </div>
        </header>

        <div className="scanner-card">
          {/* Camera Section */}
          <section className="scanner-section">
            <h2 className="section-title">
              <span className="section-icon">📸</span>
              Camera Scanner
            </h2>
            
            {!cameraActive ? (
              <div className="camera-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>Camera ready to scan chocolate packaging</p>
                <button 
                  onClick={startCamera}
                  className="btn btn-primary btn-large"
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
                      <span className="scan-hint">Position chocolate here</span>
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
                  <button 
                    onClick={stopCamera}
                    className="btn btn-secondary"
                  >
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
            >
              <div className="upload-icon">⬆️</div>
              <h3>Choose Image</h3>
              <p>Select a photo of chocolate packaging</p>
            </div>
          </section>

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
                  Analyzing visual features... {Math.round(progress)}%
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

        {/* Results */}
        {matches.length > 0 && (
          <div className="results-container">
            <h2 className="results-title">🎯 Visual Matches Found</h2>
            
            {/* Best Match */}
            {matches[0] && (
              <div className="best-match-card">
                <div className="best-match-header">
                  <h2>Best Visual Match</h2>
                  <div className="confidence-indicator">
                    <span className="confidence-value">
                      {Math.round(matches[0].confidence * 100)}% Match
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
                      />
                    </div>
                  )}
                  
                  <div className="match-details">
                    <h3>{matches[0].name}</h3>
                    <p className="card-maker">{matches[0].maker}</p>
                    <div className="card-details">
                      <span className="origin">{matches[0].origin}</span>
                      <span className="percentage">{matches[0].cocoaPercent}% Cocoa</span>
                    </div>
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
                  </div>
                </div>
              </div>
            )}

            {/* Other Matches - Using ChocolateCard component */}
            {matches.length > 1 && (
              <div className="other-matches-card">
                <div className="other-matches-header">
                  <h3>Other Possible Matches</h3>
                </div>
                
                <div className="chocolate-grid">
                  {matches.slice(1).map((chocolate) => (
                    <div key={chocolate.id} style={{ position: 'relative' }}>
                      {/* Match confidence overlay */}
                      <div className="match-confidence-badge" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: chocolate.confidence > 0.6 ? '#6C6C4E' : '#788990',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        zIndex: 10
                      }}>
                        {Math.round(chocolate.confidence * 100)}% Match
                      </div>
                      {/* Use the actual ChocolateCard component */}
                      <ChocolateCard 
                        chocolate={chocolate}
                        className="scanner-match-card"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No matches */}
        {!isScanning && matches.length === 0 && uploadedImage && (
          <div className="no-matches-card">
            <div className="no-matches-content">
              <div className="no-matches-icon">🤔</div>
              <h3>No Visual Matches Found</h3>
              <p>
                This chocolate's packaging doesn't match any in our visual database.
              </p>
              <p className="no-matches-suggestion">
                This might be a new chocolate we haven't catalogued yet!
              </p>
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ChocolateScanner;