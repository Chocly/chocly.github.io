'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, userProfile } = useAuth();

  const isHomePage = pathname === '/';

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
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
      router.push('/');
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

  const isActive = (path) => {
    if (path === '/browse') return pathname === '/browse' || pathname.startsWith('/browse');
    if (path === '/community') return pathname === '/community';
    return false;
  };

  // Use require for images in Next.js or use public folder
  // For now, use text-based logo as fallback
  const logoSrc = '/assets/logolight.png';
  const logoIconSrc = '/assets/Header Icon Light.png';

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link href="/" className="header-logo">
            <img
              src={(isMobile && !isHomePage) ? logoIconSrc : logoSrc}
              alt="Chocly"
              className={(isMobile && !isHomePage) ? "logo-icon" : "logo-full"}
            />
          </Link>

          {!isMobile && (
            <nav className="desktop-nav" aria-label="Main navigation">
              <Link href="/browse" className={`desktop-nav-link ${isActive('/browse') ? 'active' : ''}`}>
                Browse
              </Link>
              <Link href="/community" className={`desktop-nav-link ${isActive('/community') ? 'active' : ''}`}>
                Community
              </Link>
            </nav>
          )}

          {!isMobile && (
            <div className="desktop-search">
              <form onSubmit={handleSearch} className="search-form">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search chocolates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label="Search chocolates"
                />
              </form>
            </div>
          )}

          <div className="header-actions">
            {isMobile && (
              <button className="header-btn search-btn" onClick={toggleSearch} type="button" aria-label="Toggle search" aria-expanded={searchOpen}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            )}

            {currentUser && !isMobile && (
              <Link href="/add-chocolate" className="add-cta">+ Add Review</Link>
            )}

            {currentUser ? (
              <button className="header-btn user-btn" onClick={toggleUserMenu} type="button" aria-expanded={userMenuOpen} aria-label="User menu">
                <div className="user-avatar">
                  <span className="user-initials">{getUserInitials()}</span>
                </div>
                {!isMobile && (
                  <svg className={`chevron ${userMenuOpen ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            ) : (
              <div className="auth-buttons">
                <Link href="/auth" className="signin-btn">Log In</Link>
                <Link href="/auth" className="signup-btn">Sign Up Free</Link>
              </div>
            )}

            {isMobile && (
              <button className="header-btn menu-btn" onClick={toggleMenu} type="button" aria-expanded={menuOpen} aria-label="Toggle navigation menu">
                <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
                  <span/><span/><span/>
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {searchOpen && isMobile && (
        <div className="search-dropdown-mobile">
          <form onSubmit={handleSearch} className="search-form-mobile">
            <input type="text" placeholder="Search chocolates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-mobile" autoFocus />
            <button type="submit" className="search-submit-mobile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {userMenuOpen && <div className="dropdown-overlay" onClick={() => setUserMenuOpen(false)} />}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

      {userMenuOpen && (
        <div className="user-dropdown">
          <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </Link>
          <Link href="/add-chocolate" onClick={() => setUserMenuOpen(false)}>
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

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="nav-section">
            <h3>Browse</h3>
            <Link href="/" onClick={toggleMenu}>Home</Link>
            <Link href="/browse" onClick={toggleMenu}>All Chocolates</Link>
            <Link href="/scanner" onClick={toggleMenu}>Identify Chocolate</Link>
          </div>
          <div className="nav-section">
            <h3>Community</h3>
            <Link href="/community" onClick={toggleMenu}>Photo Feed</Link>
            {currentUser && (
              <Link href="/add-chocolate" onClick={toggleMenu}>Add Chocolate</Link>
            )}
            <Link href="/about" onClick={toggleMenu}>About Us</Link>
            <Link href="/contact" onClick={toggleMenu}>Contact</Link>
          </div>
          {!currentUser && (
            <div className="nav-section">
              <h3>Account</h3>
              <Link href="/auth" onClick={toggleMenu}>Log In</Link>
              <Link href="/auth" onClick={toggleMenu}>Sign Up</Link>
            </div>
          )}
        </nav>
      )}
    </>
  );
}

export default Header;
