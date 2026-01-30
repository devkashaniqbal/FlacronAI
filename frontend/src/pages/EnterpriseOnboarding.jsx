import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/enterprise-onboarding.css';

const EnterpriseOnboarding = () => {
  const { subdomain } = useParams();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    setCompanyData({
      name: subdomain?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Your Company',
      subdomain: subdomain
    });
  }, [subdomain]);

  return (
    <div className="enterprise-onboarding">
      {/* Navigation */}
      <nav className="onboarding-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo.png" alt="FlacronAI" />
            <span className="logo-text">FlacronAI</span>
          </div>
          <a href="https://flacronai.com" className="back-home">
            <i className="fas fa-arrow-left"></i> Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="onboarding-content">
        <div className="content-wrapper">
          {/* Left Section - Illustration/Icon */}
          <div className="left-section">
            <div className="illustration-container">
              <div className="pulse-circle pulse-1"></div>
              <div className="pulse-circle pulse-2"></div>
              <div className="pulse-circle pulse-3"></div>
              <div className="main-icon">
                <i className="fas fa-rocket"></i>
              </div>
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="right-section">
            <div className="status-badge">
              <span className="badge-dot"></span>
              Setting Up
            </div>

            <h1 className="main-heading">
              Welcome, <span className="company-highlight">{companyData?.name}</span>!
            </h1>

            <p className="main-description">
              Your Enterprise portal is being carefully prepared with custom features and branding tailored to your needs.
            </p>

            {/* Progress Timeline */}
            <div className="progress-timeline">
              <div className="timeline-step completed">
                <div className="step-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="step-content">
                  <h3>Account Approved</h3>
                  <p>Your Enterprise subscription is active</p>
                </div>
              </div>

              <div className="timeline-connector completed"></div>

              <div className="timeline-step active">
                <div className="step-icon">
                  <div className="spinner"></div>
                </div>
                <div className="step-content">
                  <h3>Portal Configuration</h3>
                  <p>Setting up your custom environment</p>
                </div>
              </div>

              <div className="timeline-connector"></div>

              <div className="timeline-step">
                <div className="step-icon">
                  <i className="far fa-envelope"></i>
                </div>
                <div className="step-content">
                  <h3>Ready to Launch</h3>
                  <p>You'll receive an email notification</p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="info-card-single">
              <div className="card-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="card-content">
                <h4>Expected Timeline</h4>
                <p>Your portal will be ready in 1-2 business days</p>
              </div>
            </div>

            {/* Portal URL */}
            <div className="portal-url-box">
              <label>Your Custom Portal URL</label>
              <div className="url-display">
                <i className="fas fa-globe"></i>
                <span>https://flacronai.com/{subdomain}</span>
              </div>
            </div>

            {/* Help Section */}
            <div className="help-section">
              <p>
                <i className="fas fa-question-circle"></i>
                Have questions? <a href="mailto:enterprise@flacronai.com">Contact our Enterprise team</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="onboarding-footer">
        <div className="footer-content">
          <p>&copy; 2025 FlacronAI. All rights reserved.</p>
          <div className="footer-links">
            <a href="https://flacronai.com/privacy-policy">Privacy</a>
            <span>·</span>
            <a href="https://flacronai.com/terms-of-service">Terms</a>
            <span>·</span>
            <a href="https://flacronai.com/contact">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnterpriseOnboarding;
