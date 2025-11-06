import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/legal.css';

const TermsOfService = () => {
  useEffect(() => {
    document.title = 'Terms of Service | FlacronAI';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: January 2025</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using FlacronAI ("the Platform"), a service provided by Flacron Enterprises LLC ("we," "us," or "our"),
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access
              or use our services.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              FlacronAI is an AI-powered insurance report generation platform that uses Google Gemini AI technology to help
              insurance professionals create comprehensive, accurate reports. Our services include:
            </p>
            <ul>
              <li>AI-powered report generation</li>
              <li>Document export (PDF, DOCX, HTML)</li>
              <li>Cloud-based storage</li>
              <li>Report management and organization</li>
              <li>Custom branding options (paid tiers)</li>
            </ul>
          </section>

          <section>
            <h2>3. Account Registration and Security</h2>

            <h3>3.1 Account Creation</h3>
            <p>
              To use our services, you must create an account with accurate, complete, and current information.
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3>3.2 Account Responsibilities</h3>
            <ul>
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>You may not share your account credentials with others</li>
              <li>One user per account (unless on multi-user plans)</li>
            </ul>

            <h3>3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account for violations of these Terms or for any reason
              we deem appropriate.
            </p>
          </section>

          <section>
            <h2>4. Subscription Plans and Billing</h2>

            <h3>4.1 Subscription Tiers</h3>
            <p>We offer multiple subscription tiers:</p>
            <ul>
              <li><strong>Starter (Free):</strong> 1 report per month with limited features</li>
              <li><strong>Professional ($39.99/month):</strong> 20 reports per month with advanced features</li>
              <li><strong>Agency ($99.99/month):</strong> 100 reports per month with multi-user support</li>
              <li><strong>Enterprise ($499/month):</strong> Unlimited reports with premium features</li>
            </ul>

            <h3>4.2 Billing Terms</h3>
            <ul>
              <li>Subscriptions are billed monthly in advance</li>
              <li>Payments are processed securely through Stripe</li>
              <li>Report limits reset at the beginning of each billing cycle</li>
              <li>Unused reports do not roll over to the next month</li>
              <li>All fees are non-refundable unless required by law</li>
            </ul>

            <h3>4.3 Price Changes</h3>
            <p>
              We reserve the right to modify subscription prices with 30 days' advance notice. Existing subscribers
              will be notified before any price changes take effect.
            </p>

            <h3>4.4 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing
              period. Upon cancellation, your account will be downgraded to the Starter (Free) tier.
            </p>
          </section>

          <section>
            <h2>5. Acceptable Use Policy</h2>

            <h3>5.1 Permitted Use</h3>
            <p>
              Our services are intended for legitimate business use in the insurance industry for generating professional
              reports and documentation.
            </p>

            <h3>5.2 Prohibited Activities</h3>
            <p>You may not use our services to:</p>
            <ul>
              <li>Generate false, fraudulent, or misleading information</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to reverse engineer or hack the platform</li>
              <li>Resell or redistribute our services without authorization</li>
              <li>Use automated tools to access the service (bots, scrapers)</li>
              <li>Generate reports containing discriminatory or illegal content</li>
            </ul>

            <h3>5.3 Content Standards</h3>
            <p>
              All content you submit must be accurate, lawful, and appropriate for business use. We reserve the right
              to remove any content that violates these standards.
            </p>
          </section>

          <section>
            <h2>6. Intellectual Property Rights</h2>

            <h3>6.1 Our IP</h3>
            <p>
              All rights, title, and interest in the Platform, including software, designs, trademarks, and content,
              are owned by Flacron Enterprises LLC. You may not copy, modify, or distribute our intellectual property.
            </p>

            <h3>6.2 Your Content</h3>
            <p>
              You retain ownership of the data and information you input into the Platform. By using our services,
              you grant us a limited license to process your content for the purpose of providing our services.
            </p>

            <h3>6.3 Generated Reports</h3>
            <p>
              Reports generated by our AI are provided to you for your use. You are responsible for verifying the
              accuracy and appropriateness of all generated content before use.
            </p>
          </section>

          <section>
            <h2>7. AI-Generated Content Disclaimer</h2>
            <p>
              <strong>IMPORTANT:</strong> Our services use Google Gemini AI to generate report content. While we strive
              for accuracy, AI-generated content may contain errors, inaccuracies, or inconsistencies. You are solely
              responsible for:
            </p>
            <ul>
              <li>Reviewing all generated reports for accuracy</li>
              <li>Verifying information before using reports professionally</li>
              <li>Ensuring compliance with industry standards and regulations</li>
              <li>Making final judgments on report content and usage</li>
            </ul>
            <p>
              We do not guarantee the accuracy, completeness, or suitability of AI-generated content for any particular purpose.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLACRON ENTERPRISES LLC SHALL NOT BE LIABLE FOR:
            </p>
            <ul>
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Errors or inaccuracies in AI-generated content</li>
              <li>Service interruptions or downtime</li>
              <li>Third-party actions or content</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties of accuracy, reliability, or completeness</li>
              <li>Warranties of uninterrupted or error-free service</li>
              <li>Warranties regarding third-party services (Google Gemini AI, Firebase, Stripe)</li>
            </ul>
          </section>

          <section>
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Flacron Enterprises LLC from any claims, damages, losses, or expenses
              arising from:
            </p>
            <ul>
              <li>Your use or misuse of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or third-party rights</li>
              <li>Content you submit or generate</li>
            </ul>
          </section>

          <section>
            <h2>11. Data Privacy and Security</h2>
            <p>
              Your use of the Platform is also governed by our Privacy Policy. We implement industry-standard security
              measures, but cannot guarantee absolute security. You acknowledge that you transmit data at your own risk.
            </p>
            <p>
              Please review our <Link to="/privacy-policy">Privacy Policy</Link> for detailed information on how we
              collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2>12. Third-Party Services</h2>
            <p>
              Our Platform integrates with third-party services, including:
            </p>
            <ul>
              <li><strong>Google Gemini AI:</strong> For AI-powered content generation</li>
              <li><strong>Firebase:</strong> For authentication and data storage</li>
              <li><strong>Stripe:</strong> For payment processing</li>
            </ul>
            <p>
              Your use of these services is subject to their respective terms and policies. We are not responsible for
              the availability, accuracy, or functionality of third-party services.
            </p>
          </section>

          <section>
            <h2>13. Service Availability</h2>
            <p>
              While we strive to maintain 99.9% uptime, we do not guarantee uninterrupted service. We may suspend or
              discontinue services for maintenance, updates, or unforeseen circumstances without liability.
            </p>
          </section>

          <section>
            <h2>14. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email
              or platform notification. Your continued use of the Platform after changes constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section>
            <h2>15. Governing Law and Dispute Resolution</h2>

            <h3>15.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict
              of law principles.
            </p>

            <h3>15.2 Dispute Resolution</h3>
            <p>
              Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration
              in accordance with the rules of the American Arbitration Association, except as required by applicable law.
            </p>

            <h3>15.3 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes on an individual basis and waive your right to participate in class actions
              or collective proceedings.
            </p>
          </section>

          <section>
            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall
              remain in full force and effect.
            </p>
          </section>

          <section>
            <h2>17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Flacron
              Enterprises LLC regarding your use of the Platform.
            </p>
          </section>

          <section>
            <h2>18. Contact Information</h2>
            <p>
              For questions, concerns, or notices regarding these Terms, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Flacron Enterprises LLC</strong></p>
              <p>Email: <a href="mailto:support@flacronenterprises.com">support@flacronenterprises.com</a></p>
              <p>Website: <a href="https://flacronenterprises.com" target="_blank" rel="noopener noreferrer">flacronenterprises.com</a></p>
            </div>
          </section>

          <section className="acknowledgment">
            <p>
              <strong>By using FlacronAI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
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

export default TermsOfService;
