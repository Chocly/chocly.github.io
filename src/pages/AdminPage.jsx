// src/pages/AdminPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { addChocolate } from '../services/chocolateFirebaseService';
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
          <h2>Admin Tools</h2>
          <div className="admin-actions">
            <p className="info-text">
              Use the form below to manually add new chocolates to the database. 
              For bulk operations, use the Batch Image Upload tool.
            </p>
            
            {message && <div className="message">{message}</div>}
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
                placeholder="e.g., Madagascar Dark 70%"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="makerId">Maker</label>
              <input
                type="text"
                id="makerId"
                name="makerId"
                value={chocolate.makerId}
                onChange={handleChange}
                required
                placeholder="e.g., Valrhona, Lindt, etc."
              />
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
                <option value="Dark Milk">Dark Milk</option>
                <option value="Single Origin">Single Origin</option>
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
                placeholder="e.g., Madagascar, Ecuador, Venezuela"
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
                placeholder="e.g. 70"
              />
            </div>
            
            {/* Image uploader section */}
            <div className="form-group full-width">
              <label>Chocolate Label Image</label>
              <ImageUploader 
                onImageSelected={handleImageSelected}
                currentImageUrl={selectedImageUrl}
              />
              <p className="field-helper">Upload a clear image of the chocolate label or packaging</p>
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
                placeholder="Describe the chocolate's taste, texture, and characteristics..."
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
                placeholder="Comma-separated list: cocoa beans, sugar, cocoa butter, vanilla, etc."
              ></textarea>
              <p className="field-helper">Separate each ingredient with a comma</p>
            </div>
            
            <button type="submit" className="admin-button" disabled={uploading}>
              {uploading ? 'Adding Chocolate...' : 'Add Chocolate'}
            </button>
          </form>
        </div>
        
        <div className="admin-section">
          <h2>Database Statistics</h2>
          <div className="stats-info">
            <p>Use your Firebase console to view detailed database statistics and manage your chocolate collection.</p>
            <p>For bulk image uploads, use the Batch Image Upload tool above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;