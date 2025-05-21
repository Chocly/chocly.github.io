// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { addChocolate } from '../services/chocolateFirebaseService';
import addInitialChocolates from '../../scripts/addInitialChocolates';
import addCommercialChocolates from '../../scripts/addCommercialChocolates';
import addMoreCommercialChocolates from '../../scripts/addMoreCommercialChocolates';
import updateDatabaseProducts from '../../scripts/updateDatabaseProducts';
import { downloadAndProcessS3List, updateChocolateImages, runImageUpdate } from '../../scripts/processS3ImageList';
import ChocolateMatchingTool from '../components/admin/ChocolateMatchingTool';
import './AdminPage.css';

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
      setCurrentOperation('Adding initial chocolates');
      setMessage('');
      await addInitialChocolates();
      setMessage('Successfully added initial chocolates! Check the console for details.');
    } catch (error) {
      setMessage(`Error adding chocolates: ${error.message}`);
      console.error('Error in bulk upload:', error);
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
        
        {/* Database Actions Section */}
        <div className="admin-section">
          <h2>Database Actions</h2>
          <div className="admin-actions">
            <button 
              onClick={handleBulkUpload}
              className="admin-button primary"
              disabled={loading}
            >
              {loading && currentOperation === 'Adding initial chocolates' ? 'Adding Chocolates...' : 'Add Initial Chocolates'}
            </button>
            
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Adding commercial chocolates');
                  setMessage('Adding commercial chocolates to the database...');
                  await addCommercialChocolates();
                  setMessage('Successfully added commercial chocolates! Check the console for details.');
                } catch (error) {
                  setMessage(`Error adding chocolates: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button secondary"
              disabled={loading}
            >
              Add Commercial Chocolates
            </button>
            
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Adding more commercial chocolates');
                  setMessage('Adding 100 more popular chocolates to the database...');
                  await addMoreCommercialChocolates();
                  setMessage('Successfully added 100 more chocolates! Check the console for details.');
                } catch (error) {
                  setMessage(`Error adding chocolates: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button secondary"
              disabled={loading}
            >
              Add 100 More Popular Chocolates
            </button>
          </div>
          
          {message && <div className="message">{message}</div>}
        </div>
        
        {/* Database Maintenance Section */}
        <div className="admin-section">
          <h2>Database Maintenance</h2>
          <div className="admin-actions">
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Updating database products');
                  setMessage('Updating product titles and data...');
                  await updateDatabaseProducts();
                  setMessage('Successfully updated product titles and data!');
                } catch (error) {
                  setMessage(`Error updating products: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button primary"
              disabled={loading}
            >
              Update Product Titles & Data
            </button>
          </div>
        </div>
        
        {/* Open Food Facts S3 Integration Section */}
        <div className="admin-section">
          <h2>Image Management (Open Food Facts S3)</h2>
          <div className="admin-actions">
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Downloading S3 image list');
                  setMessage('Downloading and processing the list of available images from Open Food Facts S3...');
                  await downloadAndProcessS3List();
                  setMessage('Successfully downloaded and processed the S3 image list. You can now update images.');
                } catch (error) {
                  setMessage(`Error downloading S3 image list: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button"
              disabled={loading}
            >
              1. Download S3 Image List
            </button>
            
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Updating images using S3 lookup');
                  setMessage('Updating chocolate images using the S3 lookup table...');
                  await updateChocolateImages();
                  setMessage('Successfully updated chocolate images using the S3 lookup table.');
                } catch (error) {
                  setMessage(`Error updating images: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button"
              disabled={loading}
            >
              2. Update Images Using S3 Lookup
            </button>
            
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  setCurrentOperation('Running full image update');
                  setMessage('Downloading S3 image list and updating all chocolate images...');
                  await runImageUpdate();
                  setMessage('Successfully completed the full image update process.');
                } catch (error) {
                  setMessage(`Error in image update process: ${error.message}`);
                  console.error('Error:', error);
                } finally {
                  setLoading(false);
                  setCurrentOperation('');
                }
              }}
              className="admin-button primary"
              disabled={loading}
            >
              Run Complete Image Update
            </button>
          </div>
          
          <div className="admin-help">
            <p><strong>How the S3 image update works:</strong></p>
            <ol>
              <li>The process first downloads the complete list of available images from Open Food Facts' S3 bucket</li>
              <li>It builds a lookup table mapping barcodes to available image types</li>
              <li>Then it updates your chocolates with the correct S3 image URLs</li>
              <li>This method is much more efficient than checking each image URL individually</li>
            </ol>
          </div>
        </div>
        
        {/* Open Food Facts Matching Tool Section */}
        <div className="admin-section">
          <h2>Chocolate Matching Tool</h2>
          <p>Match your chocolates with Open Food Facts database</p>
          <ChocolateMatchingTool />
        </div>
        
        {/* Add New Chocolate Section */}
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