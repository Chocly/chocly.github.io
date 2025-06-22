// src/components/auth/UnifiedAuthPage.jsx - FIXED REDIRECT VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  resetPassword 
} from '../../services/authService';

function UnifiedAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 UnifiedAuthPage Debug Info:');
    console.log('Current URL:', window.location.href);
    console.log('Location pathname:', location.pathname);
    console.log('Current user:', currentUser?.uid || 'None');
    console.log('Auth loading:', authLoading);
  }, [location, currentUser, authLoading]);

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
      } else if (provider === 'Facebook') {
        user = await signInWithFacebook();
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
    setConfirmPassword('');
    if (!isSignUp) setDisplayName('');
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFC 0%, #F8F9FA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ textAlign: 'center', color: '#2D1810' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F4A261',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDFCFC 0%, #F8F9FA 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Debug info - remove this in production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>URL: {window.location.pathname}</div>
        <div>User: {currentUser?.uid || 'None'}</div>
        <div>Loading: {authLoading.toString()}</div>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '300px',
            width: '90%'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#10B981"/>
                <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#2D1810', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              {isSignUp ? 'Welcome to Chocly! 🎉' : 'Welcome back! 🍫'}
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Taking you to your profile...
            </p>
            {/* Add a manual continue button as fallback */}
            <button 
              onClick={() => navigate('/profile', { replace: true })}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#F4A261',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Continue to Profile
            </button>
          </div>
        </div>
      )}

      {/* Auth Form */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(244, 162, 97, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #F4A261 0%, #F4D03F 100%)',
          padding: '2rem 1rem 1.5rem',
          textAlign: 'center',
          color: '#2D1810'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍫</div>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700 }}>
              {isSignUp ? 'Join the Community' : 'Welcome Back'}
            </h2>
            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>
              {isSignUp ? 'Start your chocolate journey' : 'Continue exploring chocolate'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1rem' }}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '0.875rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontWeight: 500,
              textAlign: 'center',
              fontSize: '0.9rem',
              border: '1px solid #FECACA'
            }}>
              {error}
            </div>
          )}
          
          {resetMessage && (
            <div style={{
              background: '#D1FAE5',
              color: '#065F46',
              padding: '0.875rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontWeight: 500,
              textAlign: 'center',
              fontSize: '0.9rem',
              border: '1px solid #A7F3D0'
            }}>
              {resetMessage}
            </div>
          )}
          
          {/* Social Auth Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <button 
              onClick={() => handleSocialAuth('Google')}
              disabled={loading}
              style={{
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
            
            <button 
              onClick={() => handleSocialAuth('Facebook')}
              disabled={loading}
              style={{
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
                border: '2px solid transparent',
                minHeight: '48px',
                background: '#1877F2',
                color: 'white',
                boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
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
                  transition: 'border-color 0.3s ease'
                }}
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '1rem',
                marginBottom: '0.75rem',
                transition: 'border-color 0.3s ease'
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
                transition: 'border-color 0.3s ease'
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
                  transition: 'border-color 0.3s ease'
                }}
                required
              />
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #F4A261 0%, #F4D03F 100%)',
                color: '#2D1810',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
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
    </div>
  );
}

export default UnifiedAuthPage;