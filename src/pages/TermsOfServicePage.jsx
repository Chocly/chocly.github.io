// src/pages/TermsOfServicePage.jsx
import React from 'react';
import './LegalPages.css';

function TermsOfServicePage() {
  // Get the current date for the "Last Updated" field
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  return (
    <div className="legal-page terms-of-service">
      <div className="container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: {formattedDate}</p>
        </div>
        
        <div className="legal-content">
          <section className="legal-section">
            <p className="intro-text">
              Welcome to Chocly! These Terms of Service ("Terms") govern your access to and use of the Chocly
              website and services. Please read these Terms carefully before using our services. By accessing
              or using our services, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Chocly, you agree to be bound by these Terms. If you do not agree to all
              the terms and conditions of this agreement, you may not access or use our services.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>2. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant
              changes by posting the updated Terms on this page with a new "Last Updated" date. Your continued
              use of Chocly after any changes to the Terms constitutes your acceptance of such changes.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>3. Account Registration and Security</h2>
            <p>
              To access certain features of Chocly, you may be required to register for an account. When registering,
              you agree to provide accurate, current, and complete information. You are responsible for maintaining
              the confidentiality of your account credentials and for all activities that occur under your account.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              We reserve the right to suspend or terminate your account at our discretion if we believe that you
              have violated these Terms or if your account shows signs of fraud, abuse, or suspicious activity.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>4. User Content</h2>
            <h3>4.1 Content Ownership</h3>
            <p>
              You retain all ownership rights to the content you post, upload, or share on Chocly ("User Content").
              By submitting User Content, you grant Chocly a worldwide, non-exclusive, royalty-free, sublicensable,
              and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform
              the User Content in connection with the operation and promotion of Chocly.
            </p>
            
            <h3>4.2 Content Restrictions</h3>
            <p>
              You agree not to post, upload, or share any User Content that:
            </p>
            <ul>
              <li>Violates any law or regulation</li>
              <li>Infringes upon the rights of any third party, including intellectual property rights</li>
              <li>Is false, misleading, defamatory, or deceptive</li>
              <li>Contains sexually explicit or pornographic material</li>
              <li>Promotes discrimination, bigotry, racism, or hatred against any individual or group</li>
              <li>Is threatening, abusive, or harassing toward any individual or group</li>
              <li>Promotes illegal or harmful activities</li>
              <li>Contains viruses, malware, or other harmful code</li>
            </ul>
            
            <h3>4.3 Content Moderation</h3>
            <p>
              We reserve the right, but have no obligation, to monitor, edit, or remove any User Content
              that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.
              We are not responsible for the accuracy, completeness, appropriateness, or legality of User Content.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>5. Intellectual Property Rights</h2>
            <p>
              The Chocly name, logo, and all related names, logos, product and service names, designs, and
              slogans are trademarks of Chocly or its affiliates or licensors. You may not use such marks
              without our prior written permission.
            </p>
            <p>
              All content, features, and functionality of Chocly that is not User Content, including but not
              limited to text, graphics, images, logos, button icons, software, and the compilation thereof,
              is the exclusive property of Chocly, its licensors, or its content suppliers and is protected by
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>6. Prohibited Activities</h2>
            <p>
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul>
              <li>Using Chocly for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation with a person or entity</li>
              <li>Interfering with or disrupting the operation of Chocly or the servers or networks connected to Chocly</li>
              <li>Attempting to gain unauthorized access to Chocly, user accounts, or computer systems or networks connected to Chocly</li>
              <li>Collecting or storing personal data about other users without their permission</li>
              <li>Using automated means, including spiders, robots, crawlers, or data mining tools, to download data from Chocly</li>
              <li>Introducing any viruses, Trojan horses, worms, or other material that is malicious or technologically harmful</li>
            </ul>
          </section>
          
          <section className="legal-section">
            <h2>7. Third-Party Links and Content</h2>
            <p>
              Chocly may contain links to third-party websites or services that are not owned or controlled
              by Chocly. We have no control over, and assume no responsibility for, the content, privacy policies,
              or practices of any third-party websites or services. You further acknowledge and agree that Chocly
              shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged
              to be caused by or in connection with the use of or reliance on any such content, goods, or services
              available on or through any such websites or services.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              Chocly is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either
              express or implied, including, but not limited to, implied warranties of merchantability, fitness
              for a particular purpose, non-infringement, or course of performance.
            </p>
            <p>
              We do not warrant that (a) Chocly will function uninterrupted, secure, or available at any particular
              time or location; (b) any errors or defects will be corrected; (c) Chocly is free of viruses or other
              harmful components; or (d) the results of using Chocly will meet your requirements.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Chocly, its directors, employees,
              partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential,
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from (a) your access to or use of or inability to access or use Chocly;
              (b) any conduct or content of any third party on Chocly; (c) any content obtained from Chocly; and
              (d) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty,
              contract, tort (including negligence), or any other legal theory, whether or not we have been informed
              of the possibility of such damage.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>10. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Chocly, its directors, employees, partners,
              agents, suppliers, and affiliates from and against any claims, liabilities, damages, judgments,
              awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of
              or relating to your violation of these Terms or your use of Chocly, including, but not limited to,
              your User Content, any use of Chocly's content, services, and products other than as expressly
              authorized in these Terms, or your use of any information obtained from Chocly.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to Chocly immediately, without prior notice
              or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using Chocly or contact us to
              request account deletion. All provisions of the Terms which by their nature should survive termination
              shall survive termination, including, without limitation, ownership provisions, warranty disclaimers,
              indemnity, and limitations of liability.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the State of California,
              United States, without regard to its conflict of law provisions. Our failure to enforce any right
              or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>13. Dispute Resolution</h2>
            <p>
              Any disputes arising out of or relating to these Terms or your use of Chocly shall be resolved
              through binding arbitration in accordance with the rules of the American Arbitration Association,
              except that each party retains the right to seek injunctive or other equitable relief in a court
              of competent jurisdiction to prevent the actual or threatened infringement or misappropriation of
              intellectual property rights.
            </p>
          </section>
          
          <section className="legal-section">
            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="contact-info">
              Email: terms@chocly.com<br />
              Address: 123 Chocolate Lane, Sweet City, CA 94000
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;