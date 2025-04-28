// src/components/BarcodeScanner.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BarcodeScanner.css';

function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Handle manual barcode input
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode) return;
    
    try {
      setLoading(true);
      setError("");
      
      // For now, we'll just redirect to the search page with the barcode as a query
      navigate(`/search?query=${barcode}`);
    } catch (err) {
      setError("Could not find a chocolate with this barcode. Please try another.");
    } finally {
      setLoading(false);
    }
  };
  
  // For a web app, we'll use file input for now
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you'd use a barcode scanning library
    // For now, we'll just simulate finding a barcode
    setLoading(true);
    setTimeout(() => {
      // Simulated barcode detection
      const simulatedBarcode = "3017620422003"; // Sample Nutella barcode
      setBarcode(simulatedBarcode);
      setLoading(false);
    }, 1500);
  };
  
  return (
    <div className="barcode-scanner">
      <h2>Scan Chocolate Barcode</h2>
      
      <div className="scan-options">
        <div className="manual-entry">
          <h3>Enter Barcode Manually</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode number"
              required
            />
            <button 
              type="submit" 
              disabled={loading || !barcode}
            >
              {loading ? "Searching..." : "Find Chocolate"}
            </button>
          </form>
        </div>
        
        <div className="scan-image">
          <h3>Scan Barcode Image</h3>
          <p>Upload an image of a barcode to scan</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload Barcode Image"}
          </button>
          <p className="hint">For a mobile app, we would use the device camera</p>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default BarcodeScanner;