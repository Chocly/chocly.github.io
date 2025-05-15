// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChocolatesByCategory } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './CategoryPage.css';

function CategoryPage() {
  const { categorySlug } = useParams();
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('rating');
  
  // Format the category name for display
  const formatCategoryName = (slug) => {
    if (slug === 'origin') return 'Single Origin';
    if (slug === 'artisan') return 'Artisan Craft';
    return slug.charAt(0).toUpperCase() + slug.slice(1) + ' Chocolate';
  };
  
  // Get category description
  const getCategoryDescription = (slug) => {
    switch(slug) {
      case 'dark':
        return 'Bold, intense flavors with higher cacao percentages, typically ranging from 55% to 100%.';
      case 'milk':
        return 'Smooth and creamy with a balance of cocoa and dairy notes, offering a more approachable chocolate experience.';
      case 'white':
        return 'Made with cocoa butter, sugar, and milk, without cocoa solids, creating a rich, sweet flavor profile.';
      case 'origin':
        return 'Chocolates made from beans sourced from a single region, showcasing the unique terroir of specific locations.';
      case 'artisan':
        return 'Small-batch chocolates crafted with meticulous attention to detail, often using traditional methods and premium ingredients.';
      default:
        return 'Explore our chocolate collection';
    }
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Get featured image for the category hero
  const getCategoryImage = (slug) => {
    // In production, you would use actual category-specific images
    const imagePaths = {
      dark: '/category-dark.jpg',
      milk: '/category-milk.jpg',
      white: '/category-white.jpg',
      origin: '/category-origin.jpg',
      artisan: '/category-artisan.jpg'
    };
    
    return imagePaths[slug] || '/category-default.jpg';
  };
  
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Map the slug to the appropriate filter
        let filter;
        if (categorySlug === 'origin') {
          filter = { field: 'tagIds', operator: 'array-contains', value: 'single-origin' };
        } else if (categorySlug === 'artisan') {
          filter = { field: 'tagIds', operator: 'array-contains', value: 'bean-to-bar' };
        } else {
          // For dark, milk, white, etc.
          filter = { field: 'type', operator: '==', value: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) };
        }
        
        const data = await getChocolatesByCategory(filter);
        setChocolates(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [categorySlug]);
  
  // Sort the chocolates based on selected option
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
        <p>Loading {formatCategoryName(categorySlug)}...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }
  
  const sortedChocolates = getSortedChocolates();
  
  return (
    <div className="category-page">
      {/* Category Hero */}
      <div 
        className="category-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(58, 42, 31, 0.7), rgba(58, 42, 31, 0.7)), url(${getCategoryImage(categorySlug)})` }}
      >
        <div className="container">
          <h1>{formatCategoryName(categorySlug)}</h1>
          <p className="category-description">{getCategoryDescription(categorySlug)}</p>
        </div>
      </div>
      
      <div className="container">
        {/* Sorting controls */}
        <div className="category-controls">
          <div className="results-count">
            {chocolates.length} {chocolates.length === 1 ? 'chocolate' : 'chocolates'} found
          </div>
          
          <div className="sort-control">
            <label htmlFor="sort-by">Sort by:</label>
            <select id="sort-by" value={sortOption} onChange={handleSortChange}>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="cacao-high">Cacao % (High to Low)</option>
              <option value="cacao-low">Cacao % (Low to High)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
        
        {/* Chocolates grid */}
        {sortedChocolates.length > 0 ? (
          <div className="chocolates-grid">
            {sortedChocolates.map(chocolate => (
              <ChocolateCard key={chocolate.id} chocolate={chocolate} />
            ))}
          </div>
        ) : (
          <div className="no-chocolates">
            <p>No chocolates found in this category.</p>
            <Link to="/browse" className="btn btn-primary">Browse All Chocolates</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;