// src/pages/AddChocolatePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addUserChocolate, getAllTags, searchChocolates } from '../services/chocolateFirebaseService';
import { addReview } from '../services/reviewService';
import ImageUploader from '../components/ImageUploader';
import './AddChocolatePage.css';

// Updated chocolate types - removed Single Origin, clarified options
const CHOCOLATE_TYPES = [
  'Dark', 'Milk', 'White', 'Ruby', 'Dark Milk', 'Flavored/Infused', 'Blonde'
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
    types: [], // Changed to array for multiple selection
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
  
  // State for mobile tag sections
  const [expandedSections, setExpandedSections] = useState({
    flavors: false,
    attributes: false
  });
  
  // Duplicate checking
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isDuplicateCheckLoading, setIsDuplicateCheckLoading] = useState(false);
  const [foundSimilarChocolates, setFoundSimilarChocolates] = useState([]);

  // Load existing tags
  useEffect(() => {
    const loadTags = async () => {
      const tags = await getAllTags();
      // You could use these to supplement the predefined tags if needed
    };
    loadTags();
  }, []);

  // Function to check for duplicate chocolates
  const checkForDuplicates = async () => {
    if (!formData.name || !formData.maker) {
      setDuplicateWarning(null);
      setFoundSimilarChocolates([]);
      return;
    }

    setIsDuplicateCheckLoading(true);
    
    try {
      const searchQuery = `${formData.name} ${formData.maker}`.toLowerCase();
      const results = await searchChocolates(searchQuery);
      
      const exactMatch = results.find(choc => 
        choc.name.toLowerCase() === formData.name.toLowerCase() &&
        choc.maker.toLowerCase() === formData.maker.toLowerCase()
      );
      
      const similarChocolates = results.filter(choc => 
        choc.maker.toLowerCase() === formData.maker.toLowerCase() &&
        (choc.name.toLowerCase().includes(formData.name.toLowerCase()) ||
         formData.name.toLowerCase().includes(choc.name.toLowerCase()))
      );
      
      setFoundSimilarChocolates(similarChocolates);
      
      if (exactMatch) {
        setDuplicateWarning(`⚠️ This chocolate already exists! 
Found: "${exactMatch.name}" by ${exactMatch.maker}
Please review before continuing.`);
      } else if (similarChocolates.length > 0) {
        setDuplicateWarning(`⚠️ Found ${similarChocolates.length} similar chocolate(s) from ${formData.maker}. 
Please review before continuing.`);
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
  }, [formData.name, formData.maker, formData.types]);

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

  const handleTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
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

    if (formData.types.length === 0) {
      alert('Please select at least one chocolate type');
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
        type: formData.types.join(', '), // Join multiple types
        origin: formData.origin.trim() || null, // Optional - null if empty
        cacaoPercentage: formData.cacaoPercentage ? parseInt(formData.cacaoPercentage) : null,
        tags: allTags,
        // Let reviews tell the story - no description field
      };

      // Add the chocolate (with image if provided)
      const chocolateId = await addUserChocolate(chocolateData, selectedImage);
      console.log('✅ Chocolate added successfully:', chocolateId);

      // Add the first review
      const reviewToAdd = {
        ...reviewData,
        chocolateId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Chocolate Lover',
        userPhotoURL: currentUser.photoURL || null,
        helpfulVotes: 0,
        createdAt: new Date()
      };

      await addReview(reviewToAdd);
      console.log('✅ Review added successfully');

      // Show success modal
      setShowSuccessModal(true);
      setSuccess(true);
      
      // Navigate after delay
      setTimeout(() => {
        navigate(`/chocolate/${chocolateId}`);
      }, 2000);

    } catch (error) {
      console.error('❌ Error adding chocolate:', error);
      alert(`Error adding chocolate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-chocolate-page">
      <div className="container">
        {/* Simplified Header - NO Progress Bar */}
        <div className="page-header">
          <h1>Create a New Chocolate Page</h1>
          <p>Add a chocolate to our database and be the first to review it!</p>
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
                <label htmlFor="name">Chocolate Name / Flavor *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Madagascar Dark 70% or Raspberry Truffle"
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
                <label htmlFor="type">Type * (Select all that apply)</label>
                <div className="type-selector">
                  {CHOCOLATE_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeToggle(type)}
                      className={`type-button ${formData.types.includes(type) ? 'selected' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="duplicate-warning">
                <p>{duplicateWarning}</p>
                {foundSimilarChocolates.length > 0 && (
                  <div className="similar-chocolates">
                    <p>Similar chocolates found:</p>
                    <ul>
                      {foundSimilarChocolates.map(choc => (
                        <li key={choc.id}>
                          <a href={`/chocolate/${choc.id}`} target="_blank" rel="noopener noreferrer">
                            {choc.name} by {choc.maker}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Flavor Profile Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🍫</span>
              <h2>Flavor Profile</h2>
            </div>
            
            <div className="tag-selection">
              <p className="tag-helper">Select all flavors you taste:</p>
              
              {/* Mobile-only selected summary */}
              {formData.flavorTags.length > 0 && (
                <div className="selected-tags-summary">
                  <strong>{formData.flavorTags.length} selected:</strong> {formData.flavorTags.join(', ')}
                </div>
              )}
              
              <div className={`tag-section-wrapper ${expandedSections.flavors ? 'expanded' : ''}`}>
                <div className="tag-scroll-container">
                  <div className="tag-grid">
                    {COMMON_FLAVORS.map(flavor => (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => handleTagToggle('flavorTags', flavor)}
                        className={`tag-button ${formData.flavorTags.includes(flavor) ? 'selected' : ''}`}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mobile expand/collapse button */}
                <button
                  type="button"
                  className={`tag-expand-toggle ${expandedSections.flavors ? 'expanded' : ''}`}
                  onClick={() => setExpandedSections(prev => ({ ...prev, flavors: !prev.flavors }))}
                >
                  {expandedSections.flavors ? 'Show Less' : 'Show All Flavors'}
                </button>
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🏆</span>
              <h2>Special Attributes</h2>
            </div>
            
            <div className="tag-selection">
              <p className="tag-helper">Check all that apply:</p>
              
              {/* Mobile-only selected summary */}
              {formData.attributeTags.length > 0 && (
                <div className="selected-tags-summary">
                  <strong>{formData.attributeTags.length} selected:</strong> {formData.attributeTags.join(', ')}
                </div>
              )}
              
              <div className={`tag-section-wrapper ${expandedSections.attributes ? 'expanded' : ''}`}>
                <div className="tag-scroll-container">
                  <div className="tag-grid">
                    {ATTRIBUTE_TAGS.map(attribute => (
                      <button
                        key={attribute}
                        type="button"
                        onClick={() => handleTagToggle('attributeTags', attribute)}
                        className={`tag-button ${formData.attributeTags.includes(attribute) ? 'selected' : ''}`}
                      >
                        {attribute}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mobile expand/collapse button */}
                <button
                  type="button"
                  className={`tag-expand-toggle ${expandedSections.attributes ? 'expanded' : ''}`}
                  onClick={() => setExpandedSections(prev => ({ ...prev, attributes: !prev.attributes }))}
                >
                  {expandedSections.attributes ? 'Show Less' : 'Show All Attributes'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="customTags">Additional Tags</label>
              <input
                type="text"
                id="customTags"
                name="customTags"
                value={formData.customTags}
                onChange={handleInputChange}
                placeholder="Add custom tags separated by commas"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📷</span>
              <h2>Add a Photo</h2>
            </div>
            
            <ImageUploader
              onImageSelected={handleImageSelected}
              existingImageUrl={null}
              maxSizeInMB={5}
            />
            {selectedImage && (
              <p className="image-selected">✓ Image selected: {selectedImage.name}</p>
            )}
          </div>

          {/* Review Section - Enhanced styling */}
          <div className="form-section review-section-enhanced">
            <div className="section-header">
              <span className="section-icon">⭐</span>
              <h2>Write the First Review!</h2>
            </div>
            
            <div className="review-intro-enhanced">
              <p>Be the first to share your thoughts about this chocolate! Your review helps others discover great chocolate.</p>
            </div>
            
            {/* Rating Group */}
            <div className="rating-group">
              <label>Your Rating *</label>
              <div className="rating-input-container">
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={`star-button ${reviewData.rating >= star ? 'filled' : ''}`}
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {reviewData.rating > 0 && (
                  <div className="rating-feedback" data-rating={reviewData.rating}>
                    <span className="rating-text">
                      {reviewData.rating === 1 && 'Not for me'}
                      {reviewData.rating === 2 && 'It was okay'}
                      {reviewData.rating === 3 && 'Good chocolate'}
                      {reviewData.rating === 4 && 'Really enjoyed it!'}
                      {reviewData.rating === 5 && 'Outstanding!'}
                    </span>
                    <span className="rating-description">
                      {reviewData.rating === 1 && 'This chocolate didn\'t meet my expectations'}
                      {reviewData.rating === 2 && 'Average, but I\'ve had better'}
                      {reviewData.rating === 3 && 'A solid chocolate worth trying'}
                      {reviewData.rating === 4 && 'Definitely would buy again'}
                      {reviewData.rating === 5 && 'One of the best I\'ve ever had!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Review Title */}
            <div className="form-group">
              <label htmlFor="reviewTitle">Review Title *</label>
              <input
                type="text"
                id="reviewTitle"
                name="title"
                value={reviewData.title}
                onChange={handleReviewChange}
                placeholder="Sum up your experience in a few words"
                maxLength="100"
                required
              />
            </div>
            
            {/* Review Text */}
            <div className="form-group">
              <label htmlFor="reviewText">Your Review *</label>
              <textarea
                id="reviewText"
                name="text"
                value={reviewData.text}
                onChange={handleReviewChange}
                placeholder="Share your tasting notes, texture, aroma, and overall experience..."
                rows="6"
                required
                minLength="50"
                maxLength="2000"
              />
              <div className="textarea-footer">
                <span className={`character-count ${
                  reviewData.text.length < 50 ? 'text-warning' : 
                  reviewData.text.length > 1800 ? 'text-danger' : ''
                }`}>
                  {reviewData.text.length} / 2000 characters
                  {reviewData.text.length < 50 && ` (min 50)`}
                </span>
                <span className="helper-text">
                  {reviewData.text.length < 50 ? 
                    'Add more details about taste, texture, and experience' :
                    'Great review! Help others discover amazing chocolate'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || formData.types.length === 0}
            >
              {loading ? 'Adding Chocolate...' : 'Add Chocolate & Review'}
            </button>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="success-modal">
              <div className="success-icon">🎉</div>
              <h2>Chocolate Added Successfully!</h2>
              <p>Thank you for contributing to our chocolate community!</p>
              <div className="success-animation">
                <div className="chocolate-icon">🍫</div>
              </div>
              <p className="redirect-message">Redirecting to your chocolate page...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddChocolatePage;