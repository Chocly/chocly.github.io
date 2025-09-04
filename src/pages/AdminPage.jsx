// src/pages/AdminPage.jsx - Updated with Review Count Updater
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { addChocolate, updateAllChocolatesWithReviewCount } from '../services/chocolateFirebaseService';
import './AdminPage.css';

function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chocolate, setChocolate] = useState({
    name: '',
    makerId: '',
    type: '',
    origin: '',
    cacaoPercentage: '',
    description: '',
    ingredients: ''
  });
  
  // Image handling state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Review count update state
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  
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
        ingredients: chocolate.ingredients.split(',').map(item => item.trim())
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
        ingredients: ''
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
  
  // Handle review count update
  const handleUpdateReviewCounts = async () => {
    setUpdateLoading(true);
    setUpdateResult(null);
    try {
      const result = await updateAllChocolatesWithReviewCount();
      setUpdateResult(result);
    } catch (error) {
      setUpdateResult({ error: error.message });
    } finally {
      setUpdateLoading(false);
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
        
        {/* NEW SECTION: Database Maintenance Tools */}
        <div className="admin-section">
          <h2>🔧 Database Maintenance</h2>
          <div className="admin-actions">
            <div>
              <h3>Update Review Counts</h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                This will update the review count for all chocolates in the database. 
                Run this if review counts are missing or showing as 0.
              </p>
              <button 
                onClick={handleUpdateReviewCounts} 
                disabled={updateLoading}
                className="admin-button primary"
                style={{ marginBottom: '1rem' }}
              >
                {updateLoading ? 'Updating... (this may take a minute)' : 'Update All Review Counts'}
              </button>
              
              {updateResult && (
                <div className="message" style={{
                  backgroundColor: updateResult.error ? '#fee' : '#efe',
                  borderLeftColor: updateResult.error ? '#dc3545' : '#28a745'
                }}>
                  {updateResult.error ? (
                    <p>❌ Error: {updateResult.error}</p>
                  ) : (
                    <div>
                      <p>✅ <strong>Success!</strong></p>
                      <p>Updated: {updateResult.updated} chocolates</p>
                      <p>Skipped: {updateResult.skipped} (already had review counts)</p>
                      <p>Total processed: {updateResult.total}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* EXISTING SECTION: Admin Tools */}
        <div className="admin-section">
          <h2>Admin Tools</h2>
          <div className="admin-actions">
            <p className="info-text">
              Use the form below to manually add new chocolates to the database. 
              For bulk operations, use the Batch Image Upload tool.
            </p>
          </div>
        </div>

        {/* EXISTING SECTION: Add New Chocolate Form */}
        <div className="admin-section">
          <h2>Add New Chocolate</h2>
          
          {message && (
            <div className="message">{message}</div>
          )}
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Chocolate Name *</label>
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
              <label htmlFor="makerId">Maker ID *</label>
              <input
                type="text"
                id="makerId"
                name="makerId"
                value={chocolate.makerId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={chocolate.type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                <option value="Dark">Dark</option>
                <option value="Milk">Milk</option>
                <option value="White">White</option>
                <option value="Ruby">Ruby</option>
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
              />
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
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="ingredients">Ingredients (comma-separated)</label>
              <input
                type="text"
                id="ingredients"
                name="ingredients"
                value={chocolate.ingredients}
                onChange={handleChange}
                placeholder="e.g., Cacao beans, Sugar, Vanilla"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Chocolate Image</label>
              <ImageUploader 
                onImageSelected={handleImageSelected}
                currentImage={selectedImageUrl}
                isUploading={uploading}
              />
            </div>
            
            <div className="form-group full-width">
              <button 
                type="submit" 
                className="admin-button primary"
                disabled={uploading}
              >
                {uploading ? 'Adding Chocolate...' : 'Add Chocolate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;