import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initScrollAnimations, addRippleEffect } from '../utils/scrollAnimations';
import '../styles/styles.css';

const Home = () => {
  useEffect(() => {
    document.title = 'FlacronAI - AI-Powered Insurance Report Generator';

    const animations = initScrollAnimations();
    addRippleEffect();

    return () => {
      if (animations && animations.disconnect) {
        animations.disconnect();
      }
    };
  }, []);

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/logo.png" alt="FlacronAI" className="logo-image" />
            </div>
            <nav className="nav">
              <a href="#home" className="nav-link active">Home</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <Link to="/auth" className="btn btn-primary">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FF7C08"/>
              </svg>
              <span>Powered by AI</span>
            </div>
            <h1 className="hero-title">
              Generate Insurance<br/>
              Reports in <span>Seconds</span>
            </h1>
            <p className="hero-description">
              Professional AI-powered report generation using Google Gemini.
              Transform hours of work into minutes with accurate, consistent documentation.
            </p>
            <div className="hero-buttons">
              <Link to="/auth" className="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Free Trial
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Learn More
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item animate-on-scroll">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Reports Generated</div>
              </div>
              <div className="stat-item animate-on-scroll">
                <div className="stat-number">500+</div>
                <div className="stat-label">Happy Clients</div>
              </div>
              <div className="stat-item animate-on-scroll">
                <div className="stat-number">99%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-preview">
              <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="100" y="50" width="300" height="400" rx="20" fill="white" stroke="#FF7C08" strokeWidth="4"/>
                <rect x="140" y="100" width="220" height="20" rx="10" fill="#FF7C08" opacity="0.3"/>
                <rect x="140" y="140" width="180" height="20" rx="10" fill="#000000" opacity="0.1"/>
                <rect x="140" y="180" width="220" height="20" rx="10" fill="#000000" opacity="0.1"/>
                <rect x="140" y="220" width="160" height="20" rx="10" fill="#000000" opacity="0.1"/>
                <rect x="140" y="280" width="220" height="80" rx="10" fill="#FF7C08" opacity="0.1"/>
                <circle cx="250" cy="400" r="30" fill="#FF7C08"/>
                <path d="M240 400L248 408L260 392" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            Professional tools designed for modern insurance professionals
          </p>

          <div className="features-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.183a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>AI Document Generator</h3>
              <p>Generates CRU-style or custom templates instantly using Google Gemini AI</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Structured Input Forms</h3>
              <p>Captures claim numbers, property data, damages, and contacts efficiently</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 3v6a1 1 0 001 1h6M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Multiple Export Formats</h3>
              <p>Export reports in DOCX, PDF, and HTML formats with your logo</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Photo Integration</h3>
              <p>Upload site photos and get AI-powered damage analysis</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Map & GPS</h3>
              <p>Automatically includes inspection site maps in reports</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Quality Checker</h3>
              <p>AI ensures reports have no missing key fields</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Multi-User Access</h3>
              <p>Role-based access control for teams and agencies</p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Multi-Language</h3>
              <p>Generate reports in English, French, and Spanish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2 className="section-title">Simple Pricing</h2>
          <p className="section-subtitle">Choose the plan that works for you</p>

          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card animate-on-scroll">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> 1 report per month</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> All report types</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> PDF export</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> No watermark</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Custom logo</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Priority support</li>
              </ul>
              <Link to="/auth?redirect=checkout&plan=starter" className="btn btn-outline">Get Started</Link>
            </div>

            {/* Professional */}
            <div className="pricing-card featured animate-on-scroll">
              <div className="badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">39.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> 20 reports per month</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> All report types</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> PDF & DOCX export</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> No watermark</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Custom logo</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Email support</li>
              </ul>
              <Link to="/auth?redirect=checkout&plan=professional" className="btn btn-primary">Get Started</Link>
            </div>

            {/* Agency */}
            <div className="pricing-card animate-on-scroll">
              <div className="pricing-header">
                <h3>Agency</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">99.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> 100 reports per month</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> 5 user accounts</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> All export formats</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Agency dashboard</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Custom branding</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Priority support</li>
              </ul>
              <Link to="/auth?redirect=checkout&plan=agency" className="btn btn-outline">Get Started</Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card animate-on-scroll">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">499</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Unlimited reports</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Unlimited users</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> API access</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> White-label portal</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Custom integration</li>
                <li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Dedicated support</li>
              </ul>
              <Link to="/auth?redirect=checkout&plan=enterprise" className="btn btn-outline">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src="/logo.png" alt="FlacronAI" style={{height: '50px', marginBottom: '1rem'}} />
              <p>AI-powered insurance report generation using Google Gemini AI.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link to="/dashboard">Dashboard</Link>
              <a href="#">API Docs</a>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <a href="https://flacronenterprises.com/about-us/" target="_blank" rel="noopener noreferrer">About</a>
              <a href="https://flacronenterprises.com/contact-us/" target="_blank" rel="noopener noreferrer">Contact</a>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <a href="https://www.tiktok.com/@flacronenterprises" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://www.linkedin.com/company/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/people/Flacron-Enterprises/61579538447653/" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="mailto:support@flacronenterprises.com">Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Flacron Enterprises. All rights reserved.</p>
            <p>Powered by Google Gemini AI</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
