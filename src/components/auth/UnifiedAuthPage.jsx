import React, { useState } from 'react';
import { registerWithEmailPassword, loginWithEmailPassword, signInWithGoogle, signInWithFacebook, resetPassword } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

// Unified Auth Page Component
function UnifiedAuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    setError('');
    
    if (isSignUp && !displayName.trim()) {
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
    
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Simulate auth process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      setTimeout(() => {
        console.log('Navigate to profile');
      }, 1500);
    } catch (error) {
      setError(isSignUp ? error.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate social auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => {
        console.log(`Navigate to profile after ${provider} auth`);
      }, 1500);
    } catch (error) {
      setError(`Failed to authenticate with ${provider}`);
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
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResetMessage('Password reset email sent. Check your inbox.');
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDFCFC 0%, #F8F9FA 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
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
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '300px',
            width: '90%',
            animation: 'slideUp 0.4s ease'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#10B981"/>
                <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#2D1810', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              {isSignUp ? 'Welcome to Chocly! 🎉' : 'Welcome back! 👋'}
            </h2>
            <p style={{ color: '#374151', margin: '0 0 1rem 0' }}>
              Taking you to your profile...
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
              {[0, 1, 2].map(i => (
                <span 
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#F4A261',
                    animation: `bounce 1.4s infinite ease-in-out both`,
                    animationDelay: `${-0.32 + i * 0.16}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid #E5E7EB'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2D1810 0%, #3A1F04 100%)',
          color: 'white',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.06)"/></svg>\') repeat',
            opacity: 0.5
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.75rem',
              fontWeight: 800,
              fontFamily: 'Playfair Display, serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              🍫 Chocly
            </h1>
            <h2 style={{
              margin: '0 0 0.25rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif'
            }}>
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
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M13.397 20.997v-8.196h2.765l0.411-3.209h-3.176v-2.044c0-0.926 0.258-1.559 1.587-1.559h1.684v-2.861c-0.82-0.088-1.643-0.13-2.467-0.131-2.446 0-4.13 1.495-4.13 4.231v2.355h-2.777v3.209h2.777v8.202c2.379 0.253 4.268 0.13 3.326-0.003z"/>
              </svg>
              Facebook
            </button>
          </div>
          
          <div style={{
            textAlign: 'center',
            margin: '1rem 0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: '#E5E7EB'
            }} />
            <span style={{
              background: 'white',
              padding: '0 1rem',
              color: '#9CA3AF',
              fontSize: '0.875rem',
              fontWeight: 500,
              position: 'relative'
            }}>
              or
            </span>
          </div>
          
          {/* Email Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isSignUp && (
              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    background: 'white',
                    color: '#374151',
                    transition: 'all 0.3s ease',
                    minHeight: '48px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
            
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#374151',
                  transition: 'all 0.3s ease',
                  minHeight: '48px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Password (min. 6 characters)" : "Password"}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#374151',
                  transition: 'all 0.3s ease',
                  minHeight: '48px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {isSignUp && (
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    background: 'white',
                    color: '#374151',
                    transition: 'all 0.3s ease',
                    minHeight: '48px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
            
            {!isSignUp && (
              <div style={{ textAlign: 'right', margin: '-0.5rem 0 0.5rem 0' }}>
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F4A261',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    transition: 'color 0.3s ease',
                    fontWeight: 500
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #F4A261 0%, #F4D03F 100%)',
                color: '#2D1810',
                border: 'none',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(244, 162, 97, 0.3)',
                minHeight: '48px',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(45, 24, 16, 0.3)',
                    borderTop: '2px solid #2D1810',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {isSignUp ? 'Creating...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </div>
          
          {/* Mode Switch */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #F3F4F6'
          }}>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={switchMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F4A261',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
            
            {isSignUp && (
              <p style={{
                fontSize: '0.8rem',
                color: '#9CA3AF',
                lineHeight: 1.4,
                margin: '0.5rem 0 0 0'
              }}>
                By creating an account, you agree to our{' '}
                <a href="/terms-of-service" style={{ color: '#6B7280', textDecoration: 'none' }}>
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" style={{ color: '#6B7280', textDecoration: 'none' }}>
                  Privacy Policy
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Benefits Preview */}
        <div style={{
          padding: '1rem',
          background: '#FDFCFC',
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: '📝', text: 'Track tastings' },
            { icon: '⭐', text: 'Rate & review' },
            { icon: '🤝', text: 'Connect with others' }
          ].map((benefit, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                flex: 1,
                minWidth: 0,
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {benefit.icon}
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: '#374151',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {benefit.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        
        button:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        input:focus {
          outline: none;
          border-color: #F4A261 !important;
          box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.1);
          transform: translateY(-1px);
        }
        
        @media (max-width: 480px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default UnifiedAuthPage;