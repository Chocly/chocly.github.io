// src/pages/SuperAdminEditPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSuperAdmin } from '../config/adminConfig';
import { getChocolateById, updateChocolateImage, deleteChocolate } from '../services/chocolateFirebaseService';
import { getChocolateReviews, deleteReview } from '../services/reviewService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ImageUploader from '../components/ImageUploader';
import RatingStars from '../components/RatingStars';
import './SuperAdminEditPage.css'; // Create this for styling

function SuperAdminEditPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [chocolate, setChocolate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    maker: '',
    type: '',
    origin: '',
    cacaoPercentage: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Check if user is super admin
  useEffect(() => {
    if (!currentUser || !isSuperAdmin(currentUser)) {
      alert('Access denied. Super admin only.');
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Load chocolate data and reviews
  useEffect(() => {
    loadChocolateAndReviews();
  }, [id]);

  const loadChocolateAndReviews = async () => {
    try {
      setLoading(true);
      
      // Load chocolate data
      const data = await getChocolateById(id);
      setChocolate(data);
      setFormData({
        name: data.name || '',
        maker: data.maker || '',
        type: data.type || '',
        origin: data.origin || '',
        cacaoPercentage: data.cacaoPercentage || '',
        description: data.description || ''
      });
      
      // Load reviews for this chocolate
      const chocolateReviews = await getChocolateReviews(id);
      setReviews(chocolateReviews);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      alert('Failed to load chocolate');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSuperAdmin(currentUser)) {
      alert('Access denied');
      return;
    }

    setSaving(true);
    
    try {
      // Update chocolate details
      const chocolateRef = doc(db, 'chocolates', id);
      const updateData = {
        name: formData.name.trim(),
        maker: formData.maker.trim(),
        type: formData.type.trim(),
        origin: formData.origin.trim() || null,
        cacaoPercentage: formData.cacaoPercentage ? parseInt(formData.cacaoPercentage) : null,
        description: formData.description.trim() || '',
        updatedAt: new Date(),
        updatedBy: currentUser.uid,
        updatedByEmail: currentUser.email
      };

      await updateDoc(chocolateRef, updateData);
      console.log('✅ Chocolate details updated');

      // Update image if selected
      if (selectedImage) {
        console.log('📤 Updating image...');
        await updateChocolateImage(id, selectedImage);
        console.log('✅ Image updated');
      }

      alert('Chocolate updated successfully!');
      navigate(`/chocolate/${id}`);
    } catch (error) {
      console.error('❌ Error updating chocolate:', error);
      alert(`Failed to update: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isSuperAdmin(currentUser)) {
      alert('Access denied');
      return;
    }

    const confirmDelete = window.confirm(
      '⚠️ Delete this review?\n\nThis action cannot be undone.'
    );

    if (!confirmDelete) return;

    setDeletingReviewId(reviewId);
    
    try {
      console.log('🗑️ Deleting review:', reviewId);
      await deleteReview(reviewId);
      console.log('✅ Review deleted successfully');
      
      // Reload reviews
      const updatedReviews = await getChocolateReviews(id);
      setReviews(updatedReviews);
      
      alert('Review deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      alert(`Failed to delete review: ${error.message}`);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDelete = async () => {
    // Verify the confirmation text matches
    if (deleteConfirmText !== chocolate.name) {
      alert('Please type the chocolate name exactly to confirm deletion');
      return;
    }

    if (!isSuperAdmin(currentUser)) {
      alert('Access denied');
      return;
    }

    // Final confirmation
    const finalConfirm = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\n` +
      `You are about to permanently delete:\n` +
      `"${chocolate.name}" by ${chocolate.maker}\n\n` +
      `This action CANNOT be undone.\n` +
      `Reviews: ${chocolate.reviewCount || 0}\n` +
      `Rating: ${chocolate.averageRating?.toFixed(1) || 'N/A'}\n\n` +
      `Are you absolutely sure?`
    );

    if (!finalConfirm) return;

    setSaving(true);
    
    try {
      console.log('🗑️ Deleting chocolate:', id);
      await deleteChocolate(id);
      console.log('✅ Chocolate deleted successfully');
      
      alert('Chocolate deleted successfully');
      navigate('/browse'); // Redirect to browse page after deletion
    } catch (error) {
      console.error('❌ Error deleting chocolate:', error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!chocolate) return <div className="error">Chocolate not found</div>;

  return (
    <div className="super-admin-edit-page">
      <div className="container">
        <div className="admin-header">
          <h1>🛡️ Super Admin Edit</h1>
          <p>Editing: {chocolate.name} by {chocolate.maker}</p>
          <div className="admin-badge">Super Admin Mode</div>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Basic Details */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Chocolate Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Maker/Brand *</label>
              <input
                type="text"
                name="maker"
                value={formData.maker}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., Dark, Milk, White"
              />
            </div>

            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="e.g., Ecuador, Madagascar"
              />
            </div>

            <div className="form-group">
              <label>Cacao Percentage</label>
              <input
                type="number"
                name="cacaoPercentage"
                value={formData.cacaoPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Brief description..."
              />
            </div>
          </div>

          {/* Image Section */}
          <div className="form-section">
            <h2>Chocolate Image</h2>
            
            {chocolate.imageUrl && !chocolate.imageUrl.includes('placehold') && (
              <div className="current-image">
                <p>Current image:</p>
                <img 
                  src={chocolate.imageUrl} 
                  alt={chocolate.name}
                  style={{ maxWidth: '300px', height: 'auto' }}
                />
              </div>
            )}

            <div className="new-image-upload">
              <p>{chocolate.imageUrl ? 'Replace with new image:' : 'Add image:'}</p>
              <ImageUploader
                onImageSelect={setSelectedImage}
                currentImage={selectedImage}
                maxSizeMB={5}
              />
              {selectedImage && (
                <p className="image-selected">✓ New image selected: {selectedImage.name}</p>
              )}
            </div>
          </div>

          {/* Reviews Management Section */}
          <div className="form-section reviews-management">
            <h2>Reviews Management ({reviews.length} total)</h2>
            
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-item-admin">
                    <div className="review-header">
                      <div className="review-user-info">
                        <strong>{review.userName || review.user || 'Anonymous'}</strong>
                        <span className="review-date">
                          {review.createdAt && (
                            new Date(
                              review.createdAt.toDate ? review.createdAt.toDate() : review.createdAt
                            ).toLocaleDateString()
                          )}
                        </span>
                      </div>
                      <div className="review-rating">
                        <RatingStars rating={review.rating} />
                        <span className="rating-number">({review.rating})</span>
                      </div>
                    </div>
                    
                    <div className="review-text">
                      {review.text}
                    </div>
                    
                    <div className="review-actions">
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        className="delete-review-btn"
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {deletingReviewId === review.id ? 'Deleting...' : '🗑️ Delete Review'}
                      </button>
                      
                      {/* Spam/Inappropriate flags if present */}
                      {review.flagged && (
                        <span className="review-flag" style={{ 
                          color: '#dc3545', 
                          marginLeft: '10px',
                          fontSize: '0.875rem'
                        }}>
                          ⚠️ Flagged as inappropriate
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews yet for this chocolate.</p>
            )}
          </div>

          {/* Metadata (Read-only) */}
          <div className="form-section metadata">
            <h2>Metadata (Read-only)</h2>
            <div className="metadata-grid">
              <div>
                <strong>ID:</strong> {chocolate.id}
              </div>
              <div>
                <strong>Created by:</strong> {chocolate.createdByName || chocolate.createdBy || 'System'}
              </div>
              <div>
                <strong>Average Rating:</strong> {chocolate.averageRating?.toFixed(1) || 'N/A'} ⭐
              </div>
              <div>
                <strong>Review Count:</strong> {chocolate.reviewCount || 0}
              </div>
              <div>
                <strong>User Contributed:</strong> {chocolate.isUserContributed ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Danger Zone - Delete Section */}
          <div className="form-section danger-zone" style={{
            border: '2px solid #dc3545',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '30px',
            background: '#fff5f5'
          }}>
            <h2 style={{ color: '#dc3545' }}>⚠️ Danger Zone</h2>
            
            {chocolate.reviewCount > 0 && (
              <div style={{
                background: '#ffc107',
                color: '#000',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <strong>Warning:</strong> This chocolate has {chocolate.reviewCount} review(s). 
                Deleting will remove all associated reviews!
              </div>
            )}
            
            <p>Permanently delete this chocolate from the database. This action cannot be undone.</p>
            
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                disabled={saving}
              >
                🗑️ Delete Chocolate
              </button>
            ) : (
              <div className="delete-confirmation">
                <p><strong>Type the chocolate name to confirm deletion:</strong></p>
                <p style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '5px' }}>
                  {chocolate.name}
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type chocolate name here"
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    border: '2px solid #dc3545',
                    borderRadius: '4px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== chocolate.name || saving}
                    style={{
                      padding: '8px 16px',
                      background: deleteConfirmText === chocolate.name ? '#dc3545' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleteConfirmText === chocolate.name ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold'
                    }}
                  >
                    {saving ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/chocolate/${id}`)}
              className="cancel-button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={saving || showDeleteConfirm}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminEditPage;