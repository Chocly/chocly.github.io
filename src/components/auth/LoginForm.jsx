// src/components/auth/LoginForm.jsx - Enhanced version
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailPassword, signInWithGoogle, signInWithFacebook, resetPassword } from '../../services/authService';
import './EnhancedAuthForms.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await loginWithEmailPassword(email, password);
      
      // Show brief success, then redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await signInWithGoogle();
      console.log("Google login successful:", user?.uid);
      
      // Show brief success, then redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.message || "Failed to log in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      await signInWithFacebook();
      
      // Show brief success, then redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      await resetPassword(email);
      setResetMessage('Password reset email sent. Check your inbox.');
      setError('');
    } catch (error) {
      setError('Error sending reset email. Please try again.');
    }
  };

  return (
    <div className="enhanced-auth-page login-page">
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
            <h2>Welcome back! 👋</h2>
            <p>You're successfully signed in. Let's continue your chocolate journey!</p>
            <div className="success-redirect">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Taking you to your profile...</p>
            </div>
          </div>
        </div>
      )}

      <div className="auth-container">
        <div className="auth-form-section">
          <div className="form-header">
            <div className="welcome-back-badge">
              <span className="badge-emoji">👋</span>
              <span className="badge-text">Welcome Back</span>
            </div>
            <h1>Sign in to Chocly</h1>
            <p>Continue your chocolate journey</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {resetMessage && <div className="success-message">{resetMessage}</div>}
          
          {/* Social Login Buttons */}
          <div className="social-auth-buttons">
            <button 
              type="button" 
              className="social-btn google-btn" 
              onClick={handleGoogleLogin}
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
              onClick={handleFacebookLogin}
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
          
          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="auth-form">
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
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="forgot-password">
              <button type="button" onClick={handleResetPassword} className="forgot-link">
                Forgot your password?
              </button>
            </div>
            
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="form-footer">
            <p>
              New to Chocly? 
              <Link to="/signup" className="signup-link"> Create an account</Link>
            </p>
          </div>
        </div>
        
        {/* Side Panel with Benefits */}
        <div className="auth-side-panel">
          <div className="side-panel-content">
            <h2>Continue Your Chocolate Adventure</h2>
            <p>Track your tastings, discover new favorites, and connect with fellow chocolate enthusiasts.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  <h4>Personal Stats</h4>
                  <p>Track all the chocolates you've tasted</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <div className="feature-text">
                  <h4>Share Reviews</h4>
                  <p>Help others discover great chocolate</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-text">
                  <h4>Get Recommendations</h4>
                  <p>Find new chocolates based on your taste</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;