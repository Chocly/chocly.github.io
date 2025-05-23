// src/pages/MakerPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { searchChocolates } from '../services/chocolateFirebaseService';
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
        // Search for chocolates by this maker
        const results = await searchChocolates(currentMaker);
        
        // Filter to only include chocolates where the maker exactly matches
        const makerChocolates = results.filter(chocolate => 
          chocolate.maker && 
          chocolate.maker.toLowerCase() === currentMaker.toLowerCase()
        );
        
        setChocolates(makerChocolates);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching maker chocolates:", err);
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
          return (b.ratings || 0) - (a.ratings || 0);
        case 'cacao-high':
          return (b.cacaoPercentage || 0) - (a.cacaoPercentage || 0);
        case 'cacao-low':
          return (a.cacaoPercentage || 0) - (b.cacaoPercentage || 0);
        case 'name':
          return a.name.localeCompare(b.name);
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
            <p>No chocolates found for {currentMaker}.</p>
            <p>This might be due to variations in how the maker name is stored in our database.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MakerPage;