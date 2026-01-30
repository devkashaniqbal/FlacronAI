import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2,
  Building2,
  Headphones,
  FileText,
  Zap
} from 'lucide-react';
import '../styles/contact.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Our team typically responds within 24 hours',
      value: 'Contact@flacronenterprises.com',
      link: 'mailto:Contact@flacronenterprises.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 6pm EST',
      value: '929-444-1275',
      link: 'tel:+19294441275'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hello at our office',
      value: '410 E 95th St, Brooklyn, NY 11212',
      link: 'https://maps.google.com/?q=410+E+95th+St+Brooklyn+NY+11212'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'sales', label: 'Sales & Pricing', icon: Zap },
    { value: 'support', label: 'Technical Support', icon: Headphones },
    { value: 'enterprise', label: 'Enterprise Solutions', icon: Building2 },
    { value: 'partnership', label: 'Partnership', icon: FileText }
  ];

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="hero-badge">Get in Touch</span>
          <h1>We'd Love to Hear From You</h1>
          <p>
            Have questions about FlacronAI? Our team is here to help you transform
            your insurance inspection workflow.
          </p>
        </div>
        <div className="hero-gradient-orb"></div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="container">
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="method-card"
                target={method.link.startsWith('http') ? '_blank' : undefined}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <div className="method-icon">
                  <method.icon size={24} />
                </div>
                <h3>{method.title}</h3>
                <p className="method-description">{method.description}</p>
                <span className="method-value">{method.value}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <div className="form-header">
                <h2>Send Us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              {submitted ? (
                <div className="success-message">
                  <div className="success-icon">
                    <CheckCircle size={48} />
                  </div>
                  <h3>Message Sent Successfully!</h3>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        company: '',
                        subject: '',
                        message: '',
                        type: 'general'
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {/* Inquiry Type Selection */}
                  <div className="inquiry-type-selector">
                    <label>What can we help you with?</label>
                    <div className="type-options">
                      {inquiryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          className={`type-option ${formData.type === type.value ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        >
                          <type.icon size={18} />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="spin" size={20} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Panel */}
            <div className="contact-info-panel">
              <div className="info-card">
                <h3>Quick Support</h3>
                <p>For existing customers, access our help center for instant answers to common questions.</p>
                <Link to="/faqs" className="info-link">
                  Visit Help Center
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="info-card">
                <h3>Enterprise Solutions</h3>
                <p>Looking for custom integrations or white-label solutions? Let's discuss your needs.</p>
                <Link to="/pricing" className="info-link">
                  View Enterprise Plans
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="info-card">
                <h3>API & Developers</h3>
                <p>Integrate FlacronAI into your existing systems with our comprehensive API.</p>
                <Link to="/developers" className="info-link">
                  View API Documentation
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="response-time">
                <Clock size={20} />
                <div>
                  <strong>Average Response Time</strong>
                  <span>Under 4 hours during business hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="office-section">
        <div className="container">
          <div className="office-content">
            <div className="office-info">
              <h2>Our Office</h2>
              <p>
                FlacronAI is a product of <a href="https://www.flacronenterprises.com" target="_blank" rel="noopener noreferrer">Flacron Enterprises</a>,
                a leader in AI-powered business solutions.
              </p>
              <div className="office-details">
                <div className="office-detail">
                  <MapPin size={20} />
                  <span>410 E 95th St, Brooklyn, NY 11212</span>
                </div>
                <div className="office-detail">
                  <Phone size={20} />
                  <span>929-444-1275</span>
                </div>
                <div className="office-detail">
                  <Mail size={20} />
                  <span>Contact@flacronenterprises.com</span>
                </div>
                <div className="office-detail">
                  <Clock size={20} />
                  <span>Monday - Friday: 9:00 AM - 6:00 PM EST</span>
                </div>
              </div>
              <a
                href="https://www.flacronenterprises.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-parent-company"
              >
                <Building2 size={20} />
                Visit Flacron Enterprises
              </a>
            </div>
            <div className="office-map">
              <div className="map-placeholder">
                <MapPin size={48} />
                <span>Interactive Map</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;
