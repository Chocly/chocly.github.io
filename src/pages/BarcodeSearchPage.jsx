// src/pages/BarcodeSearchPage.jsx - Updated with Under Construction
import React from 'react';
import './BarcodeSearchPage.css';

function BarcodeSearchPage() {
  return (
    <div className="barcode-search-page">
      <div className="container">
        {/* Under Construction Banner */}
        <div className="construction-banner">
          <div className="construction-icon">🚧</div>
          <div className="construction-content">
            <h2>Under Construction</h2>
            <p>We're working hard to bring you an amazing barcode scanning experience!</p>
          </div>
          <div className="construction-icon">⚙️</div>
        </div>

        <div className="page-header">
          <h1>Find Chocolates by Barcode</h1>
          <p className="page-description">
            Scan or enter a barcode to quickly find information about a chocolate product.
          </p>
        </div>
        
        {/* Disabled Scanner Section */}
        <div className="scanner-preview">
          <div className="coming-soon-overlay">
            <div className="coming-soon-content">
              <div className="coming-soon-icon">📱</div>
              <h3>Coming Soon!</h3>
              <p>We're building an advanced barcode scanning system that will include:</p>
              <ul className="feature-list">
                <li>📸 Real-time camera scanning</li>
                <li>🔍 Instant chocolate identification</li>
                <li>📊 Automatic product details</li>
                <li>⚡ Lightning-fast results</li>
                <li>📱 Mobile app integration</li>
              </ul>
              <div className="eta-badge">
                <span className="eta-text">Expected Launch: Coming Soon</span>
              </div>
            </div>
          </div>
          
          {/* Preview of what the scanner will look like */}
          <div className="scanner-mockup">
            <div className="mock-camera">
              <div className="camera-viewfinder">
                <div className="scan-line"></div>
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
              </div>
            </div>
            <div className="mock-controls">
              <button className="mock-btn" disabled>📸 Scan Barcode</button>
              <button className="mock-btn" disabled>📋 Enter Manually</button>
            </div>
          </div>
        </div>
        
        <div className="info-section">
          <h2>What's Coming</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Instant Recognition</h3>
              <p>Point your camera at any chocolate barcode and get instant product information from our growing database.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🌐</div>
              <h3>Global Database</h3>
              <p>We're partnering with Open Food Facts and building our own comprehensive chocolate database.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Mobile First</h3>
              <p>Our upcoming mobile app will make scanning barcodes as easy as taking a photo.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Smart Features</h3>
              <p>Get reviews, ratings, ingredients, and recommendations instantly after scanning.</p>
            </div>
          </div>
          
          <div className="current-alternative">
            <h3>In the Meantime</h3>
            <p>While we're building this feature, you can still discover amazing chocolates by:</p>
            <div className="alternative-actions">
              <a href="/browse" className="action-btn primary">
                🍫 Browse All Chocolates
              </a>
              <a href="/search" className="action-btn secondary">
                🔍 Search by Name
              </a>
              <a href="/add-chocolate" className="action-btn secondary">
                ➕ Add New Chocolate
              </a>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="progress-section">
          <h3>Development Progress</h3>
          <div className="progress-items">
            <div className="progress-item completed">
              <div className="progress-icon">✅</div>
              <span>Database Architecture</span>
            </div>
            <div className="progress-item completed">
              <div className="progress-icon">✅</div>
              <span>UI/UX Design</span>
            </div>
            <div className="progress-item in-progress">
              <div className="progress-icon">🔄</div>
              <span>Barcode Recognition Engine</span>
            </div>
            <div className="progress-item pending">
              <div className="progress-icon">⏳</div>
              <span>Mobile App Integration</span>
            </div>
            <div className="progress-item pending">
              <div className="progress-icon">⏳</div>
              <span>Beta Testing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcodeSearchPage;