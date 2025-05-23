// src/pages/BrowseAllPage.jsx - Enhanced version with filters
import React, { useState, useEffect } from 'react';
import { getAllChocolates, getAllTags } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './BrowseAllPage.css';

function BrowseAllPage() {
  const [allChocolates, setAllChocolates] = useState([]);
  const [filteredChocolates, setFilteredChocolates] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    maker: '',
    type: '',
    origin: '',
    tagId: '',
    minCacao: '',
    maxCacao: ''
  });
  
  const [sortOption, setSortOption] = useState('rating');
  
  // Get unique values for filter dropdowns
  const getUniqueValues = (chocolates, field) => {
    const values = chocolates
      .map(chocolate => chocolate[field])
      .filter(value => value && value.trim() !== '')
      .map(value => typeof value === 'string' ? value.trim() : value);
    
    return [...new Set(values)].sort();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch chocolates and tags in parallel
        const [chocolatesData, tagsData] = await Promise.all([
          getAllChocolates(),
          getAllTags()
        ]);
        
        setAllChocolates(chocolatesData);
        setFilteredChocolates(chocolatesData);
        setAvailableTags(tagsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters whenever filters or allChocolates change
  useEffect(() => {
    let filtered = [...allChocolates];
    
    // Apply maker filter
    if (filters.maker) {
      filtered = filtered.filter(chocolate => 
        chocolate.maker && chocolate.maker.toLowerCase().includes(filters.maker.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(chocolate => 
        chocolate.type && chocolate.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    // Apply origin filter
    if (filters.origin) {
      filtered = filtered.filter(chocolate => 
        chocolate.origin && chocolate.origin.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    
    // Apply tag filter
    if (filters.tagId) {
      filtered = filtered.filter(chocolate => 
        chocolate.tagIds && chocolate.tagIds.includes(filters.tagId)
      );
    }
    
    // Apply cacao percentage filters
    if (filters.minCacao) {
      filtered = filtered.filter(chocolate => 
        chocolate.cacaoPercentage >= parseInt(filters.minCacao)
      );
    }
    
    if (filters.maxCacao) {
      filtered = filtered.filter(chocolate => 
        chocolate.cacaoPercentage <= parseInt(filters.maxCacao)
      );
    }
    
    setFilteredChocolates(filtered);
  }, [filters, allChocolates]);
  
  // Sort chocolates
  const getSortedChocolates = () => {
    return [...filteredChocolates].sort((a, b) => {
      switch(sortOption) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'popularity':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'cacao-high':
          return (b.cacaoPercentage || 0) - (a.cacaoPercentage || 0);
        case 'cacao-low':
          return (a.cacaoPercentage || 0) - (b.cacaoPercentage || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'maker':
          return (a.maker || '').localeCompare(b.maker || '');
        default:
          return 0;
      }
    });
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      maker: '',
      type: '',
      origin: '',
      tagId: '',
      minCacao: '',
      maxCacao: ''
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  if (loading) {
    return <div className="loading full-width">Loading chocolates...</div>;
  }
  
  if (error) {
    return <div className="error full-width">Error: {error}</div>;
  }
  
  const sortedChocolates = getSortedChocolates();
  const uniqueMakers = getUniqueValues(allChocolates, 'maker');
  const uniqueTypes = getUniqueValues(allChocolates, 'type');
  const uniqueOrigins = getUniqueValues(allChocolates, 'origin');
  
  return (
    <div className="browse-page full-page">
      <div className="container">
        <div className="browse-header">
          <h1>Browse All Chocolates</h1>
          <p className="browse-description">
            Discover chocolates from our collection of {allChocolates.length} chocolates.
            {hasActiveFilters && ` Showing ${filteredChocolates.length} results.`}
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="filter-section">
          <div className="filter-header">
            <h2>Filter & Sort</h2>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="filters-grid">
            {/* Maker Filter */}
            <div className="filter-group">
              <label htmlFor="maker-filter">Maker/Brand:</label>
              <select
                id="maker-filter"
                value={filters.maker}
                onChange={(e) => handleFilterChange('maker', e.target.value)}
              >
                <option value="">All Makers</option>
                {uniqueMakers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="filter-group">
              <label htmlFor="type-filter">Chocolate Type:</label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Origin Filter */}
            <div className="filter-group">
              <label htmlFor="origin-filter">Origin:</label>
              <select
                id="origin-filter"
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
              >
                <option value="">All Origins</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
            
            {/* Tag Filter */}
            <div className="filter-group">
              <label htmlFor="tag-filter">Special Tags:</label>
              <select
                id="tag-filter"
                value={filters.tagId}
                onChange={(e) => handleFilterChange('tagId', e.target.value)}
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
            
            {/* Cacao Percentage Range */}
            <div className="filter-group cacao-range">
              <label>Cacao Percentage:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min %"
                  min="0"
                  max="100"
                  value={filters.minCacao}
                  onChange={(e) => handleFilterChange('minCacao', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max %"
                  min="0"
                  max="100"
                  value={filters.maxCacao}
                  onChange={(e) => handleFilterChange('maxCacao', e.target.value)}
                />
              </div>
            </div>
            
            {/* Sort Option */}
            <div className="filter-group">
              <label htmlFor="sort-option">Sort by:</label>
              <select
                id="sort-option"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="cacao-high">Cacao % (High to Low)</option>
                <option value="cacao-low">Cacao % (Low to High)</option>
                <option value="name">Name (A-Z)</option>
                <option value="maker">Maker (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        {sortedChocolates.length > 0 ? (
          <div className="chocolate-grid">
            {sortedChocolates.map(chocolate => (
              <ChocolateCard key={chocolate.id} chocolate={chocolate} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No chocolates found</h3>
            <p>Try adjusting your filters or browse all chocolates.</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseAllPage;