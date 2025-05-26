// src/components/Header.jsx - Updated with user indicator
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  
  // Check if we're on the homepage
  const isHomePage = location.pathname === "/";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user display name or fallback
  const getUserDisplayName = () => {
    if (userProfile?.displayName) return userProfile.displayName;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  // Get user avatar or initials
  const getUserAvatar = () => {
    if (userProfile?.photoURL || currentUser?.photoURL) {
      return userProfile?.photoURL || currentUser?.photoURL;
    }
    return null;
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Chocly</h1>
        </Link>
        
        {/* Only show search form when NOT on homepage */}
        {!isHomePage && (
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search chocolates, makers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
        
        <div className="header-actions">
          {/* User Menu for Logged In Users */}
          {currentUser ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button className="user-menu-toggle" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {getUserAvatar() ? (
                    <img src={getUserAvatar()} alt={getUserDisplayName()} />
                  ) : (
                    <span className="user-initials">{getUserInitials()}</span>
                  )}
                </div>
                <span className="user-name">{getUserDisplayName()}</span>
                <svg className={`chevron ${userMenuOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                </svg>
              </button>
              
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="user-dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  My Profile
                </Link>
                <button onClick={handleLogout} className="user-dropdown-item logout">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Auth buttons for logged out users */
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">Log In</Link>
              <Link to="/signup" className="auth-btn signup-btn">Sign Up</Link>
            </div>
          )}
          
          {/* Main Navigation Menu */}
          <div className="nav-container" ref={menuRef}>
            <button className="menu-toggle" onClick={toggleMenu}>
              Menu
              <span className={`menu-icon ${menuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            
            <nav className={`nav ${menuOpen ? 'open' : ''}`}>
              <div className="nav-section">
                <h3>Browse</h3>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/browse" onClick={() => setMenuOpen(false)}>All Chocolates</Link>
                <Link to="/barcode" onClick={() => setMenuOpen(false)}>Barcode Search</Link>
                <Link to="/category/dark" onClick={() => setMenuOpen(false)}>Dark Chocolate</Link>
                <Link to="/category/milk" onClick={() => setMenuOpen(false)}>Milk Chocolate</Link>
                <Link to="/category/white" onClick={() => setMenuOpen(false)}>White Chocolate</Link>
              </div>
              <div className="nav-section">
                <h3>About</h3>
                <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
              </div>
              {!currentUser && (
                <div className="nav-section">
                  <h3>Account</h3>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;