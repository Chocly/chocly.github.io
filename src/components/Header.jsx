// Update src/components/Header.jsx to add a barcode search link
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>ChocolateReview</h1>
        </Link>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search chocolates, makers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        
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
              <h3>Account</h3>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <Link to="/favorites" onClick={() => setMenuOpen(false)}>My Favorites</Link>
            </div>
            <div className="nav-section">
              <h3>About</h3>
              <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;