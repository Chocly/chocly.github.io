// src/components/auth/SignUpForm.jsx - MOBILE-FIRST VERSION
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmailPassword, signInWithGoogle, signInWithFacebook } from '../../services/authService';
import './MobileAuthForms.css';

function SignUpForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');
    
    if (!displayName.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const user = await registerWithEmailPassword(email, password, displayName);
      console.log("Email signup successful:", user?.uid);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await signInWithGoogle();
      console.log("Google signup successful:", user?.uid);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error("Google signup error:", error);
      setError(error.message || "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      setLoading(true);
      const user = await signInWithFacebook();
      console.log("Facebook signup successful:", user?.uid);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-auth-page">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-animation">
              <div className="checkmark">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#10B981"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h2>Welcome to Chocly! 🎉</h2>
            <p>Taking you to your profile...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div className="mobile-auth-container">
        {/* Compact Header */}
        <div className="mobile-auth-header">
          <div className="brand-logo">
            <h1>🍫 Chocly</h1>
          </div>
          <div className="auth-title">
            <h2>Create Account</h2>
            <p>Join the chocolate community</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="mobile-auth-form">
          {error && <div className="error-message">{error}</div>}
          
          {/* Quick Social Options */}
          <div className="social-options">
            <button 
              type="button" 
              className="social-btn google-btn" 
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.201-7.835 9.412-11.566l-9.412-0.1z"/>
              </svg>
              Google
            </button>
            
            <button 
              type="button" 
              className="social-btn facebook-btn" 
              onClick={handleFacebookSignUp}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M13.397 20.997v-8.196h2.765l0.411-3.209h-3.176v-2.044c0-0.926 0.258-1.559 1.587-1.559h1.684v-2.861c-0.82-0.088-1.643-0.13-2.467-0.131-2.446 0-4.13 1.495-4.13 4.231v2.355h-2.777v3.209h2.777v8.202c2.379 0.253 4.268 0.13 3.326-0.003z"/>
              </svg>
              Facebook
            </button>
          </div>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          {/* Email Form - Streamlined */}
          <form onSubmit={handleEmailSignUp} className="email-form">
            <div className="input-group">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 6 characters)"
                required
                minLength="6"
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
            
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Bottom Links */}
          <div className="auth-footer">
            <p>
              Already have an account? 
              <Link to="/login" className="auth-link"> Sign in</Link>
            </p>
            <p className="terms-text">
              By creating an account, you agree to our 
              <Link to="/terms-of-service"> Terms</Link> and 
              <Link to="/privacy-policy"> Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Minimal Benefits - Only on larger screens */}
        <div className="benefits-preview">
          <div className="benefit-item">
            <span className="benefit-icon">📝</span>
            <span>Track tastings</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⭐</span>
            <span>Rate & review</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🤝</span>
            <span>Connect with others</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;