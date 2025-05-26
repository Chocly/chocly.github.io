// src/components/auth/SignUpForm.jsx - Enhanced with value proposition
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmailPassword, signInWithGoogle, signInWithFacebook } from '../../services/authService';
import './EnhancedSignUpForm.css';

function SignUpForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      await registerWithEmailPassword(email, password, displayName);
      navigate('/profile');
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
      navigate('/profile');
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
      await signInWithFacebook();
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-signup-page">
      {/* Hero Section */}
      <div className="signup-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-emoji">🍫</span>
            <span className="badge-text">Join 10,000+ Chocolate Lovers</span>
          </div>
          <h1 className="hero-title">
            Your Chocolate Journey
            <span className="highlight"> Starts Here</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing chocolates, track your tastings, and connect with fellow enthusiasts in our growing community
          </p>
          
          {/* Benefits Grid */}
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🔍</div>
              <div className="benefit-text">
                <h3>Discover</h3>
                <p>Find your next favorite chocolate from our curated collection</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📝</div>
              <div className="benefit-text">
                <h3>Track</h3>
                <p>Keep a personal journal of every chocolate you've tasted</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🤝</div>
              <div className="benefit-text">
                <h3>Connect</h3>
                <p>Share recommendations with fellow chocolate enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="signup-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Start your chocolate adventure today - it's free!</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Social Signup Buttons */}
          <div className="social-signup-buttons">
            <button 
              type="button" 
              className="social-btn google-btn" 
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.201-7.835 9.412-11.566l-9.412-0.1z"/>
              </svg>
              Continue with Google
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
              Continue with Facebook
            </button>
          </div>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          {/* Email Form */}
          <form onSubmit={handleEmailSignUp} className="signup-form">
            <div className="form-group">
              <label htmlFor="displayName">Your Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button type="submit" className="signup-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  🚀 Start My Chocolate Journey
                </>
              )}
            </button>
          </form>
          
          <div className="form-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign in here</Link></p>
            <p className="terms-text">
              By creating an account, you agree to our 
              <Link to="/terms-of-service"> Terms of Service</Link> and 
              <Link to="/privacy-policy"> Privacy Policy</Link>
            </p>
          </div>
        </div>
        
        {/* Testimonial */}
        <div className="testimonial-section">
          <div className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              "Chocly has completely changed how I discover new chocolates. The community recommendations are spot on!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🍳</div>
              <div className="author-info">
                <div className="author-name">Sarah Chen</div>
                <div className="author-title">Pastry Chef</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;