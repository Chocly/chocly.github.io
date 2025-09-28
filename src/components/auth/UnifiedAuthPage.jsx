// src/components/auth/UnifiedAuthPage.jsx - FIXED: No debug box, no Facebook auth
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  signInWithGoogle, 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  resetPassword 
} from '../../services/authService';

function UnifiedAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  
  // REMOVED: Debug logging that was creating the black box

  // FIXED: More reliable redirect logic
  useEffect(() => {
    if (!authLoading && currentUser) {
      console.log('✅ User already logged in, redirecting to profile');
      // Use replace to avoid back button issues
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [currentUser, authLoading, navigate]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSocialAuth = async (provider) => {
    console.log(`🔑 Starting ${provider} authentication`);
    setLoading(true);
    setError('');

    try {
      let user;
      if (provider === 'Google') {
        user = await signInWithGoogle();
      }
      // REMOVED: Facebook authentication

      // Handle mobile redirect case (user will be null)
      if (user === null) {
        console.log('🔄 Redirecting for mobile authentication...');
        // Don't set loading to false or show error - redirect is in progress
        return;
      }

      console.log(`✅ ${provider} auth successful:`, user.uid);
      setShowSuccess(true);

      // FIXED: Better redirect with error handling
      setTimeout(() => {
        console.log('🚀 Redirecting to profile after successful auth');
        try {
          navigate('/profile', { replace: true });
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback: direct window navigation
          window.location.href = '/profile';
        }
      }, 1500);

    } catch (error) {
      console.error(`❌ ${provider} auth error:`, error);
      setError(error.message || `Failed to sign in with ${provider}`);
      setShowSuccess(false); // Make sure success screen is hidden on error
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    console.log(`🔑 Starting ${isSignUp ? 'signup' : 'login'} with email`);
    
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let user;
      if (isSignUp) {
        user = await registerWithEmailPassword(email, password, displayName);
      } else {
        user = await loginWithEmailPassword(email, password);
      }
      
      console.log(`✅ Email auth successful:`, user.uid);
      setShowSuccess(true);
      
      setTimeout(() => {
        console.log('🚀 Redirecting to profile after successful auth');
        try {
          navigate('/profile', { replace: true });
        } catch (navError) {
          console.error('Navigation error:', navError);
          window.location.href = '/profile';
        }
      }, 1500);
      
    } catch (error) {
      console.error(`❌ Email auth error:`, error);
      setError(error.message);
      setShowSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      await resetPassword(email);
      setResetMessage('Password reset email sent! Check your inbox.');
      setError('');
    } catch (error) {
      setError('Error sending reset email. Please try again.');
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setResetMessage('');
  };

  // Success screen
  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FDFCFC 0%, #F8F9FA 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>
            🍫
          </div>
          <h2 style={{ color: '#2D1810', marginBottom: '1rem' }}>Welcome to Chocly!</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Successfully signed in. Redirecting to your profile...
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F4A261',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FDFCFC 0%, #F8F9FA 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍫</div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#2D1810',
            marginBottom: '0.5rem'
          }}>
            {isSignUp ? 'Join Chocly' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            {isSignUp ? 'Create your chocolate journey' : 'Sign in to continue your chocolate journey'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '0.875rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {resetMessage && (
          <div style={{
            background: '#D1FAE5',
            border: '1px solid #86EFAC',
            color: '#059669',
            padding: '0.875rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {resetMessage}
          </div>
        )}

        {/* Social Login - REMOVED FACEBOOK */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => handleSocialAuth('Google')}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 0.75rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid #E5E7EB',
              minHeight: '48px',
              background: 'white',
              color: '#374151',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              opacity: loading ? 0.7 : 1
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.201-7.835 9.412-11.566l-9.412-0.1z"/>
            </svg>
            Google
          </button>
          
          {/* REMOVED: Facebook button */}
        </div>
        
        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          fontSize: '0.875rem',
          color: '#9CA3AF'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          <span style={{ padding: '0 1rem' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '1rem',
              marginBottom: '0.75rem',
              transition: 'border-color 0.3s',
              outline: 'none'
            }}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '1rem',
              marginBottom: '0.75rem',
              transition: 'border-color 0.3s',
              outline: 'none'
            }}
            required
          />
          
          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              required
            />
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F4A261 0%, #F4D03F 100%)',
              color: '#2D1810',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        {/* Footer Actions */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          {!isSignUp && (
            <button
              onClick={handlePasswordReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#F4A261',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}
            >
              Forgot your password?
            </button>
          )}
          
          <div>
            <span style={{ color: '#666' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            {' '}
            <button
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#F4A261',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedAuthPage;