import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFeaturedChocolates } from '../services/chocolateFirebaseService';
import ChocolateCard from '../components/ChocolateCard';
import './HomePage-new.css';

const PersonalizedHome = lazy(() => import('./PersonalizedHome'));

const HomePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [featuredChocolates, setFeaturedChocolates] = useState([]);

  useEffect(() => {
    fetchFeaturedChocolates();
  }, []);

  const fetchFeaturedChocolates = async () => {
    try {
      const chocolates = await getFeaturedChocolates(6);
      setFeaturedChocolates(chocolates || []);
    } catch (error) {
      console.error('Error fetching chocolates:', error);
      setFeaturedChocolates([]);
    }
  };

  // Logged-in users see the personalized dashboard
  if (!authLoading && currentUser) {
    return (
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#6C6C4E' }}>Loading...</div>}>
        <PersonalizedHome />
      </Suspense>
    );
  }

  return (
    <div className="hp-page">

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <h1 className="hp-hero-title">
            Discover your next favorite chocolate
          </h1>
          <p className="hp-hero-subtitle">
            Rate, review, and explore craft chocolate from around the world.
            Build your palate. Find your favorites.
          </p>
          <div className="hp-hero-actions">
            <Link to="/signup" className="hp-btn-primary">Get Started Free</Link>
            <Link to="/browse" className="hp-btn-ghost">Browse Chocolates</Link>
          </div>
        </div>
        <div className="hp-hero-stats">
          <div className="hp-stat">
            <span className="hp-stat-number">500+</span>
            <span className="hp-stat-label">Chocolates</span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-number">1,200+</span>
            <span className="hp-stat-label">Reviews</span>
          </div>
          <div className="hp-stat-divider" />
          <div className="hp-stat">
            <span className="hp-stat-number">30+</span>
            <span className="hp-stat-label">Countries</span>
          </div>
        </div>
      </section>

      {/* Featured Chocolates */}
      <section className="hp-featured">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Trending Right Now</h2>
          <Link to="/browse" className="hp-section-link">View all &rarr;</Link>
        </div>
        <div className="hp-scroll-row">
          {featuredChocolates.length > 0 ? (
            featuredChocolates.map(choc => (
              <ChocolateCard key={choc.id} chocolate={choc} />
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="hp-skeleton-card" />
            ))
          )}
        </div>
      </section>

      {/* Why Chocly */}
      <section className="hp-features">
        <h2 className="hp-section-title hp-section-title--centered">Why Chocly?</h2>
        <div className="hp-features-grid">
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z"/>
              </svg>
            </div>
            <h3 className="hp-feature-name">Track Your Origins</h3>
            <p className="hp-feature-desc">
              Discover chocolates from 30+ cacao-producing countries and map your tasting journey.
            </p>
          </div>
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 className="hp-feature-name">Rate & Review</h3>
            <p className="hp-feature-desc">
              Build your palate with detailed tasting notes, ratings, and photos.
            </p>
          </div>
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="hp-feature-name">Join the Community</h3>
            <p className="hp-feature-desc">
              Follow chocolate lovers, share discoveries, and see what others are tasting.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="hp-how">
        <h2 className="hp-section-title hp-section-title--centered hp-section-title--light">
          How it works
        </h2>
        <div className="hp-steps">
          <div className="hp-step">
            <span className="hp-step-number">1</span>
            <h3 className="hp-step-name">Browse or Scan</h3>
            <p className="hp-step-desc">
              Search our database or scan a bar's barcode to find it instantly.
            </p>
          </div>
          <div className="hp-step">
            <span className="hp-step-number">2</span>
            <h3 className="hp-step-name">Rate & Review</h3>
            <p className="hp-step-desc">
              Score it, add tasting notes, and upload a photo of your bar.
            </p>
          </div>
          <div className="hp-step">
            <span className="hp-step-number">3</span>
            <h3 className="hp-step-name">Get Recommendations</h3>
            <p className="hp-step-desc">
              Discover new chocolates tailored to your taste profile.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="hp-cta">
        <h2 className="hp-cta-title">Ready to start your chocolate journey?</h2>
        <p className="hp-cta-subtitle">
          Join Chocly and discover craft chocolate from around the world.
        </p>
        <Link to="/signup" className="hp-btn-primary hp-btn-primary--large">
          Get Started Free
        </Link>
        <p className="hp-cta-signin">
          Already have an account? <Link to="/signin" className="hp-cta-signin-link">Sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default HomePage;
