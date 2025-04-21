// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailPassword, signInWithGoogle, signInWithFacebook, resetPassword } from '../../services/authService';
import './AuthForms.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await loginWithEmailPassword(email, password);
      navigate('/profile');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
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

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
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
    <div className="auth-form-container">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Log in to continue your chocolate journey</p>
      
      {error && <div className="auth-error">{error}</div>}
      {resetMessage && <div className="auth-success">{resetMessage}</div>}
      
      <form onSubmit={handleEmailLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
          />
        </div>
        
        <div className="forgot-password">
          <button type="button" onClick={handleResetPassword} className="reset-button">
            Forgot password?
          </button>
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div className="auth-divider">
        <span>or</span>
      </div>
      
      <div className="social-buttons">
        <button 
          type="button" 
          className="social-button google" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.201-7.835 9.412-11.566l-9.412-0.1z"/>
          </svg>
          Continue with Google
        </button>
        
        <button 
          type="button" 
          className="social-button facebook" 
          onClick={handleFacebookLogin}
          disabled={loading}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M13.397 20.997v-8.196h2.765l0.411-3.209h-3.176v-2.044c0-0.926 0.258-1.559 1.587-1.559h1.684v-2.861c-0.82-0.088-1.643-0.13-2.467-0.131-2.446 0-4.13 1.495-4.13 4.231v2.355h-2.777v3.209h2.777v8.202c2.379 0.253 4.268 0.13 3.326-0.003z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>
      
      <p className="auth-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginForm;