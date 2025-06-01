// src/components/ImageUploader.jsx - Improved HEIC handling
import { useState } from 'react';
import './ImageUploader.css';

function ImageUploader({ onImageSelected, currentImageUrl = null }) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Convert any image to JPEG using canvas
  const convertToJpeg = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        try {
          // Calculate dimensions (max 1200px on longest side)
          const maxSize = 1200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and convert to JPEG
          ctx.fillStyle = 'white'; // White background for transparency
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/jpeg', 0.85); // 85% quality
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      // Clean up object URL after loading
      img.onload = (originalOnload => function() {
        URL.revokeObjectURL(objectUrl);
        return originalOnload.apply(this, arguments);
      })(img.onload);
    });
  };
  
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setError('');
      setUploading(true);
      setProcessingMessage('Processing image...');
      
      try {
        // Check file size (max 15MB before processing)
        if (originalFile.size > 15 * 1024 * 1024) {
          throw new Error('File too large. Please choose an image under 15MB.');
        }
        
        let processedFile = originalFile;
        
        // Check if it's a HEIC file or any image that needs conversion
        const isHeic = originalFile.type === 'image/heic' || 
                      originalFile.type === 'image/heif' ||
                      originalFile.name.toLowerCase().endsWith('.heic') ||
                      originalFile.name.toLowerCase().endsWith('.heif');
        
        const needsConversion = isHeic || 
                               originalFile.size > 3 * 1024 * 1024 || // Over 3MB
                               originalFile.type === 'image/png'; // Convert PNG to JPG for smaller size
        
        if (needsConversion) {
          setProcessingMessage(isHeic ? 'Converting HEIC to JPEG...' : 'Optimizing image...');
          
          try {
            const convertedBlob = await convertToJpeg(originalFile);
            
            // Create new filename
            const originalName = originalFile.name.replace(/\.(heic|heif|png)$/i, '.jpg');
            const newFileName = originalName.includes('.jpg') ? originalName : originalName + '.jpg';
            
            processedFile = new File([convertedBlob], newFileName, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log('Image conversion successful:', {
              originalSize: (originalFile.size / 1024 / 1024).toFixed(2) + 'MB',
              processedSize: (processedFile.size / 1024 / 1024).toFixed(2) + 'MB',
              originalType: originalFile.type,
              processedType: processedFile.type
            });
            
          } catch (conversionError) {
            console.error('Image conversion failed:', conversionError);
            throw new Error('Could not process image. Please try a different image or JPG format.');
          }
        }
        
        // Final size check
        if (processedFile.size > 5 * 1024 * 1024) {
          throw new Error('Processed image is still too large. Please try a smaller image.');
        }
        
        // Create preview
        setProcessingMessage('Creating preview...');
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target.result);
          setProcessingMessage('');
        };
        reader.onerror = () => {
          throw new Error('Failed to create image preview');
        };
        reader.readAsDataURL(processedFile);
        
        // Pass processed file to parent
        onImageSelected(processedFile);
        
        console.log('Image processing completed successfully');
        
      } catch (error) {
        console.error('Error processing image:', error);
        setError(error.message || 'Error processing image. Please try again.');
        setPreview(null);
        onImageSelected(null);
      } finally {
        setUploading(false);
        setProcessingMessage('');
      }
    }
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    onImageSelected(null);
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
        <label className={`upload-button ${uploading ? 'disabled' : ''}`}>
          {uploading ? (processingMessage || 'Processing...') : (preview ? 'Change Image' : 'Upload Label Image')}
          <input 
            type="file" 
            accept="image/*,.heic,.heif" 
            onChange={handleFileChange} 
            disabled={uploading}
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
        Supports JPG, PNG, WebP, and HEIC files up to 15MB
        <br />
        <small>HEIC files will be automatically converted to JPG</small>
      </div>
    </div>
  );
}

export default ImageUploader;