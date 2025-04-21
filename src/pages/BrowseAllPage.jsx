// src/pages/BrowseAllPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllChocolates } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './BrowseAllPage.css';

function BrowseAllPage() {
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchChocolates = async () => {
      try {
        setLoading(true);
        const data = await getAllChocolates();
        setChocolates(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchChocolates();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading chocolates...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="browse-page">
      <div className="container">
        <h1>All Chocolates</h1>
        <p className="browse-description">Browse our complete collection of {chocolates.length} chocolates.</p>
        
        <div className="chocolate-grid">
          {chocolates.map(chocolate => (
            <ChocolateCard key={chocolate.id} chocolate={chocolate} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BrowseAllPage;