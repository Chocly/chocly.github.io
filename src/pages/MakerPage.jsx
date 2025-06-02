// Update your MakerPage.jsx with better maker matching

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getAllChocolates } from '../services/chocolateFirebaseService'; // Changed from searchChocolates
import ChocolateCard from '../components/ChocolateCard';
import './MakerPage.css';

function MakerPage() {
  const { makerName } = useParams();
  const [searchParams] = useSearchParams();
  const makerFromQuery = searchParams.get('maker');
  
  // Use either URL param or query param
  const currentMaker = makerName || makerFromQuery;
  
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('rating');
  
  useEffect(() => {
    const fetchMakerChocolates = async () => {
      if (!currentMaker) return;
      
      try {
        setLoading(true);
        console.log('🔍 Searching for chocolates by maker:', currentMaker);
        
        // Get ALL chocolates (this will enrich them with maker names)
        const allChocolates = await getAllChocolates();
        console.log('📊 Total chocolates retrieved:', allChocolates.length);
        
        // Filter to only include chocolates where the maker matches
        // Use case-insensitive matching and trim whitespace
        const makerChocolates = allChocolates.filter(chocolate => {
          if (!chocolate.maker) return false;
          
          const chocolateMaker = chocolate.maker.toLowerCase().trim();
          const searchMaker = currentMaker.toLowerCase().trim();
          
          // Try exact match first
          if (chocolateMaker === searchMaker) {
            console.log('✅ Exact match found:', chocolate.name, 'by', chocolate.maker);
            return true;
          }
          
          // Try partial match (in case of slight differences)
          if (chocolateMaker.includes(searchMaker) || searchMaker.includes(chocolateMaker)) {
            console.log('✅ Partial match found:', chocolate.name, 'by', chocolate.maker);
            return true;
          }
          
          return false;
        });
        
        console.log('🎯 Chocolates found for maker:', makerChocolates.length);
        console.log('📋 Maker chocolates:', makerChocolates.map(c => `${c.name} by ${c.maker}`));
        
        setChocolates(makerChocolates);
        setLoading(false);
      } catch (err) {
        console.error("💥 Error fetching maker chocolates:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMakerChocolates();
  }, [currentMaker]);
  
  // Sort chocolates based on selected option
  const getSortedChocolates = () => {
    return [...chocolates].sort((a, b) => {
      switch(sortOption) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'popularity':
          return (b.ratings || b.reviewCount || 0) - (a.ratings || a.reviewCount || 0);
        case 'cacao-high':
          return (b.cacaoPercentage || 0) - (a.cacaoPercentage || 0);
        case 'cacao-low':
          return (a.cacaoPercentage || 0) - (b.cacaoPercentage || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chocolates by {currentMaker}...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    );
  }
  
  const sortedChocolates = getSortedChocolates();
  
  return (
    <div className="maker-page">
      <div className="container">
        <div className="maker-header">
          <h1>Chocolates by {currentMaker}</h1>
          <p className="maker-description">
            Explore all chocolates made by {currentMaker} in our collection
          </p>
        </div>
        
        <div className="maker-controls">
          <div className="results-count">
            {chocolates.length} {chocolates.length === 1 ? 'chocolate' : 'chocolates'} found
          </div>
          
          <div className="sort-control">
            <label htmlFor="sort-by">Sort by:</label>
            <select 
              id="sort-by" 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="cacao-high">Cacao % (High to Low)</option>
              <option value="cacao-low">Cacao % (Low to High)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
        
        {sortedChocolates.length > 0 ? (
          <div className="chocolates-grid">
            {sortedChocolates.map(chocolate => (
              <ChocolateCard key={chocolate.id} chocolate={chocolate} />
            ))}
          </div>
        ) : (
          <div className="no-chocolates">
            <p>No chocolates found for "{currentMaker}".</p>
            <p>This might be due to variations in how the maker name is stored.</p>
            <div className="debug-info" style={{marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px'}}>
              <p><strong>Debug Info:</strong></p>
              <p>Searched for: "{currentMaker}"</p>
              <p>Try searching for part of the maker name in the main search.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MakerPage;