// src/components/ImageUploader.jsx
import { useState } from 'react';
import './ImageUploader.css';

function ImageUploader({ onImageSelected, currentImageUrl = null }) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // Pass the file to parent component
      onImageSelected(selectedFile);
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="image-preview-container">
        {preview ? (
          <img src={preview} alt="Preview" className="image-preview" />
        ) : (
          <div className="image-placeholder">
            <span>No Image Selected</span>
          </div>
        )}
      </div>
      
      <div className="upload-controls">
        <label className="upload-button">
          {currentImageUrl ? 'Change Image' : 'Upload Label Image'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading}
            style={{ display: 'none' }} 
          />
        </label>
        {uploading && <span className="uploading-text">Uploading...</span>}
      </div>
    </div>
  );
}

export default ImageUploader;