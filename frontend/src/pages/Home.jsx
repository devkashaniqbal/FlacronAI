import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { initScrollAnimations, addRippleEffect } from '../utils/scrollAnimations';

// Import layout components
import { Navbar, Footer } from '../components/layout';
import ContactSalesModal from '../components/common/ContactSalesModal';

// Import custom high-end components
import RainbowButton from '../components/ui/RainbowButton';
import ShimmerButton from '../components/ui/ShimmerButton';
import SmoothCursor from '../components/ui/SmoothCursor';
import PricingCard from '../components/ui/PricingCard';
import BrandLogoMarquee from '../components/ui/BrandLogoMarquee';
import VelocityScroll from '../components/ui/VelocityScroll';
import Marquee3D from '../components/ui/Marquee3D';
import ChatbotFAQ from '../components/ui/ChatbotFAQ';

// Lazy load heavy components
const InteractiveGlobe = lazy(() => import('../components/ui/InteractiveGlobe'));

import '../styles/elite-landing.css';

const Home = () => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Count up animation for stats
  const [stats, setStats] = useState({ reports: 0, clients: 0, accuracy: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    document.title = 'FlacronAI - AI-Powered Insurance Report Generator';

    // Add landing-page class to body to prevent dark overlays
    document.body.classList.add('landing-page');

    const animations = initScrollAnimations();
    addRippleEffect();

    return () => {
      // Remove landing-page class when component unmounts
      document.body.classList.remove('landing-page');

      if (animations && animations.disconnect) {
        animations.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate reports
          let reportsCount = 0;
          const reportsInterval = setInterval(() => {
            reportsCount += 200;
            if (reportsCount >= 10000) {
              setStats(prev => ({ ...prev, reports: 10000 }));
              clearInterval(reportsInterval);
            } else {
              setStats(prev => ({ ...prev, reports: reportsCount }));
            }
          }, 10);

          // Animate clients
          let clientsCount = 0;
          const clientsInterval = setInterval(() => {
            clientsCount += 10;
            if (clientsCount >= 500) {
              setStats(prev => ({ ...prev, clients: 500 }));
              clearInterval(clientsInterval);
            } else {
              setStats(prev => ({ ...prev, clients: clientsCount }));
            }
          }, 15);

          // Animate accuracy
          let accuracyCount = 0;
          const accuracyInterval = setInterval(() => {
            accuracyCount += 2;
            if (accuracyCount >= 99) {
              setStats(prev => ({ ...prev, accuracy: 99 }));
              clearInterval(accuracyInterval);
            } else {
              setStats(prev => ({ ...prev, accuracy: accuracyCount }));
            }
          }, 20);
        }
      },
      { threshold: 0.5 }
    );

    const statsElement = document.querySelector('.hero-stats-split');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <>
      {/* Smooth Custom Cursor */}
      <SmoothCursor />

      <Navbar />

      {/* Hero Section - Split Layout */}
      <motion.section
        className="hero-redesign"
        id="home"
      >
        <div className="container">
          <div className="hero-split-layout">
            <div className="hero-content-left">
              {/* Top Badge */}
              <motion.div
                className="badge-top-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <svg className="badge-icon-redesign" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FF7C08"/>
                </svg>
                <span>Powered by AI</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="hero-title-split"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Generate Insurance Reports in <span className="highlight-orange">Seconds</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="hero-description-split"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Professional AI-powered report generation using IBM WatsonX AI & Microsoft. Transform hours of work into minutes with accurate, consistent documentation.
              </motion.p>

              {/* Feature Checklist */}
              <motion.ul
                className="hero-features-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Generate complete reports in under 60 seconds
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  99% accuracy with AI-powered analysis
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export to PDF, DOCX, and multiple formats
                </li>
              </motion.ul>

              {/* CTA Buttons */}
              <motion.div
                className="cta-buttons-split"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link to="/auth" className="btn-primary-cta">
                  Start Free Trial
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <a href="#features" className="btn-secondary-cta">
                  Watch Demo
                </a>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                className="hero-stats-split"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <div className="stat-item-split">
                  <div className="stat-number-split">{stats.reports >= 10000 ? '10,000+' : stats.reports.toLocaleString()}</div>
                  <div className="stat-label-split">Reports Generated</div>
                </div>
                <div className="stat-divider-split"></div>
                <div className="stat-item-split">
                  <div className="stat-number-split">{stats.accuracy}%</div>
                  <div className="stat-label-split">Accuracy Rate</div>
                </div>
                <div className="stat-divider-split"></div>
                <div className="stat-item-split">
                  <div className="stat-number-split">{stats.clients >= 500 ? '500+' : stats.clients}</div>
                  <div className="stat-label-split">Happy Clients</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hero-visual-right"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="hero-mockup-container">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=900&fit=crop&q=80" alt="Professional Insurance Report" className="hero-mockup-img" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section className="features-elite" id="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-elite">Everything You Need</h2>
            <p className="section-subtitle-elite">
              Professional tools designed for modern insurance professionals
            </p>
          </motion.div>

          <div className="bento-grid-elite">
            {[
              {
                icon: <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.183a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "AI Document Generator",
                description: "Generates CRU-style or custom templates instantly using IBM WatsonX AI & OpenAI"
              },
              {
                icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Structured Input Forms",
                description: "Captures claim numbers, property data, damages, and contacts efficiently"
              },
              {
                icon: <><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 3v6a1 1 0 001 1h6M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Multiple Export Formats",
                description: "Export reports in DOCX, PDF, and HTML formats with your logo"
              },
              {
                icon: <><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Photo Integration",
                description: "Upload site photos and get AI-powered damage analysis"
              },
              {
                icon: <><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Map & GPS",
                description: "Automatically includes inspection site maps in reports"
              },
              {
                icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Quality Checker",
                description: "AI ensures reports have no missing key fields"
              },
              {
                icon: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Multi-User Access",
                description: "Role-based access control for teams and agencies"
              },
              {
                icon: <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Multi-Language",
                description: "Generate reports in English, French, and Spanish"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bento-card-elite"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="bento-card-glow"></div>
                <div className="feature-icon-elite">
                  <svg viewBox="0 0 24 24" fill="none">
                    {feature.icon}
                  </svg>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-hiw">Generate Reports in 3 Simple Steps</h2>
            <p className="section-subtitle-hiw">From data upload to export in minutes</p>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                number: "01",
                icon: <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Upload Your Data",
                description: "Add claim details, property information, damage notes, and site photos through our intuitive form"
              },
              {
                number: "02",
                icon: <><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "AI Generates Report",
                description: "IBM Watson AI analyzes your data and creates a professional, CRU-compliant report in seconds"
              },
              {
                number: "03",
                icon: <><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 3v6a1 1 0 001 1h6" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Export & Share",
                description: "Download your report in PDF, DOCX, or HTML format with your custom logo and branding"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {step.icon}
                  </svg>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Reviews Marquee Section */}
      <Marquee3D />

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-uc">Built for Insurance Professionals</h2>
            <p className="section-subtitle-uc">Tailored solutions for every role in the insurance industry</p>
          </motion.div>

          <div className="use-cases-grid">
            {[
              {
                icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Independent Adjusters",
                description: "Fast, professional reporting tools designed for solo adjusters handling multiple claims efficiently",
                link: "#"
              },
              {
                icon: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Adjusting Firms",
                description: "Team collaboration features, shared templates, and quality control for multi-adjuster operations",
                link: "#"
              },
              {
                icon: <><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Enterprise Insurers",
                description: "White-label solutions, API access, custom integrations, and dedicated support for large organizations",
                link: "#"
              },
              {
                icon: <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Catastrophe Teams",
                description: "Handle high-volume claim reporting during CAT events with rapid deployment and scalability",
                link: "#"
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                className="use-case-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="use-case-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {useCase.icon}
                  </svg>
                </div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
                <a href={useCase.link} className="use-case-link">
                  Learn More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - High-End Glassmorphic Redesign */}
      <section className="pricing-elite" id="pricing">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-elite">Simple, Transparent Pricing</h2>
            <p className="section-subtitle-elite">Choose the plan that scales with your business</p>
          </motion.div>

          {/* Pricing Cards Grid */}
          <div className="pricing-grid-premium">
            <PricingCard
              name="Professional"
              price="39.99"
              period="/month"
              description="Perfect for individual adjusters"
              features={[
                { text: "20 reports per month", available: true },
                { text: "AI-powered generation", available: true },
                { text: "PDF & DOCX export", available: true },
                { text: "No watermark", available: true },
                { text: "Custom logo", available: true },
                { text: "Email support", available: true }
              ]}
              link="/auth"
              isFeatured={false}
              isAnnual={false}
              index={0}
            />

            <PricingCard
              name="Agency"
              price="99.99"
              period="/month"
              description="Ideal for growing agencies"
              features={[
                { text: "100 reports per month", available: true },
                { text: "5 user accounts", available: true },
                { text: "All export formats", available: true },
                { text: "Agency dashboard", available: true },
                { text: "Custom branding", available: true },
                { text: "Priority support", available: true }
              ]}
              link="/auth"
              isFeatured={true}
              isAnnual={false}
              index={1}
            />

            <PricingCard
              name="Enterprise"
              price="499"
              period="/month"
              description="For large organizations"
              features={[
                { text: "Unlimited reports", available: true },
                { text: "Unlimited users", available: true },
                { text: "API access", available: true },
                { text: "White-label portal", available: true },
                { text: "Custom integration", available: true },
                { text: "Dedicated support", available: true }
              ]}
              onClick={() => setShowContactModal(true)}
              isFeatured={false}
              isAnnual={false}
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Chatbot FAQ */}
      <ChatbotFAQ />

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <motion.div
            className="final-cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Transform Your Reporting Workflow?</h2>
            <p>Join 500+ insurance professionals using FlacronAI to generate professional reports in seconds</p>
            <Link to="/auth" className="btn-final-cta">
              Start Free Trial - No Credit Card Required
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <p className="final-cta-note">14-day free trial • Cancel anytime • No obligations</p>
          </motion.div>
        </div>
      </section>

      <Footer />

      <ContactSalesModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
};

export default Home;
