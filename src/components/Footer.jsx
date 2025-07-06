// src/components/Footer.jsx - Updated to remove chocolate type links
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/" className="logo-link">
              <h2>Chocly</h2>
            </Link>
            <p className="tagline">Discover better chocolate.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Explore</h3>
              <ul>
                <li><Link to="/browse">All Chocolates</Link></li>
                <li><Link to="/barcode">Barcode Search <span className="footer-badge">Under Construction</span></Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Account</h3>
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
        
        <div className="footer-bottom">
          <p className="copyright">&copy; {currentYear} Chocly. All rights reserved.</p>
          <div className="social-icons">
            <a href="#" className="social-icon instagram" aria-label="Instagram">
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="social-icon twitter" aria-label="Twitter">
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="social-icon facebook" aria-label="Facebook">
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;