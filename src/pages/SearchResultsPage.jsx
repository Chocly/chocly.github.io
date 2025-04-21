import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchChocolates } from '../services/chocolateService';
import ChocolateCard from '../components/ChocolateCard';
import './SearchResultsPage.css';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        setError(err.message);
        setLoading(false);
      }
    };
    
    performSearch();
  }, [query]);
  
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
        
        {results.length === 0 ? (
          <div className="no-results">
            <p>No chocolates found matching your search.</p>
            <p>Try different keywords or <Link to="/">browse all chocolates</Link>.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{results.length} chocolate{results.length !== 1 ? 's' : ''} found</p>
            <div className="results-grid">
              {results.map(chocolate => (
                <ChocolateCard key={chocolate.id} chocolate={chocolate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;