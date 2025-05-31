// src/pages/AddChocolatePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addUserChocolate, getAllTags } from '../services/chocolateFirebaseService';
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
  
  const [formData, setFormData] = useState({
    name: '',
    maker: '',
    type: '',
    origin: '',
    cacaoPercentage: '',
    description: '',
    flavorTags: [],
    attributeTags: [],
    customTags: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load existing tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleImageSelected = (file) => {
    setSelectedImage(file);
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.name.trim() && formData.maker.trim();
      case 2:
        return formData.type && selectedImage;
      case 3:
        return true; // Optional step
      case 4:
        return formData.description.trim();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to add chocolates');
      return;
    }

    if (!selectedImage) {
      alert('Please add an image of the chocolate');
      return;
    }

    try {
      setLoading(true);

      // Combine all tags
      const allTags = [
        ...formData.flavorTags,
        ...formData.attributeTags,
        ...formData.customTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      ];

      const chocolateData = {
        name: formData.name.trim(),
        maker: formData.maker.trim(),
        type: formData.type,
        origin: formData.origin.trim() || 'Unknown',
        cacaoPercentage: formData.cacaoPercentage ? parseInt(formData.cacaoPercentage) : 0,
        description: formData.description.trim(),
        tags: allTags,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Anonymous User',
        status: 'pending', // For moderation if needed
        isUserContributed: true
      };

      const result = await addUserChocolate(chocolateData, selectedImage);
      
      setSuccess(true);
      
      // Show success for 3 seconds, then redirect
      setTimeout(() => {
        navigate(`/chocolate/${result.id}`);
      }, 3000);

    } catch (error) {
      console.error('Error adding chocolate:', error);
      alert(`Error adding chocolate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not logged in
  if (!currentUser) {
    return null;
  }

  // Success screen
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

  return (
    <div className="add-chocolate-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Add a New Chocolate</h1>
          <p>Help fellow chocolate lovers discover amazing chocolates!</p>
          
          {/* Progress indicator */}
          <div className="progress-indicator">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`progress-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}>
                <div className="step-number">{i + 1}</div>
                <div className="step-label">
                  {i === 0 && 'Basics'}
                  {i === 1 && 'Details'}
                  {i === 2 && 'Tags'}
                  {i === 3 && 'Description'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-chocolate-form">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Let's start with the basics</h2>
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
                  <small>What's the exact name on the package?</small>
                </div>

                <div className="form-group">
                  <label htmlFor="maker">Maker/Brand *</label>
                  <input
                    type="text"
                    id="maker"
                    name="maker"
                    value={formData.maker}
                    onChange={handleInputChange}
                    placeholder="e.g., Valrhona, Lindt, Local Artisan"
                    required
                  />
                  <small>Who made this chocolate?</small>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Type and Image */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2>Tell us more details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="type">Chocolate Type *</label>
                  <div className="type-selector">
                    {CHOCOLATE_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`type-button ${formData.type === type ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="origin">Origin (Optional)</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="e.g., Ecuador, Madagascar, Peru"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cacaoPercentage">Cacao % (Optional)</label>
                  <input
                    type="number"
                    id="cacaoPercentage"
                    name="cacaoPercentage"
                    value={formData.cacaoPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="form-group image-upload-section">
                <label>Chocolate Image *</label>
                <ImageUploader 
                  onImageSelected={handleImageSelected}
                  currentImageUrl={selectedImage ? URL.createObjectURL(selectedImage) : null}
                />
                <small>A clear photo of the chocolate package or bar</small>
              </div>
            </div>
          )}

          {/* Step 3: Tags */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2>Add some personality</h2>
              <p>These tags help others discover this chocolate</p>
              
              <div className="tags-section">
                <div className="tag-category">
                  <h3>Flavor Notes</h3>
                  <div className="tag-grid">
                    {COMMON_FLAVORS.map(flavor => (
                      <button
                        key={flavor}
                        type="button"
                        className={`tag-button ${formData.flavorTags.includes(flavor) ? 'selected' : ''}`}
                        onClick={() => handleTagToggle('flavorTags', flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tag-category">
                  <h3>Attributes</h3>
                  <div className="tag-grid">
                    {ATTRIBUTE_TAGS.map(attribute => (
                      <button
                        key={attribute}
                        type="button"
                        className={`tag-button ${formData.attributeTags.includes(attribute) ? 'selected' : ''}`}
                        onClick={() => handleTagToggle('attributeTags', attribute)}
                      >
                        {attribute}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="customTags">Custom Tags (Optional)</label>
                  <input
                    type="text"
                    id="customTags"
                    name="customTags"
                    value={formData.customTags}
                    onChange={handleInputChange}
                    placeholder="Separate with commas: smooth, intense, complex"
                  />
                  <small>Add any other descriptive words</small>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Description */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2>Share your thoughts</h2>
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Describe the taste, texture, and overall experience of this chocolate. What makes it special?"
                  required
                />
                <small>Help others understand what makes this chocolate unique</small>
              </div>

              {/* Preview */}
              <div className="chocolate-preview">
                <h3>Preview</h3>
                <div className="preview-card">
                  <div className="preview-image">
                    {selectedImage ? (
                      <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                    ) : (
                      <div className="no-image">No image</div>
                    )}
                  </div>
                  <div className="preview-content">
                    <h4>{formData.name || 'Chocolate Name'}</h4>
                    <p className="maker">{formData.maker || 'Maker'}</p>
                    <div className="preview-tags">
                      {[...formData.flavorTags, ...formData.attributeTags].slice(0, 3).map(tag => (
                        <span key={tag} className="preview-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="nav-button secondary">
                Previous
              </button>
            )}
            
            <div className="nav-spacer"></div>
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="nav-button primary"
                disabled={!validateStep(currentStep)}
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                className="nav-button primary submit-button"
                disabled={loading || !validateStep(currentStep)}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Adding Chocolate...
                  </>
                ) : (
                  <>
                    🍫 Add Chocolate
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddChocolatePage;