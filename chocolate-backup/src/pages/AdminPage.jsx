// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
//import ProductImageSearch from '../components/ProductImageSearch';
import { addChocolate } from '../services/chocolateFirebaseService';
// Removed script imports
import './AdminPage.css';

// Create dummy functions instead of importing from scripts
const addInitialChocolates = () => {
  console.warn('This function is only available in development mode.');
  return Promise.resolve('Operation not available in production build.');
};

const addCommercialChocolates = () => {
  console.warn('This function is only available in development mode.');
  return Promise.resolve('Operation not available in production build.');
};

const addMoreCommercialChocolates = () => {
  console.warn('This function is only available in development mode.');
  return Promise.resolve('Operation not available in production build.');
};

const enrichChocolateDatabase = () => {
  console.warn('This function is only available in development mode.');
  return Promise.resolve('Operation not available in production build.');
};

function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentOperation, setCurrentOperation] = useState('');
  const [chocolate, setChocolate] = useState({
    name: '',
    makerId: '',
    type: '',
    origin: '',
    cacaoPercentage: '',
    description: '',
    ingredients: '',
    barcode: ''
  });
  
  // Image handling state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setChocolate({
      ...chocolate,
      [name]: value
    });
  };
  
  // Handle image selection from the ImageUploader component
  const handleImageSelected = (file) => {
    setSelectedImage(file);
    setSelectedImageUrl(URL.createObjectURL(file));
  };
  
  // Handle image selection from the ProductImageSearch component
  const handleSearchImageSelected = (file, url) => {
    setSelectedImage(file);
    setSelectedImageUrl(url);
    setShowImageSearch(false); // Hide search after selection
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      setMessage('');
      
      // Create a chocolate object from the form data
      const chocolateData = {
        name: chocolate.name,
        makerId: chocolate.makerId,
        type: chocolate.type,
        origin: chocolate.origin,
        cacaoPercentage: parseFloat(chocolate.cacaoPercentage) || 0,
        description: chocolate.description,
        ingredients: chocolate.ingredients.split(',').map(item => item.trim()),
        barcode: chocolate.barcode || null // Include barcode if available
      };
      
      // Add the chocolate with the image
      await addChocolate(chocolateData, selectedImage);
      
      setMessage('Chocolate added successfully!');
      // Reset form
      setChocolate({
        name: '',
        makerId: '',
        type: '',
        origin: '',
        cacaoPercentage: '',
        description: '',
        ingredients: '',
        barcode: ''
      });
      setSelectedImage(null);
      setSelectedImageUrl(null);
    } catch (error) {
      setMessage(`Error adding chocolate: ${error.message}`);
      console.error('Error adding chocolate:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleBulkUpload = async () => {
    try {
      setLoading(true);
      setMessage('');
      // Replaced with dummy function call
      const result = await addInitialChocolates();
      setMessage('This feature is only available in development mode. Please run the script locally.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Error in bulk upload:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnrichDatabase = async () => {
    try {
      setLoading(true);
      setCurrentOperation('Enriching database with Open Food Facts data');
      setMessage('This feature is only available in development mode. Please run the script locally.');
      
      // Replaced with dummy function call
      await enrichChocolateDatabase();
      
      setMessage('Database enrichment feature is not available in production build.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Error in database enrichment:', error);
    } finally {
      setLoading(false);
      setCurrentOperation('');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Chocolate Admin Dashboard</h1>
          <div className="admin-links">
            <Link to="/admin/batch-upload" className="admin-link">Batch Image Upload</Link>
            <Link to="/" className="back-link">Back to Home</Link>
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Database Actions</h2>
          <div className="admin-actions">
            <button 
              onClick={handleBulkUpload}
              className="admin-button primary"
              disabled={loading}
            >
              {loading ? 'Adding Chocolates...' : 'Add Initial Chocolates'}
            </button>
            
            <button 
              onClick={() => {
                setMessage('This feature is only available in development mode.');
                addCommercialChocolates();
              }}
              className="admin-button secondary"
              disabled={loading}
            >
              Add Commercial Chocolates
            </button>
            
            <button 
              onClick={() => {
                setMessage('This feature is only available in development mode.');
                addMoreCommercialChocolates();
              }}
              className="admin-button secondary"
              disabled={loading}
            >
              Add 100 More Popular Chocolates
            </button>
            
            {message && <div className="message">{message}</div>}
          </div>
        </div>
        
        {/* Add this new section here for the Open Food Facts integration  */}
        <div className="admin-section">
        <h2>Open Food Facts Integration</h2>
        <div className="admin-actions">
            <button 
            onClick={handleEnrichDatabase}
            className="admin-button primary"
            disabled={loading}
            >
            {loading && currentOperation === 'Enriching database' 
                ? 'Enriching Database...' 
                : 'Enrich Database with Open Food Facts'}
            </button>
        
            <div className="admin-section">
                <h2>Chocolate Matching Tool</h2>
                <p>Match your chocolates with Open Food Facts database</p>
                <p className="note">This feature is only available in development mode.</p>
                {/* Removed ChocolateMatchingTool component */}
            </div>

            <p className="help-text">
            This will search for matching products in Open Food Facts and 
            update your database with barcodes, images, and additional information.
            </p>
        </div>
        </div>

        <div className="admin-section">
          <h2>Add New Chocolate</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Chocolate Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={chocolate.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="makerId">Maker</label>
              <select
                id="makerId"
                name="makerId"
                value={chocolate.makerId}
                onChange={handleChange}
                required
              >
                <option value="">Select a maker</option>
                <option value="placeholder">Placeholder (connect to real makers later)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={chocolate.type}
                onChange={handleChange}
                required
              >
                <option value="">Select a type</option>
                <option value="Dark">Dark</option>
                <option value="Milk">Milk</option>
                <option value="White">White</option>
                <option value="Ruby">Ruby</option>
                <option value="Flavored">Flavored</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="origin">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={chocolate.origin}
                onChange={handleChange}
                placeholder="Country or region of origin"
              />
            </div>
            
            {/* Image uploader section */}
            <div className="form-group full-width">
              <label>Chocolate Label Image</label>
              <div className="image-options">
                <button 
                  type="button" 
                  className="toggle-search-button"
                  onClick={() => setShowImageSearch(!showImageSearch)}
                >
                  {showImageSearch ? 'Hide Product Search' : 'Search Product Database'}
                </button>
              </div>
              
              {showImageSearch && (
                <p>Product search feature is only available in development mode.</p>
              )}
              
              <ImageUploader 
                onImageSelected={handleImageSelected}
                currentImageUrl={selectedImageUrl}
              />
              <p className="field-helper">Upload a clear image of the chocolate label</p>
            </div>
            
            {/* Barcode field for future image recognition */}
            <div className="form-group">
              <label htmlFor="barcode">Barcode (EAN/UPC)</label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={chocolate.barcode || ''}
                onChange={handleChange}
                placeholder="Product barcode if available"
              />
              <p className="field-helper">For future scanning functionality</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="cacaoPercentage">Cacao Percentage</label>
              <input
                type="number"
                id="cacaoPercentage"
                name="cacaoPercentage"
                value={chocolate.cacaoPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g. 70"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={chocolate.description}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="ingredients">Ingredients</label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={chocolate.ingredients}
                onChange={handleChange}
                rows="2"
                placeholder="Comma-separated list of ingredients"
              ></textarea>
            </div>
            
            <button type="submit" className="admin-button" disabled={uploading}>
              {uploading ? 'Adding Chocolate...' : 'Add Chocolate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;