// src/pages/AddChocolatePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addUserChocolate, getAllTags, searchChocolates } from '../services/chocolateFirebaseService';
import { addReview } from '../services/reviewService';
import ImageUploader from '../components/ImageUploader';
import './AddChocolatePage.css';

// Predefined chocolate types for easy selection
const CHOCOLATE_TYPES = [
  'Dark', 'Milk', 'White', 'Ruby', 'Dark Milk', 'Single Origin', 'Flavored'
];

// Common flavor tags
const COMMON_FLAVORS = [
  'Fruity', 'Nutty', 'Floral', 'Spicy', 'Earthy', 'Caramel', 'Vanilla',
  'Berry', 'Citrus', 'Coffee', 'Honey', 'Smoky', 'Creamy', 'Bitter', 'Sweet'
];

// Attribute tags
const ATTRIBUTE_TAGS = [
  'Organic', 'Fair Trade', 'Bean-to-Bar', 'Raw', 'Sugar-Free', 'Dairy-Free',
  'Vegan', 'Gluten-Free', 'Single Estate', 'Award Winner'
];

function AddChocolatePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  const [formData, setFormData] = useState({
    name: '',
    maker: '',
    type: '',
    origin: '',
    cacaoPercentage: '',
    flavorTags: [],
    attributeTags: [],
    customTags: ''
  });
  
  // Review data (replaces description)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    text: '',
    title: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Duplicate checking
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isDuplicateCheckLoading, setIsDuplicateCheckLoading] = useState(false);
  const [foundSimilarChocolates, setFoundSimilarChocolates] = useState([]);

  // Load existing tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        // You can use these tags if you want to show existing tags
        console.log('Available tags:', tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  // Duplicate checking function
  const findSimilarChocolates = async (name, maker, type) => {
    try {
      // Search by name + maker combination
      const nameSearchResults = await searchChocolates(`${name} ${maker}`);
      
      // Filter for potential duplicates
      const potentialDuplicates = nameSearchResults.filter(choc => {
        const nameSimilarity = choc.name.toLowerCase().includes(name.toLowerCase()) ||
                              name.toLowerCase().includes(choc.name.toLowerCase());
        const makerMatch = choc.maker.toLowerCase() === maker.toLowerCase();
        const typeMatch = choc.type === type;
        
        // Consider it a potential duplicate if:
        // 1. Same maker + similar name, OR
        // 2. Similar name + same type (different maker might be typo)
        return (nameSimilarity && makerMatch) || (nameSimilarity && typeMatch);
      });
      
      return potentialDuplicates;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };

  const checkForDuplicates = async () => {
    if (!formData.name.trim() || !formData.maker.trim()) return;
    
    setIsDuplicateCheckLoading(true);
    try {
      const potentialDuplicates = await findSimilarChocolates(
        formData.name.trim(),
        formData.maker.trim(), 
        formData.type
      );
      
      if (potentialDuplicates.length > 0) {
        setFoundSimilarChocolates(potentialDuplicates);
        setDuplicateWarning(`Found ${potentialDuplicates.length} similar chocolate(s). Please review before continuing.`);
      } else {
        setDuplicateWarning(null);
        setFoundSimilarChocolates([]);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setIsDuplicateCheckLoading(false);
    }
  };

  // Run duplicate check when name, maker, or type changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      checkForDuplicates();
    }, 1000);
    
    return () => clearTimeout(debounceTimer);
  }, [formData.name, formData.maker, formData.type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setReviewData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleImageSelected = (file) => {
    setSelectedImage(file);
  };

  const handleTagToggle = (tagType, tag) => {
    setFormData(prev => ({
      ...prev,
      [tagType]: prev[tagType].includes(tag)
        ? prev[tagType].filter(t => t !== tag)
        : [...prev[tagType], tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to add chocolates');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a chocolate name');
      return;
    }

    if (!formData.maker.trim()) {
      alert('Please enter a maker name');
      return;
    }

    if (!formData.type) {
      alert('Please select a chocolate type');
      return;
    }

    if (!reviewData.rating) {
      alert('Please select a rating');
      return;
    }

    if (!reviewData.text.trim()) {
      alert('Please write a review');
      return;
    }

    // Warn about duplicates
    if (foundSimilarChocolates.length > 0) {
      const confirmed = window.confirm(
        `Warning: Found ${foundSimilarChocolates.length} similar chocolate(s). Are you sure this is a new, unique chocolate?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Form submission started');

      // Combine all tags
      const allTags = [
        ...formData.flavorTags,
        ...formData.attributeTags,
        ...formData.customTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      ];

      // Prepare chocolate data (no description - let reviews provide details)
      const chocolateData = {
        name: formData.name.trim(),
        maker: formData.maker.trim(),
        type: formData.type,
        origin: formData.origin.trim() || 'Unknown',
        cacaoPercentage: formData.cacaoPercentage ? parseInt(formData.cacaoPercentage) : 0,
        description: '', // Empty - reviews will provide content
        tags: allTags,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User'
      };

      console.log('📦 Prepared chocolate data:', chocolateData);
      console.log('🖼️ Selected image:', selectedImage ? {
        name: selectedImage.name,
        size: `${(selectedImage.size / 1024 / 1024).toFixed(2)}MB`,
        type: selectedImage.type
      } : 'No image selected');

      // Add the chocolate using your existing service
      console.log('📤 Calling addUserChocolate...');
      const result = await addUserChocolate(chocolateData, selectedImage);
      
      console.log('✅ Upload completed successfully:', result);

      // Add the user's initial review for this chocolate
      const reviewPayload = {
        chocolateId: result.id,
        userId: currentUser.uid,
        user: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User', // Match field name used in ChocolateDetailPage
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || null,
        rating: reviewData.rating,
        text: reviewData.text.trim(),
        title: reviewData.title.trim() || undefined,
        isFirstReview: true, // Flag to indicate this is the contributor's initial review
        helpful: 0,
        chocolate: {
          id: result.id,
          name: result.name,
          maker: result.maker,
          imageUrl: result.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
        }
      };

      console.log('📝 Adding initial review:', reviewPayload);
      
      // Debug the current user information
      console.log('🔍 Debug Current User Info:');
      console.log('- UID:', currentUser.uid);
      console.log('- Display Name:', currentUser.displayName);
      console.log('- Email:', currentUser.email);
      console.log('- Photo URL:', currentUser.photoURL);
      
      await addReview(reviewPayload);
      
      setSuccess(true);
      
      // Show success for 3 seconds, then redirect
      setTimeout(() => {
        console.log('🔄 Redirecting to chocolate page:', `/chocolate/${result.id}`);
        navigate(`/chocolate/${result.id}`);
      }, 3000);
      
    } catch (error) {
      console.error('💥 Submit error:', error);
      
      // Provide specific error messages based on your existing error handling
      let errorMessage = 'Failed to add chocolate. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Storage permission denied. Please try signing out and back in.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage += 'Upload failed due to network issues. Please try again.';
      } else if (error.message?.includes('CORS')) {
        errorMessage += 'Network configuration issue. Please try again in a few minutes.';
      } else if (error.message?.includes('storage')) {
        errorMessage += 'Image upload failed. The chocolate data was saved but without the image.';
      } else if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please make sure you are signed in.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      errorMessage += '\n\nPlease try again or contact support if the problem persists.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not logged in
  if (!currentUser) {
    return null;
  }

  // Success screen (using your existing pattern)
  if (success) {
    return (
      <div className="add-chocolate-success">
        <div className="container">
          <div className="success-animation">
            <div className="success-icon">🍫</div>
            <h1>Chocolate Added Successfully!</h1>
            <p>Thank you for contributing to our chocolate database!</p>
            <div className="success-details">
              <p>Your chocolate "<strong>{formData.name}</strong>" has been added and is now available for everyone to discover and review.</p>
              <p>Your review is now the first one for this chocolate!</p>
            </div>
            <div className="loading-redirect">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Redirecting to your chocolate...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = formData.name.trim() && formData.maker.trim() && formData.type && 
                     reviewData.rating > 0 && reviewData.text.trim();

// REPLACE the existing page header JSX with this simplified version:
return (
  <div className="add-chocolate-page">
    <div className="container">
      {/* Simplified Header - NO Progress Bar */}
      <div className="page-header">
        <h1>Add Your Chocolate Discovery</h1>
        <p>Share a new chocolate and write the first review!</p>
      </div>

      <form onSubmit={handleSubmit} className="add-chocolate-form">
        {/* Rest of your form remains exactly the same */}
        
        {/* Essential Info Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">✨</span>
            <h2>Chocolate Details</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Chocolate Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Madagascar Dark 70%"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maker">Maker/Brand *</label>
              <input
                type="text"
                id="maker"
                name="maker"
                value={formData.maker}
                onChange={handleInputChange}
                placeholder="e.g., Valrhona, Lindt"
                required
              />
            </div>
          </div>

          <div className="form-grid-three">
            <div className="form-group">
              <label htmlFor="origin">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="e.g., Ecuador"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cacaoPercentage">Cacao %</label>
              <input
                type="number"
                id="cacaoPercentage"
                name="cacaoPercentage"
                value={formData.cacaoPercentage}
                onChange={handleInputChange}
                placeholder="70"
                min="1"
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <div className="type-selector">
                {CHOCOLATE_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`type-button ${formData.type === type ? 'selected' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Review Section - FIXED star rating */}
        <div className="form-section review-section">
          <div className="section-header">
            <span className="section-icon">⭐</span>
            <h3>Write the First Review *</h3>
          </div>
          <p className="review-intro">As the contributor, your review will be the first one for this chocolate!</p>
          
          <div className="form-group rating-group">
            <label>Your Rating *</label>
            <div className="rating-input-container">
              <div className="rating-input" role="radiogroup" aria-label="Rate this chocolate from 1 to 5 stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`star-button ${star <= reviewData.rating ? 'filled' : ''}`}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    aria-pressed={star <= reviewData.rating}
                    title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {reviewData.rating > 0 && (
                <div className="rating-feedback">
                  <span className="rating-text">
                    {reviewData.rating === 1 && "Poor"}
                    {reviewData.rating === 2 && "Fair"}
                    {reviewData.rating === 3 && "Good"}
                    {reviewData.rating === 4 && "Very Good"}
                    {reviewData.rating === 5 && "Excellent"}
                  </span>
                  <span className="rating-description">
                    ({reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reviewTitle">Review Title (Optional)</label>
            <input
              type="text"
              id="reviewTitle"
              name="title"
              value={reviewData.title}
              onChange={handleReviewChange}
              placeholder="e.g., Rich and complex with berry notes"
              maxLength={100}
            />
            <small>Give your review a catchy title</small>
          </div>

          <div className="form-group">
            <label htmlFor="reviewText">Your Review *</label>
            <textarea
              id="reviewText"
              name="text"
              value={reviewData.text}
              onChange={handleReviewChange}
              placeholder="Share your experience with this chocolate. What did you taste? How was the texture? Would you recommend it?"
              rows="4"
              required
              maxLength={1000}
            />
            <div className="textarea-footer">
              <small className="character-count">
                {reviewData.text.length}/1000 characters
              </small>
              <small className="helper-text">
                This will become the first review for this chocolate and help others decide if they want to try it.
              </small>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">📸</span>
            <h3>Add a Photo</h3>
          </div>
          <p>Help others see what this chocolate looks like!</p>
          
          <ImageUploader
            onImageSelect={setSelectedImage}
            currentImage={selectedImage}
            accept="image/*"
            maxSizeMB={5}
          />
        </div>

        {/* Submit Button */}
        <div className="form-navigation">
          <button 
            type="submit" 
            className={`submit-button ${isFormValid && !loading ? 'ready' : ''}`}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Adding Chocolate...
              </>
            ) : (
              'Add Chocolate & Review'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);


}

// Export the AddChocolatePage component
export default AddChocolatePage;