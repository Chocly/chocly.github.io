// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Import the logo from assets folder - update the filename if needed
import logoLight from '../assets/alt logo light.png';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Add the curved SVG wave at the top */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" fill="currentColor"></path>
        </svg>
      </div>
      
      <div className="container">
        <div className="footer-content">
          {/* Logo section with new image */}
          <div className="footer-logo">
            <Link to="/" className="logo-link">
              <img src={logoLight} alt="Chocly" className="footer-logo-img" />
            </Link>
          </div>
          
          {/* Footer links in 3 columns */}
          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Explore</h3>
              <ul>
                <li><Link to="/browse">All Chocolates</Link></li>
                <li><Link to="/barcode">Barcode Search</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>My Chocly</h3>
              <ul>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Log In</Link></li>
                <li><Link to="/profile">My Profile</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Company</h3>
              <ul>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer bottom - hidden on mobile to save space */}
        <div className="footer-bottom">
          <p className="copyright">&copy; {currentYear} Chocly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;