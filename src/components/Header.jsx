// src/components/Header.jsx - Simplified with fixed positioning
import logo from '../assets/logolight.png';
import logoIcon from '../assets/Header Icon Light.png';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  
  const isHomePage = location.pathname === "/";

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setUserMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setMenuOpen(false);
    setUserMenuOpen(false);
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

  const getUserDisplayName = () => {
    if (userProfile?.displayName) return userProfile.displayName;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img 
              src={(isMobile && !isHomePage) ? logoIcon : logo} 
              alt="Chocly" 
              className={(isMobile && !isHomePage) ? "logo-icon" : "logo-full"}
            />
          </Link>
          
          {/* Desktop Nav (Homepage only) */}
          {isHomePage && !isMobile && (
            <nav className="desktop-nav">
              <Link to="/add-chocolate" className="desktop-nav-link">
                Add Chocolate
              </Link>
              <Link to="/browse" className="desktop-nav-link">
                Browse
              </Link>
            </nav>
          )}
          
          {/* Desktop Search (non-homepage) */}
          {!isHomePage && !isMobile && (
            <div className="search-dropdown">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search chocolates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-submit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </form>
            </div>
          )}
          
          {/* Header Actions */}
          <div className="header-actions">
            {/* Mobile Search Button */}
            {!isHomePage && isMobile && (
              <button 
                className="header-btn search-btn"
                onClick={toggleSearch}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            )}
            
            {/* Add Button (desktop, logged in, non-homepage) */}
            {currentUser && !isHomePage && !isMobile && (
              <Link to="/add-chocolate" className="add-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <span>Add Chocolate</span>
              </Link>
            )}
            
            {/* User/Auth */}
            {currentUser ? (
              <button 
                className="header-btn user-btn"
                onClick={toggleUserMenu}
                type="button"
              >
                <div className="user-avatar">
                  <span className="user-initials">{getUserInitials()}</span>
                </div>
                {!isMobile && (
                  <>
                    <span className="user-name">{getUserDisplayName()}</span>
                    <svg className={`chevron ${userMenuOpen ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <Link 
                to="/auth" 
                className={isHomePage ? "join-btn" : "signin-btn"}
              >
                {isHomePage ? "Join Us" : "Sign In"}
              </Link>
            )}
            
            {/* Hamburger */}
            <button 
              className="header-btn menu-btn"
              onClick={toggleMenu}
              type="button"
            >
              <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
                <span/>
                <span/>
                <span/>
              </span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Search Dropdown */}
      {searchOpen && isMobile && (
        <div className="search-dropdown">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search chocolates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>
      )}
      
      {/* Overlays */}
      {userMenuOpen && <div className="dropdown-overlay" onClick={() => setUserMenuOpen(false)} />}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
      
      {/* User Dropdown */}
      {userMenuOpen && (
        <div className="user-dropdown">
          <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </Link>
          <Link to="/add-chocolate" onClick={() => setUserMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add Chocolate
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
      
      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="mobile-nav">
          <div className="nav-section">
            <h3>Browse</h3>
            <Link to="/" onClick={toggleMenu}>Home</Link>
            <Link to="/browse" onClick={toggleMenu}>All Chocolates</Link>
            <Link to="/barcode" onClick={toggleMenu}>
              Barcode Search 
              <span className="badge-wip">WIP</span>
            </Link>
          </div>
          <div className="nav-section">
            <h3>Community</h3>
            {currentUser && (
              <Link to="/add-chocolate" onClick={toggleMenu}>Add Chocolate</Link>
            )}
            <Link to="/scanner" onClick={toggleMenu}>🍫 Scan</Link>
            <Link to="/about" onClick={toggleMenu}>About Us</Link>
            <Link to="/contact" onClick={toggleMenu}>Contact</Link>
          </div>
          {!currentUser && (
            <div className="nav-section">
              <h3>Account</h3>
              <Link to="/login" onClick={toggleMenu}>Log In</Link>
              <Link to="/signup" onClick={toggleMenu}>Sign Up</Link>
            </div>
          )}
        </nav>
      )}
    </>
  );
}

export default Header;