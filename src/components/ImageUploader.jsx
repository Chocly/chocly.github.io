// Simplified ImageUploader.jsx - No HEIC conversion
import { useState } from 'react';
import './ImageUploader.css';

function ImageUploader({ onImageSelect, currentImage = null }) {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError('');
      
      // Basic validation
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Please choose an image under 5MB.');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        setError('Please upload a JPG, PNG, or WebP image. HEIC files are not supported.');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Pass file to parent
      if (onImageSelect && typeof onImageSelect === 'function') {
        onImageSelect(file);
      }
    }
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    if (onImageSelect && typeof onImageSelect === 'function') {
      onImageSelect(null);
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="image-preview-container">
        {preview ? (
          <div className="preview-wrapper">
            <img src={preview} alt="Preview" className="image-preview" />
            <button 
              type="button" 
              className="remove-image-btn"
              onClick={handleRemoveImage}
              title="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="image-placeholder">
            <span>📷</span>
            <span>No Image Selected</span>
          </div>
        )}
      </div>
      
      <div className="upload-controls">
        <label className="upload-button">
          {preview ? 'Change Image' : 'Upload Label Image'}
          <input 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/webp" 
            onChange={handleFileChange}
            style={{ display: 'none' }} 
          />
        </label>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="upload-info">
        Supports JPG, PNG, and WebP files up to 5MB
        <br />
        <small>iPhone users: Photos will be automatically converted to JPG</small>
      </div>
    </div>
  );
}

export default ImageUploader;