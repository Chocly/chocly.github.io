// src/pages/BatchImageUploadPage.jsx
import { useState, useEffect } from 'react';
import { getAllChocolates, updateChocolateImage } from '../services/chocolateFirebaseService';
import './BatchImageUploadPage.css';

function BatchImageUploadPage() {
  const [chocolates, setChocolates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({});
  
  useEffect(() => {
    const fetchChocolates = async () => {
      try {
        const data = await getAllChocolates();
        // Sort alphabetically
        data.sort((a, b) => a.name.localeCompare(b.name));
        setChocolates(data);
      } catch (error) {
        console.error("Error fetching chocolates:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChocolates();
  }, []);
  
  const handleImageUpload = async (chocolateId, file) => {
    setUploadStatus(prev => ({
      ...prev,
      [chocolateId]: 'uploading'
    }));
    
    try {
      await updateChocolateImage(chocolateId, file);
      setUploadStatus(prev => ({
        ...prev,
        [chocolateId]: 'success'
      }));
      
      // Update the chocolates array with the new image URL
      setChocolates(prev => 
        prev.map(chocolate => 
          chocolate.id === chocolateId 
            ? { ...chocolate, imageUrl: URL.createObjectURL(file) } 
            : chocolate
        )
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus(prev => ({
        ...prev,
        [chocolateId]: 'error'
      }));
    }
  };
  
  return (
    <div className="batch-upload-page">
      <div className="container">
        <h1>Batch Image Upload</h1>
        <p className="page-description">Upload label images for multiple chocolates</p>
        
        {loading ? (
          <div className="loading">Loading chocolates...</div>
        ) : (
          <div className="chocolates-grid">
            {chocolates.map(chocolate => (
              <div key={chocolate.id} className="chocolate-upload-card">
                <div className="chocolate-info">
                  <h3>{chocolate.name}</h3>
                  <p>{chocolate.maker}</p>
                </div>
                
                <div className="chocolate-image-container">
                  {chocolate.imageUrl ? (
                    <img 
                      src={chocolate.imageUrl} 
                      alt={chocolate.name} 
                      className="chocolate-image" 
                    />
                  ) : (
                    <div className="no-image-placeholder">No label image</div>
                  )}
                </div>
                
                <div className="upload-controls">
                  <label className={`upload-button ${uploadStatus[chocolate.id] === 'uploading' ? 'disabled' : ''}`}>
                    {chocolate.imageUrl ? 'Change Image' : 'Upload Image'}
                    <input 
                      type="file"
                      accept="image/*"
                      disabled={uploadStatus[chocolate.id] === 'uploading'}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(chocolate.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  
                  {uploadStatus[chocolate.id] === 'uploading' && (
                    <span className="status-text uploading">Uploading...</span>
                  )}
                  
                  {uploadStatus[chocolate.id] === 'success' && (
                    <span className="status-text success">✓ Uploaded</span>
                  )}
                  
                  {uploadStatus[chocolate.id] === 'error' && (
                    <span className="status-text error">Error uploading</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchImageUploadPage;