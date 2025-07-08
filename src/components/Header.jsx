// src/components/Header.jsx - FIXED: No Menu text, proper expandable search
import logo from '../assets/logo.png';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
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
      setSearchOpen(false); // Close search after submitting
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Close search if menu opens
    if (!menuOpen) setSearchOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    // Close search if user menu opens
    if (!userMenuOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    // Close other menus if search opens
    if (!searchOpen) {
      setMenuOpen(false);
      setUserMenuOpen(false);
      // Focus the input after a brief delay for animation
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 150);
    }
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close search on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

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
        <img src={logo} alt="Chocly" className="logo-image" />
        </Link>
        
        {/* Search Section - Only show on non-home pages */}
        {!isHomePage && (
          <div className="search-section" ref={searchRef}>
            {/* Search Toggle Button */}
            <button 
              className={`search-toggle ${searchOpen ? 'active' : ''}`}
              onClick={toggleSearch}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
            >
              <svg 
                className="search-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </button>
            
            {/* Expandable Search Form */}
            <form 
              className={`search-form-expandable ${searchOpen ? 'open' : ''}`} 
              onSubmit={handleSearch}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chocolates, makers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-expandable"
              />
              <button type="submit" className="search-submit-btn">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </button>
            </form>
          </div>
        )}
        
        <div className="header-actions">
          {/* Add Chocolate Button - Only show if user is logged in */}
          {currentUser && (
            <Link to="/add-chocolate" className="add-chocolate-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span className="add-chocolate-text">Add Chocolate</span>
            </Link>
          )}
          
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
                <Link to="/add-chocolate" onClick={() => setUserMenuOpen(false)} className="user-dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Add Chocolate
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
          <Link to="/auth" className="auth-btn primary-btn">Sign In</Link>
          )}          

          {/* Main Navigation Menu - HAMBURGER ICON ONLY */}
          <div className="nav-container" ref={menuRef}>
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
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
    <Link to="/barcode" onClick={() => setMenuOpen(false)}>
      Barcode Search 
      <span className="under-construction">Under Construction</span>
    </Link>
  </div>
  <div className="nav-section">
    <h3>Community</h3>
    {currentUser && (
      <Link to="/add-chocolate" onClick={() => setMenuOpen(false)}>Add Chocolate</Link>
    )}
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