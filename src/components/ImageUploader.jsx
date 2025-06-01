// src/components/ImageUploader.jsx - Updated with HEIC support and better error handling
import { useState } from 'react';
import './ImageUploader.css';

function ImageUploader({ onImageSelected, currentImageUrl = null }) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Convert HEIC to JPEG using canvas
  const convertHeicToJpeg = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Set canvas size (max 1200px width to reduce file size)
        const maxWidth = 1200;
        const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw and convert to JPEG
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Compress large images
  const compressImage = async (file) => {
    // If file is already small enough, return as is
    if (file.size <= 2 * 1024 * 1024) { // 2MB
      return file;
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions to reduce file size
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', 0.7); // Lower quality for compression
      };
      
      img.src = URL.createObjectURL(file);
    });
  };
  
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setError('');
      setUploading(true);
      
      try {
        let processedFile = originalFile;
        
        // Check file size (max 10MB before processing)
        if (originalFile.size > 10 * 1024 * 1024) {
          setError('File too large. Please choose an image under 10MB.');
          setUploading(false);
          return;
        }
        
        // Check if it's a HEIC file
        const isHeic = originalFile.type === 'image/heic' || 
                      originalFile.type === 'image/heif' ||
                      originalFile.name.toLowerCase().endsWith('.heic') ||
                      originalFile.name.toLowerCase().endsWith('.heif');
        
        if (isHeic) {
          console.log('Converting HEIC file to JPEG...');
          try {
            processedFile = await convertHeicToJpeg(originalFile);
            processedFile = new File([processedFile], 
              originalFile.name.replace(/\.(heic|heif)$/i, '.jpg'), 
              { type: 'image/jpeg' }
            );
          } catch (conversionError) {
            console.error('HEIC conversion failed:', conversionError);
            setError('Could not convert HEIC file. Please try a JPG or PNG image.');
            setUploading(false);
            return;
          }
        }
        
        // Compress if still too large
        if (processedFile.size > 2 * 1024 * 1024) {
          console.log('Compressing large image...');
          processedFile = await compressImage(processedFile);
          processedFile = new File([processedFile], 
            processedFile.name || 'compressed_image.jpg', 
            { type: 'image/jpeg' }
          );
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target.result);
        };
        reader.readAsDataURL(processedFile);
        
        // Pass processed file to parent
        onImageSelected(processedFile);
        
        console.log('Image processed successfully:', {
          originalSize: (originalFile.size / 1024 / 1024).toFixed(2) + 'MB',
          processedSize: (processedFile.size / 1024 / 1024).toFixed(2) + 'MB',
          type: processedFile.type
        });
        
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Error processing image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="image-preview-container">
        {preview ? (
          <img src={preview} alt="Preview" className="image-preview" />
        ) : (
          <div className="image-placeholder">
            <span>📷 No Image Selected</span>
          </div>
        )}
      </div>
      
      <div className="upload-controls">
        <label className={`upload-button ${uploading ? 'disabled' : ''}`}>
          {uploading ? 'Processing...' : (currentImageUrl ? 'Change Image' : 'Upload Label Image')}
          <input 
            type="file" 
            accept="image/*,.heic,.heif" 
            onChange={handleFileChange} 
            disabled={uploading}
            style={{ display: 'none' }} 
          />
        </label>
        {uploading && <span className="uploading-text">Processing image...</span>}
      </div>
      
      {error && (
        <div className="error-message" style={{
          color: '#dc2626',
          fontSize: '0.875rem',
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#fee2e2',
          borderRadius: '4px',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}
      
      <div className="upload-info" style={{
        fontSize: '0.75rem',
        color: '#6b7280',
        marginTop: '0.5rem',
        textAlign: 'center'
      }}>
        Supports JPG, PNG, WebP, and HEIC files up to 10MB
      </div>
    </div>
  );
}

export default ImageUploader;