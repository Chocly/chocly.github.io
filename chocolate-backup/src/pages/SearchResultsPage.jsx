import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchChocolates } from '../services/chocolateFirebaseService'; // Make sure this import is correct
import ChocolateCard from '../components/ChocolateCard';
import './SearchResultsPage.css';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('relevance');
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await searchChocolates(query);
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    performSearch();
  }, [query]);
  
  // Filter the results based on user selection
  const filteredResults = results.filter(chocolate => {
    if (filterType === 'all') return true;
    return chocolate.type && chocolate.type.toLowerCase() === filterType.toLowerCase();
  });
  
  // Sort the results based on user selection
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'cacao-high':
        return (b.cacaoPercentage || 0) - (a.cacaoPercentage || 0);
      case 'cacao-low':
        return (a.cacaoPercentage || 0) - (b.cacaoPercentage || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default: // relevance - keep original order
        return 0;
    }
  });
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };
  
  if (loading) {
    return <div className="loading">Searching...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="search-results-page">
      <div className="container">
        <div className="search-header">
          <h1>Search Results</h1>
          {query && <p className="search-query">Showing results for "{query}"</p>}
        </div>
        
        {results.length > 0 ? (
          <>
            <div className="search-filters">
              <div className="filter-group">
                <label htmlFor="type-filter">Filter by:</label>
                <select 
                  id="type-filter" 
                  value={filterType} 
                  onChange={handleFilterChange}
                >
                  <option value="all">All Types</option>
                  <option value="dark">Dark Chocolate</option>
                  <option value="milk">Milk Chocolate</option>
                  <option value="white">White Chocolate</option>
                  <option value="ruby">Ruby Chocolate</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="sort-by">Sort by:</label>
                <select 
                  id="sort-by" 
                  value={sortOption} 
                  onChange={handleSortChange}
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rating</option>
                  <option value="cacao-high">Cacao % (High to Low)</option>
                  <option value="cacao-low">Cacao % (Low to High)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
            
            <p className="results-count">{sortedResults.length} chocolate{sortedResults.length !== 1 ? 's' : ''} found</p>
            <div className="results-grid">
              {sortedResults.map(chocolate => (
                <ChocolateCard key={chocolate.id} chocolate={chocolate} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <p>No chocolates found matching your search.</p>
            <p>Try different keywords or <Link to="/">browse all chocolates</Link>.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;