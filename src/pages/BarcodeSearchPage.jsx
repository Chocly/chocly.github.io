// src/pages/BarcodeSearchPage.jsx
import React from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import './BarcodeSearchPage.css';

function BarcodeSearchPage() {
  return (
    <div className="barcode-search-page">
      <div className="container">
        <div className="page-header">
          <h1>Find Chocolates by Barcode</h1>
          <p className="page-description">
            Scan or enter a barcode to quickly find information about a chocolate product.
          </p>
        </div>
        
        <BarcodeScanner />
        
        <div className="info-section">
          <h2>About Barcode Scanning</h2>
          <p>
            Our barcode scanning feature allows you to quickly look up chocolates by their barcode. 
            We use the Open Food Facts database to find products that might not be in our system yet.
          </p>
          <p>
            In the future, our mobile app will allow you to scan barcodes directly with your phone's camera!
          </p>
        </div>
      </div>
    </div>
  );
}

export default BarcodeSearchPage;