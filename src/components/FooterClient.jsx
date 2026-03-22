'use client';

import Link from 'next/link';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link href="/" className="logo-link">
              <img src="/assets/alt logo light.png" alt="Chocly" className="footer-logo-img" />
            </Link>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Explore</h3>
              <ul>
                <li><Link href="/browse">All Chocolates</Link></li>
                <li><Link href="/scanner">Identify Chocolate</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>My Chocly</h3>
              <ul>
                <li><Link href="/auth">Sign Up</Link></li>
                <li><Link href="/auth">Log In</Link></li>
                <li><Link href="/profile">My Profile</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Company</h3>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">&copy; {currentYear} Chocly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
