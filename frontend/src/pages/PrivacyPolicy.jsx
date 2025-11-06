import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/legal.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | FlacronAI';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: January 2025</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to FlacronAI, a product of Flacron Enterprises LLC ("we," "us," or "our").
              We are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              use our AI-powered insurance report generation platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment and billing information</li>
              <li>Professional information (company name, job title)</li>
            </ul>

            <h3>2.2 Report Data</h3>
            <p>When you use our platform to generate insurance reports, we collect:</p>
            <ul>
              <li>Claim information (claim numbers, dates, descriptions)</li>
              <li>Property details and loss information</li>
              <li>Photos and documents you upload</li>
              <li>Generated report content</li>
            </ul>

            <h3>2.3 Usage Information</h3>
            <p>We automatically collect certain information about your use of our services:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages viewed, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To provide, maintain, and improve our AI-powered report generation services</li>
              <li><strong>AI Processing:</strong> To generate insurance reports using Google Gemini AI based on your input data</li>
              <li><strong>Account Management:</strong> To create and manage your account, process payments, and provide customer support</li>
              <li><strong>Communications:</strong> To send you service updates, technical notices, and security alerts</li>
              <li><strong>Analytics:</strong> To understand how users interact with our platform and improve user experience</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Sharing and Disclosure</h2>

            <h3>4.1 Third-Party Service Providers</h3>
            <p>We share your information with trusted third-party service providers:</p>
            <ul>
              <li><strong>Google Gemini AI:</strong> For AI-powered report generation</li>
              <li><strong>Firebase:</strong> For authentication and data storage</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Cloud Storage:</strong> For secure file storage</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to valid legal requests.</p>

            <h3>4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication with Firebase</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
              <li>Compliance with PCI DSS standards for payment data</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100% secure. While we strive to protect
              your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information and report data for as long as necessary to provide our services
              and comply with legal obligations. You may request deletion of your data at any time, subject to
              legal retention requirements.
            </p>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Cookies:</strong> Manage cookie preferences through your browser settings</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:support@flacronenterprises.com">support@flacronenterprises.com</a>
            </p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect
              personal information from children. If we become aware that we have collected information from a
              child, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence.
              We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>10. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver
              personalized content. You can control cookies through your browser settings, but disabling cookies
              may affect functionality.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by
              posting the new policy on this page and updating the "Last Updated" date. Your continued use of our
              services after changes constitute acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Flacron Enterprises LLC</strong></p>
              <p>Email: <a href="mailto:support@flacronenterprises.com">support@flacronenterprises.com</a></p>
              <p>Website: <a href="https://flacronenterprises.com" target="_blank" rel="noopener noreferrer">flacronenterprises.com</a></p>
            </div>
          </section>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="container">
          <p>&copy; 2025 Flacron Enterprises LLC. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
