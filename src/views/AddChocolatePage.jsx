// Updates to src/pages/AddChocolatePage.jsx
// Add this modified version that removes review requirement and improves mobile UX

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addUserChocolate, searchChocolates } from '../services/chocolateFirebaseService';
import ImageUploader from '../components/ImageUploader';
import './AddChocolatePage.css';

const CHOCOLATE_TYPES = [
  'Dark', 'Milk', 'White', 'Ruby', 'Flavored', 'Filled'
];

const COMMON_FLAVORS = [
  'Fruity', 'Nutty', 'Floral', 'Spicy', 'Earthy', 'Caramel', 
  'Berry', 'Citrus', 'Coffee', 'Honey', 'Creamy', 'Sweet'
];

const ATTRIBUTE_TAGS = [
  'Organic', 'Fair Trade', 'Bean-to-Bar', 'Vegan', 
  'Sugar-Free', 'Single Origin', 'Award Winner'
];

function AddChocolatePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Core form data - minimal required fields
  const [formData, setFormData] = useState({
    name: '',
    maker: '',
    type: '', // Single selection for simplicity
    // Optional fields
    origin: '',
    cacaoPercentage: '',
    flavorTags: [],
    attributeTags: []
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [savedChocolateId, setSavedChocolateId] = useState(null);
  const [quickRating, setQuickRating] = useState(0);
  
  // Duplicate checking
  const [similarChocolates, setSimilarChocolates] = useState([]);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  // Check for duplicates as user types
  useEffect(() => {
    const checkDuplicates = async () => {
      if (formData.name.length > 3 && formData.maker.length > 2) {
        try {
          const results = await searchChocolates(formData.name);
          const similar = results.filter(choc => 
            choc.maker?.toLowerCase().includes(formData.maker.toLowerCase())
          );
          setSimilarChocolates(similar);
        } catch (error) {
          console.error('Error checking duplicates:', error);
        }
      }
    };
    
    const timer = setTimeout(checkDuplicates, 500);
    return () => clearTimeout(timer);
  }, [formData.name, formData.maker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleTagToggle = (tagType, tag) => {
    setFormData(prev => ({
      ...prev,
      [tagType]: prev[tagType].includes(tag)
        ? prev[tagType].filter(t => t !== tag)
        : [...prev[tagType], tag]
    }));
  };

  const handleImageSelected = (file) => {
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Validate only essential fields
    if (!formData.name.trim() || !formData.maker.trim() || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    // Warning for potential duplicates
    if (similarChocolates.length > 0) {
      const confirmAdd = window.confirm(
        'Similar chocolates exist. Are you sure this is a different chocolate?'
      );
      if (!confirmAdd) return;
    }

    setLoading(true);
    
    try {
      const chocolateData = {
        name: formData.name.trim(),
        maker: formData.maker.trim(),
        type: formData.type,
        origin: formData.origin || null,
        cacaoPercentage: formData.cacaoPercentage ? parseInt(formData.cacaoPercentage) : null,
        tags: [...formData.flavorTags, ...formData.attributeTags],
        description: '', // Empty to avoid Firebase errors
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Chocolate Lover'
      };

      const chocolateId = await addUserChocolate(chocolateData, selectedImage);
      setSavedChocolateId(chocolateId);
      
      // Show rating modal instead of requiring review
      setShowRatingModal(true);
      
    } catch (error) {
      console.error('Error adding chocolate:', error);
      alert('Error adding chocolate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRate = (rating) => {
    setQuickRating(rating);
    // Optionally save the quick rating
    // You can implement this to save just a rating without a full review
  };

  const handleSkipRating = () => {
    navigate(`/chocolate/${savedChocolateId}`);
  };

  const handleWriteReview = () => {
    navigate(`/chocolate/${savedChocolateId}?review=true`);
  };

  return (
    <div className="add-chocolate-page mobile-optimized">
      <div className="mobile-container">
        {/* Clean Mobile Header */}
        <div className="mobile-page-header">
          <button 
            className="back-button-mobile"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back</span>
          </button>
          <h1>Add Chocolate</h1>
        </div>

        <form onSubmit={handleSubmit} className="mobile-chocolate-form">
          
          {/* Image Upload - Visual and Easy */}
          <div className="image-section-mobile">
            <ImageUploader
              onImageSelect={handleImageSelected}
              existingImageUrl={null}
              maxSizeInMB={5}
              className="mobile-image-uploader"
            />
            {selectedImage && (
              <p className="image-status">✓ Photo added</p>
            )}
          </div>

          {/* Essential Fields Only */}
          <div className="essential-section">
            <h2 className="section-title-mobile">Essential Info</h2>
            
            <div className="form-group-mobile">
              <label htmlFor="name">Chocolate Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Madagascar 70% or Hazelnut"
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group-mobile">
              <label htmlFor="maker">Maker/Brand *</label>
              <input
                type="text"
                id="maker"
                name="maker"
                value={formData.maker}
                onChange={handleInputChange}
                placeholder="e.g., Theo, Lindt"
                required
                autoComplete="off"
              />
              {similarChocolates.length > 0 && (
                <p className="duplicate-hint">
                  ⚠️ Similar chocolates found
                </p>
              )}
            </div>

            <div className="form-group-mobile">
              <label>Type *</label>
              <div className="type-pills">
                {CHOCOLATE_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-pill ${formData.type === type ? 'selected' : ''}`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Fields - Collapsed */}
          <div className="optional-section">
            <button
              type="button"
              className="optional-toggle-btn"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
            >
              {showOptionalFields ? '−' : '+'} Optional Details
            </button>

            {showOptionalFields && (
              <div className="optional-fields-container">
                <div className="form-row-mobile">
                  <div className="form-group-mobile half">
                    <label htmlFor="origin">Origin</label>
                    <input
                      type="text"
                      id="origin"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="Ecuador"
                    />
                  </div>

                  <div className="form-group-mobile half">
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
                </div>

                <div className="form-group-mobile">
                  <label>Flavor Notes</label>
                  <div className="tag-grid-mobile">
                    {COMMON_FLAVORS.map(flavor => (
                      <button
                        key={flavor}
                        type="button"
                        className={`tag-pill ${formData.flavorTags.includes(flavor) ? 'selected' : ''}`}
                        onClick={() => handleTagToggle('flavorTags', flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-mobile">
                  <label>Special Attributes</label>
                  <div className="tag-grid-mobile">
                    {ATTRIBUTE_TAGS.map(attr => (
                      <button
                        key={attr}
                        type="button"
                        className={`tag-pill ${formData.attributeTags.includes(attr) ? 'selected' : ''}`}
                        onClick={() => handleTagToggle('attributeTags', attr)}
                      >
                        {attr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button - Always Visible */}
          <div className="submit-section-mobile">
            <button 
              type="submit" 
              className="submit-btn-mobile"
              disabled={loading || !formData.name || !formData.maker || !formData.type}
            >
              {loading ? 'Adding...' : 'Add Chocolate'}
            </button>
          </div>
        </form>

        {/* Success Modal with Rating Option */}
        {showRatingModal && (
          <div className="modal-overlay">
            <div className="rating-modal">
              <div className="modal-icon">🍫</div>
              <h2>Success!</h2>
              <p>Chocolate added to the database</p>
              
              <div className="quick-rate-section">
                <p>Quick rate this chocolate:</p>
                <div className="star-buttons">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star-btn ${star <= quickRating ? 'filled' : ''}`}
                      onClick={() => handleQuickRate(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={handleWriteReview} className="review-btn">
                  Write Full Review
                </button>
                <button onClick={handleSkipRating} className="skip-btn">
                  View Chocolate Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddChocolatePage;