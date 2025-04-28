// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to your backend
    console.log('Form submitted:', formData);
    
    // Show success message
    setSubmitted(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };
  
  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p className="tagline">We'd love to hear from you!</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-section">
              <h2>Get in Touch</h2>
              <p>
                Have questions about chocolate? Want to suggest a new feature? 
                Or maybe you just want to say hello? We're here for all your chocolate-related inquiries.
              </p>
            </div>
            
            <div className="contact-section">
              <h3>Connect With Us</h3>
              <div className="social-links">
                <a href="#" className="social-link">
                  <span className="social-icon instagram"></span>
                  <span>@chocly</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon twitter"></span>
                  <span>@choclyapp</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon facebook"></span>
                  <span>Chocly</span>
                </a>
              </div>
            </div>
            
            <div className="contact-section">
              <h3>Email Us</h3>
              <p className="email-address">hello@chocly.com</p>
              <p className="email-note">We aim to respond to all inquiries within 48 hours.</p>
            </div>
            
            <div className="contact-image">
              <div className="image-placeholder">
                <span>Chocly Team</span>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                <p>Thank you for your message! We'll be in touch soon.</p>
              </div>
            )}
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-button">Send Message</button>
            </form>
          </div>
        </div>
        
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I create an account?</h3>
              <p>Click the "Sign Up" button in the top right corner of the page and follow the instructions to create your Chocly account.</p>
            </div>
            <div className="faq-item">
              <h3>Can I add a chocolate that's not in the database?</h3>
              <p>Absolutely! You can suggest new chocolates to add to our database. Look for the "Add Chocolate" option in your profile menu.</p>
            </div>
            <div className="faq-item">
              <h3>How do I leave a review?</h3>
              <p>Navigate to any chocolate's detail page and scroll down to the review section. You can rate the chocolate and share your thoughts there.</p>
            </div>
            <div className="faq-item">
              <h3>Is Chocly available as a mobile app?</h3>
              <p>We're currently working on mobile apps for iOS and Android. Stay tuned for updates!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;