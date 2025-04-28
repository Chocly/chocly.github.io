// src/components/admin/ChocolateMatchingTool.jsx
import React, { useState, useEffect } from 'react';
import { getAllChocolates } from '../../services/chocolateFirebaseService';
import { processBatchForMatching, mergeChocolateData } from '../../utils/matchingAlgorithm';
import './ChocolateMatchingTool.css'; // We'll create this next

function ChocolateMatchingTool() {
  const [chocolates, setChocolates] = useState([]);
  const [matchResults, setMatchResults] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  
  useEffect(() => {
    const loadChocolates = async () => {
      const data = await getAllChocolates();
      setChocolates(data);
    };
    
    loadChocolates();
  }, []);
  
  const processBatch = async () => {
    setLoading(true);
    setMessage('Processing batch...');
    
    try {
      // Get current batch of chocolates
      const startIndex = currentIndex;
      const endIndex = Math.min(startIndex + batchSize, chocolates.length);
      const batch = chocolates.slice(startIndex, endIndex);
      
      // Process batch
      const results = await processBatchForMatching(batch);
      setMatchResults(results);
      
      setMessage(`Processed ${batch.length} chocolates. Found ${results.highConfidence.length} high confidence matches, ${results.mediumConfidence.length} medium confidence matches, and ${results.lowConfidence.length} low confidence matches.`);
    } catch (error) {
      console.error('Error processing batch:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMatchAccept = (ourChocolate, offProduct) => {
    // Here you would update your database with the merged data
    const mergedData = mergeChocolateData(ourChocolate, offProduct);
    console.log('Accepted match:', mergedData);
    
    // In a real implementation, you would save this to your database
    // updateChocolateInDatabase(ourChocolate.id, mergedData);
    
    // Move to next set of matches
    setCurrentIndex(currentIndex + batchSize);
    setMatchResults(null);
  };
  
  const handleMatchReject = () => {
    // Move to next set of matches
    setCurrentIndex(currentIndex + batchSize);
    setMatchResults(null);
  };
  
  const renderMatchItem = (item) => {
    const { ourChocolate, topMatch } = item;
    const offProduct = topMatch.offProduct;
    
    return (
      <div className="match-item" key={ourChocolate.id}>
        <div className="match-chocolate">
          <h3>{ourChocolate.name}</h3>
          <p>Brand: {ourChocolate.maker}</p>
          <p>Type: {ourChocolate.type}</p>
          <p>Cacao: {ourChocolate.cacaoPercentage}%</p>
          {ourChocolate.imageUrl && (
            <img 
              src={ourChocolate.imageUrl} 
              alt={ourChocolate.name} 
              className="chocolate-image"
            />
          )}
        </div>
        
        <div className="match-arrows">
          <span>→</span>
          <div className="match-score">
            {topMatch.score.toFixed(0)}%
          </div>
        </div>
        
        <div className="off-chocolate">
          <h3>{offProduct.product_name}</h3>
          <p>Brand: {offProduct.brands}</p>
          <p>Categories: {offProduct.categories}</p>
          {offProduct.image_url && (
            <img 
              src={offProduct.image_url} 
              alt={offProduct.product_name} 
              className="chocolate-image"
            />
          )}
          
          <div className="match-actions">
            <button 
              onClick={() => handleMatchAccept(ourChocolate, offProduct)}
              className="accept-button"
            >
              Accept Match
            </button>
            <button 
              onClick={handleMatchReject}
              className="reject-button"
            >
              Reject Match
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="chocolate-matching-tool">
      <h2>Chocolate Matching Tool</h2>
      <p>Total chocolates: {chocolates.length}</p>
      <p>Current position: {currentIndex} / {chocolates.length}</p>
      
      <div className="batch-controls">
        <label>
          Batch size:
          <input 
            type="number" 
            value={batchSize} 
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            min="1"
            max="20"
          />
        </label>
        <button 
          onClick={processBatch} 
          disabled={loading || currentIndex >= chocolates.length}
        >
          {loading ? 'Processing...' : 'Process Next Batch'}
        </button>
      </div>
      
      {message && <div className="message">{message}</div>}
      
      {matchResults && (
        <div className="match-results">
          <h3>High Confidence Matches</h3>
          {matchResults.highConfidence.map(renderMatchItem)}
          
          <h3>Medium Confidence Matches</h3>
          {matchResults.mediumConfidence.map(renderMatchItem)}
          
          <h3>Low Confidence Matches</h3>
          {matchResults.lowConfidence.map(renderMatchItem)}
        </div>
      )}
    </div>
  );
}

export default ChocolateMatchingTool;