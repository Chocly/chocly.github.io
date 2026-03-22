// src/pages/AboutPage.jsx
import React from 'react';
import './AboutPage.css';
// Import your image
import founderImage from '../assets/About Us Image.jpg';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-header">
          <h1>About Chocly</h1>
          <p className="tagline">For the love of all things chocolate</p>
        </div>
        
        <section className="about-story">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              Chocly was born from a personal journey of discovery and delight. Inspired by the cravings 
              and curiosities of a chocolate-loving wife during pregnancy, our founder embarked on a quest 
              to catalogue favorite bars, explore new and exciting flavors, and research the next must-try 
              indulgence. What began as a loving endeavor has blossomed into Chocly, a platform for all 
              chocolate enthusiasts to share their experiences, learn from others, and navigate the 
              delicious world of premium chocolate together.
            </p>
          </div>
          <div className="story-image">
            {/* Replace the placeholder with your actual image */}
            <img 
              src={founderImage} 
              alt="Chocly founder and the inspiration behind our chocolate journey" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          </div>
        </section>

        <section className="mission-section">
          <div className="mission-overlay"></div>
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p className="mission-statement">To help everyone discover and enjoy better chocolate.</p>
            <p className="mission-description">
              We believe that chocolate is more than just a treat—it's an experience, an art form, and a 
              connection to cultures and traditions around the world. Our aim is to make premium chocolate 
              accessible to everyone, creating a community where chocolate lovers can share their 
              discoveries and expand their palates.
            </p>
          </div>
        </section>

        <section className="values-section">
          <h2>What Drives Us</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon quality"></div>
              <h3>Quality</h3>
              <p>We champion chocolate crafted with care, highlighting makers who prioritize quality ingredients and ethical practices.</p>
            </div>
            <div className="value-card">
              <div className="value-icon community"></div>
              <h3>Community</h3>
              <p>We believe in the power of shared experiences and diverse perspectives to enrich our chocolate journeys.</p>
            </div>
            <div className="value-card">
              <div className="value-icon discovery"></div>
              <h3>Discovery</h3>
              <p>We're committed to helping people break out of their chocolate comfort zones and discover new favorites.</p>
            </div>
          </div>
        </section>

        <section className="join-section">
          <h2>Join Our Chocolate Revolution</h2>
          <p>
            Whether you're a casual chocolate enjoyer or a dedicated connoisseur, Chocly is the place for you. 
            Sign up today to start tracking your chocolate journey, sharing your discoveries, and connecting with fellow enthusiasts.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button primary">Join Chocly</a>
            <a href="/browse" className="cta-button secondary">Explore Chocolates</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;