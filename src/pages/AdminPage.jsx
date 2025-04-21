// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import addInitialChocolates from '../scripts/addInitialChocolates';
import addCommercialChocolates from '../scripts/addCommercialChocolates';
import addMoreCommercialChocolates from '../scripts/addMoreCommercialChocolates';
import './AdminPage.css'; // We'll create this file next

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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setChocolate({
      ...chocolate,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Form submission is not implemented yet.');
    // In a real implementation, this would call your API to add a new chocolate
  };
  
  const handleBulkUpload = async () => {
    try {
      setLoading(true);
      setMessage('');
      await addInitialChocolates();
      setMessage('Successfully added initial chocolates! Check the console for details.');
    } catch (error) {
      setMessage(`Error adding chocolates: ${error.message}`);
      console.error('Error in bulk upload:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Chocolate Admin Dashboard</h1>
          <Link to="/" className="back-link">Back to Home</Link>
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
      onClick={addCommercialChocolates}
      className="admin-button secondary"
      disabled={loading}
    >
      Add Commercial Chocolates
    </button>
    
    <button 
      onClick={addMoreCommercialChocolates}
      className="admin-button secondary"
      disabled={loading}
    >
      Add 100 More Popular Chocolates
    </button>
    
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
            
            <div className="form-group">
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
            
            <div className="form-group">
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
            
            <button type="submit" className="admin-button">
              Add Chocolate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;