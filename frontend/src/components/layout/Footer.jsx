import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/elite-landing.css';

const Footer = () => {
  return (
    <footer className="footer-elite">
      <div className="container">
        <div className="footer-grid-elite">
          <div className="footer-section-elite">
            <img src="/logo-footer.png" alt="FlacronAI" className="footer-logo-elite" />
            <p>AI-powered insurance report generation using IBM WatsonX AI & Microsoft.</p>
          </div>
          <div className="footer-section-elite">
            <h4>Product</h4>
            <a href="/#features">Features</a>
            <Link to="/pricing">Pricing</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/developers">API Docs</Link>
            <Link to="/faqs">FAQs</Link>
          </div>
          <div className="footer-section-elite">
            <h4>Company</h4>
            <a href="https://www.flacronenterprises.com" target="_blank" rel="noopener noreferrer">Parent Company</a>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
          <div className="footer-section-elite">
            <h4>Connect</h4>
            <a href="https://www.tiktok.com/@flacronenterprises" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://www.linkedin.com/company/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/people/Flacron-Enterprises/61579538447653/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="mailto:support@flacronenterprises.com">Support</a>
          </div>
        </div>
        <div className="footer-bottom-elite">
          <p>&copy; 2025 Flacron Enterprises. All rights reserved.</p>
          <p className="footer-powered">Powered by IBM WatsonX AI & Microsoft</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
