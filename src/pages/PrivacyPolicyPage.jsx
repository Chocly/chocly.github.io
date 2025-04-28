// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import './LegalPages.css';

function PrivacyPolicyPage() {
  // Get the current date for the "Last Updated" field
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  return (
    <div className="legal-page privacy-policy">
      <div className="container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {formattedDate}</p>
        </div>
        
        <div className="legal-content">
          <section className="legal-section">
            <p className="intro-text">
              At Chocly, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website and use our services.
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access the site.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Information We Collect</h2>
            
            <h3>Personal Data</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you register on our
              platform, express interest in obtaining information about us or our products and services, participate
              in activities on the platform, or otherwise contact us. The personal information we collect may include:
            </p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Profile information (profile picture, biography)</li>
              <li>User-generated content (reviews, ratings, comments, uploads)</li>
              <li>Preferences and interests related to chocolate</li>
            </ul>
            
            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our platform, we may automatically collect certain information about your device and
              your interaction with our platform. This information might include:
            </p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent on pages, links clicked)</li>
              <li>Location data (country, city)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>How We Use Your Information</h2>
            <p>We may use the information we collect for various purposes, including to:</p>
            <ul>
              <li>Create and manage your user account</li>
              <li>Provide and maintain our services</li>
              <li>Personalize your experience on our platform</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you administrative information, updates, and marketing communications</li>
              <li>Improve our platform, products, and services</li>
              <li>Protect against fraudulent, unauthorized, or illegal activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>Sharing Your Information</h2>
            <p>We may share your information in the following situations:</p>
            <ul>
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.</li>
              <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
              <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.</li>
              <li><strong>With Other Users:</strong> When you share personal information or interact in public areas of the platform, such information may be viewed by all users and may be publicly distributed.</li>
              <li><strong>For Legal Compliance:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>User-Generated Content</h2>
            <p>
              Our platform allows you to upload, post, and share content, including reviews, ratings, comments, and images.
              Any information you post or share through these activities will be available to other users of the platform and
              the public. You should be aware that any information you provide in these areas may be read, collected, and used
              by others who access them.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Storage and Security</h2>
            <p>
              We use commercially reasonable measures to protect your personal information from unauthorized access,
              use, or disclosure. However, please be aware that no method of electronic transmission or storage is 100% secure,
              and we cannot guarantee absolute security of your data.
            </p>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this
              privacy policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Your Privacy Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul>
              <li>The right to access the personal information we have about you</li>
              <li>The right to request correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the contact information provided below.
              Please note that we may ask you to verify your identity before responding to such requests.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect and use information about you and your
              interaction with our platform. We use these technologies to collect information about your browsing
              activities over time and across different websites. You can instruct your browser to refuse all
              cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may
              not be able to use some portions of our platform.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Children's Privacy</h2>
            <p>
              Our platform is not intended for individuals under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and you are aware
              that your child has provided us with personal information, please contact us.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by posting
              the new privacy policy on this page and updating the "Last Updated" date at the top of this policy.
              You are advised to review this privacy policy periodically for any changes.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>Contact Us</h2>
            <p>
              If you have questions or comments about this privacy policy, please contact us at:
            </p>
            <p className="contact-info">
              Email: privacy@chocly.com<br />
              Address: 123 Chocolate Lane, Sweet City, CA 94000
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;