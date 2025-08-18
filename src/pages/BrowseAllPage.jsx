// src/pages/BrowseAllPage.jsx - Updated with URL parameter support and flavor/tag filtering
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ADD THIS IMPORT
import { getAllChocolates, getAllTags } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './BrowseAllPage.css';

function BrowseAllPage() {
  const [searchParams, setSearchParams] = useSearchParams(); // ADD THIS
  const [allChocolates, setAllChocolates] = useState([]);
  const [filteredChocolates, setFilteredChocolates] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize filters from URL parameters
  const getInitialFilters = () => {
    const filters = {
      maker: searchParams.get('maker') || '',
      type: searchParams.get('type') || '',
      origin: searchParams.get('origin') || '',
      tagId: searchParams.get('tagId') || '',
      flavor: searchParams.get('flavor') || '',
      tag: searchParams.get('tag') || '',
      minCacao: '',
      maxCacao: '',
      minRating: searchParams.get('minRating') || ''
    };
    
    // Handle cacao percentage from URL
    const cacaoParam = searchParams.get('cacao');
    if (cacaoParam) {
      const cacaoValue = parseInt(cacaoParam);
      if (!isNaN(cacaoValue)) {
        // For exact cacao percentage clicks, show a ±5% range
        filters.minCacao = Math.max(0, cacaoValue - 5).toString();
        filters.maxCacao = Math.min(100, cacaoValue + 5).toString();
      }
    } else {
      // Or use explicit min/max if provided
      filters.minCacao = searchParams.get('minCacao') || '';
      filters.maxCacao = searchParams.get('maxCacao') || '';
    }
    
    return filters;
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [sortOption, setSortOption] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Update filters when URL parameters change
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    
    // Auto-show filters if any are active from URL
    const hasUrlFilters = Object.values(newFilters).some(value => value !== '');
    if (hasUrlFilters) {
      setShowFilters(true);
    }
  }, [searchParams]);
  
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
    
    // Apply flavor filter (from URL parameter)
    if (filters.flavor) {
      filtered = filtered.filter(chocolate => {
        const flavorLower = filters.flavor.toLowerCase();
        
        // Check flavorNotes array
        if (chocolate.flavorNotes && Array.isArray(chocolate.flavorNotes)) {
          if (chocolate.flavorNotes.some(note => 
            note.toLowerCase().includes(flavorLower)
          )) {
            return true;
          }
        }
        
        // Check tags array for flavor matches
        if (chocolate.tags && Array.isArray(chocolate.tags)) {
          if (chocolate.tags.some(tag => 
            tag.toLowerCase().includes(flavorLower)
          )) {
            return true;
          }
        }
        
        // Check description for flavor mentions
        if (chocolate.description) {
          if (chocolate.description.toLowerCase().includes(flavorLower)) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Apply tag filter (from URL parameter or dropdown)
    if (filters.tag || filters.tagId) {
      const tagToFind = filters.tag || filters.tagId;
      filtered = filtered.filter(chocolate => {
        const tagLower = tagToFind.toLowerCase();
        
        // Check tagIds array
        if (chocolate.tagIds && chocolate.tagIds.includes(tagToFind)) {
          return true;
        }
        
        // Check tags array
        if (chocolate.tags && Array.isArray(chocolate.tags)) {
          if (chocolate.tags.some(tag => 
            tag.toLowerCase().includes(tagLower)
          )) {
            return true;
          }
        }
        
        // For special tags like organic, fair-trade, etc.
        const specialTags = {
          'organic': ['organic', 'bio', 'certified organic'],
          'fair-trade': ['fair trade', 'fairtrade', 'fair-trade'],
          'single-origin': ['single origin', 'single-origin', 'single estate'],
          'bean-to-bar': ['bean to bar', 'bean-to-bar', 'craft'],
          'vegan': ['vegan', 'dairy free', 'dairy-free'],
          'sugar-free': ['sugar free', 'sugar-free', 'no sugar'],
          'award-winning': ['award', 'winner', 'gold', 'silver', 'bronze']
        };
        
        if (specialTags[tagLower]) {
          const variations = specialTags[tagLower];
          for (let variation of variations) {
            if (chocolate.tags && chocolate.tags.some(t => 
              t.toLowerCase().includes(variation)
            )) {
              return true;
            }
            if (chocolate.description && 
              chocolate.description.toLowerCase().includes(variation)
            ) {
              return true;
            }
          }
        }
        
        return false;
      });
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
    
    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(chocolate => 
        (chocolate.averageRating || 0) >= parseFloat(filters.minRating)
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
        case 'newest':
          // Assuming you have a createdAt field
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
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
    
    // Update URL parameters when filters change
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    setSearchParams(newParams);
  };
  
  const clearAllFilters = () => {
    setFilters({
      maker: '',
      type: '',
      origin: '',
      tagId: '',
      flavor: '',
      tag: '',
      minCacao: '',
      maxCacao: '',
      minRating: ''
    });
    // Clear URL parameters
    setSearchParams(new URLSearchParams());
  };
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;
  
  // Display active filter summary
  const getActiveFilterSummary = () => {
    const active = [];
    if (filters.maker) active.push(`Maker: ${filters.maker}`);
    if (filters.type) active.push(`Type: ${filters.type}`);
    if (filters.origin) active.push(`Origin: ${filters.origin}`);
    if (filters.flavor) active.push(`Flavor: ${filters.flavor}`);
    if (filters.tag) active.push(`Tag: ${filters.tag}`);
    if (filters.minCacao && filters.maxCacao) {
      active.push(`Cacao: ${filters.minCacao}-${filters.maxCacao}%`);
    }
    if (filters.minRating) active.push(`Rating: ${filters.minRating}+`);
    return active;
  };
  
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
  const activeFilterSummary = getActiveFilterSummary();
  
  return (
    <div className="browse-page">
      <div className="container">
        
        {/* Show active filters from URL as pills */}
        {activeFilterSummary.length > 0 && (
          <div className="active-filters-display">
            <span className="active-filters-label">Active Filters:</span>
            {activeFilterSummary.map((filter, index) => (
              <span key={index} className="filter-pill">
                {filter}
                <button 
                  onClick={() => {
                    // Clear specific filter
                    const [key] = filter.split(':');
                    const filterKey = key.toLowerCase().replace(' ', '');
                    handleFilterChange(filterKey, '');
                  }}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* MODERN FILTER BAR */}
        <div className="modern-filter-bar">
          <div className="filter-controls">
            {/* Filter Toggle Button with Badge */}
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
            
            {/* Modern Sort Dropdown */}
            <div className="sort-dropdown">
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="modern-select"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="popularity">🔥 Most Popular</option>
                <option value="cacao-high">📈 Cacao % (High)</option>
                <option value="cacao-low">📉 Cacao % (Low)</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="maker">🏭 Maker (A-Z)</option>
                <option value="newest">✨ Newest First</option>
                <option value="price-low">💰 Price (Low)</option>
                <option value="price-high">💎 Price (High)</option>
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters-modern">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear All
              </button>
            )}
            
            {/* Results Counter */}
            <div className="results-summary">
              <span className="results-count">
                {filteredChocolates.length} chocolate{filteredChocolates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* MODERN EXPANDABLE FILTERS PANEL */}
        <div className={`modern-filters ${showFilters ? 'expanded' : ''}`}>
          <div className="filters-grid-modern">
            {/* Maker Filter Card */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Chocolate Maker
              </label>
              <select
                value={filters.maker}
                onChange={(e) => handleFilterChange('maker', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Makers ({uniqueMakers.length})</option>
                {uniqueMakers.map(maker => (
                  <option key={maker} value={maker}>{maker}</option>
                ))}
              </select>
            </div>
            
            {/* Type Filter Card */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                Chocolate Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Types ({uniqueTypes.length})</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type} {type === 'Dark' ? '🍫' : type === 'Milk' ? '🥛' : type === 'White' ? '🤍' : '✨'}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Origin Filter Card */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Origin Country
              </label>
              <select
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Origins ({uniqueOrigins.length})</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>
                    🌍 {origin}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags Filter Card */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Special Tags
              </label>
              <select
                value={filters.tagId}
                onChange={(e) => handleFilterChange('tagId', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">All Tags</option>
                <option value="organic">🌱 Organic</option>
                <option value="fair-trade">🤝 Fair Trade</option>
                <option value="single-origin">🎯 Single Origin</option>
                <option value="bean-to-bar">🔄 Bean to Bar</option>
                <option value="raw">⚡ Raw</option>
                <option value="vegan">🌿 Vegan</option>
                <option value="sugar-free">🚫 Sugar Free</option>
                <option value="award-winning">🏆 Award Winning</option>
              </select>
            </div>
            
            {/* Rating Filter Card */}
            <div className="filter-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
                Minimum Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="modern-filter-select"
              >
                <option value="">Any Rating</option>
                <option value="4.5">⭐⭐⭐⭐⭐ 4.5+ Exceptional</option>
                <option value="4.0">⭐⭐⭐⭐ 4.0+ Excellent</option>
                <option value="3.5">⭐⭐⭐ 3.5+ Very Good</option>
                <option value="3.0">⭐⭐ 3.0+ Good</option>
              </select>
            </div>
            
            {/* Cacao Percentage Range - Special Wide Card */}
            <div className="filter-card cacao-card">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8M12 8v8"></path>
                </svg>
                Cacao Percentage Range
              </label>
              <div className="cacao-range">
                <input
                  type="number"
                  placeholder="Min %"
                  value={filters.minCacao || ''}
                  onChange={(e) => handleFilterChange('minCacao', e.target.value)}
                  className="cacao-input"
                  min="0"
                  max="100"
                />
                <span className="cacao-separator">to</span>
                <input
                  type="number"
                  placeholder="Max %"
                  value={filters.maxCacao || ''}
                  onChange={(e) => handleFilterChange('maxCacao', e.target.value)}
                  className="cacao-input"
                  min="0"
                  max="100"
                />
              </div>
              <div style={{ 
                marginTop: '0.75rem', 
                fontSize: '0.8rem', 
                color: '#6B7280',
                textAlign: 'center'
              }}>
                💡 Most dark chocolates: 70-85% • Milk chocolates: 30-50%
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