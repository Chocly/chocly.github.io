// src/pages/BrowseAllPage.jsx - Beautiful enhanced version
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
  const [showFilters, setShowFilters] = useState(false);
  
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
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chocolates...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="error full-width">Error: {error}</div>;
  }
  
  const sortedChocolates = getSortedChocolates();
  const uniqueMakers = getUniqueValues(allChocolates, 'maker');
  const uniqueTypes = getUniqueValues(allChocolates, 'type');
  const uniqueOrigins = getUniqueValues(allChocolates, 'origin');
  
  return (
    <div className="browse-page">
      <div className="container">
        {/* Modern Header */}
        <div className="browse-header">
          <div className="header-content">
            <h1>Discover Chocolates</h1>
            <p className="browse-description">
              Explore our collection of {allChocolates.length} premium chocolates
              {hasActiveFilters && ` • ${filteredChocolates.length} results shown`}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-number">{allChocolates.length}</span>
              <span className="stat-label">Total Chocolates</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{uniqueMakers.length}</span>
              <span className="stat-label">Makers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{uniqueOrigins.length}</span>
              <span className="stat-label">Origins</span>
            </div>
          </div>
        </div>
        
        {/* Modern Filter Bar */}
        <div className="modern-filter-bar">
          <div className="filter-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
              </svg>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>
            
            <div className="sort-dropdown">
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="modern-select"
              >
                <option value="rating">★ Highest Rated</option>
                <option value="popularity">🔥 Most Popular</option>
                <option value="cacao-high">📈 Cacao % (High)</option>
                <option value="cacao-low">📉 Cacao % (Low)</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="maker">🏭 Maker (A-Z)</option>
              </select>
            </div>
            
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear All
              </button>
            )}
          </div>
          
          <div className="results-summary">
            <span className="results-count">
              {filteredChocolates.length} chocolate{filteredChocolates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Modern Expandable Filters */}
        <div className={`modern-filters ${showFilters ? 'expanded' : ''}`}>
          <div className="filters-grid-modern">
            {/* Maker Filter */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Maker
              </label>
              <select
                value={filters.maker}
                onChange={(e) => handleFilterChange('maker', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Makers</option>
                {uniqueMakers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Origin Filter */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Origin
              </label>
              <select
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Origins</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
            
            {/* Tag Filter */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Tags
              </label>
              <select
                value={filters.tagId}
                onChange={(e) => handleFilterChange('tagId', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
            
            {/* Cacao Range */}
            <div className="filter-card cacao-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Cacao %
              </label>
              <div className="cacao-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.minCacao}
                  onChange={(e) => handleFilterChange('minCacao', e.target.value)}
                  className="cacao-input"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.maxCacao}
                  onChange={(e) => handleFilterChange('maxCacao', e.target.value)}
                  className="cacao-input"
                />
              </div>
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
          <div className="no-results-modern">
            <div className="no-results-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <h3>No chocolates found</h3>
            <p>Try adjusting your filters to discover more chocolates</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseAllPage;