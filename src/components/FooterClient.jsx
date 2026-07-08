'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

function Footer() {
  const { currentUser } = useAuth();
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
                <li><Link href="/maker">Makers A–Z</Link></li>
                <li><Link href="/scanner">Identify Chocolate</Link></li>
                <li><Link href="/community">Community</Link></li>
                <li><Link href="/guides">Chocolate Guides</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Categories</h3>
              <ul>
                <li><Link href="/category/type/dark">Dark Chocolate</Link></li>
                <li><Link href="/category/type/milk">Milk Chocolate</Link></li>
                <li><Link href="/category/origin/madagascar">Madagascar</Link></li>
                <li><Link href="/category/origin/ecuador">Ecuador</Link></li>
                <li><Link href="/category/percentage/70">70% Cacao</Link></li>
                <li><Link href="/category">All Categories</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>My Chocly</h3>
              <ul>
                {currentUser ? (
                  <>
                    <li><Link href="/profile">My Profile</Link></li>
                    <li><Link href="/add-chocolate">Add a Chocolate</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/auth">Sign Up</Link></li>
                    <li><Link href="/auth">Log In</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Company</h3>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
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
