import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/elite-landing.css';

const Navbar = () => {
  const [navScrolled, setNavScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/blog', label: 'Blog' },
  ];

  const servicesLinks = [
    { path: '/developers', label: 'Developer Area' },
    { href: 'https://flacronenterprises.com', label: 'Parent Company', external: true },
  ];

  const additionalLinks = [
    { path: '/contact', label: 'Contact' },
    { path: '/faqs', label: 'FAQ' },
  ];

  return (
    <>
      <motion.header
        ref={navRef}
        className={`navbar-redesign ${navScrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container">
          <div className="navbar-content-redesign">
            <motion.div
              className="logo-redesign"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link to="/">
                <img src="/logo.png" alt="FlacronAI" className="logo-img-redesign" />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="nav-redesign nav-desktop">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link-redesign ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              <div
                className="nav-dropdown-redesign"
                onMouseEnter={() => {
                  if (window.servicesTimeout) clearTimeout(window.servicesTimeout);
                  setServicesOpen(true);
                }}
                onMouseLeave={() => {
                  window.servicesTimeout = setTimeout(() => {
                    setServicesOpen(false);
                  }, 300);
                }}
              >
                <span className="nav-link-redesign">
                  Services
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '4px' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {servicesOpen && (
                  <motion.div
                    className="dropdown-menu-redesign"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {servicesLinks.map((link, index) => (
                      link.external ? (
                        <a
                          key={index}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dropdown-item-redesign"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="dropdown-item-redesign"
                        >
                          {link.label}
                        </Link>
                      )
                    ))}
                  </motion.div>
                )}
              </div>

              {additionalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link-redesign ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              <Link to="/auth" className="nav-cta-redesign">
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className={`hamburger-menu ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="mobile-nav-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Mobile Menu */}
              <motion.nav
                className="nav-mobile"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="mobile-nav-header">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <img src="/logo.png" alt="FlacronAI" className="mobile-nav-logo" />
                  </Link>
                  <button
                    className="mobile-nav-close"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mobile-nav-links">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Services Dropdown for Mobile */}
                  <div className="mobile-nav-dropdown">
                    <button
                      className={`mobile-nav-link mobile-nav-dropdown-toggle ${mobileServicesOpen ? 'open' : ''}`}
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    >
                      Services
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`dropdown-arrow ${mobileServicesOpen ? 'rotated' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          className="mobile-nav-dropdown-menu"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {servicesLinks.map((link, index) => (
                            link.external ? (
                              <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-nav-dropdown-item"
                              >
                                {link.label}
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M12 8.5V12.5C12 13.0523 11.5523 13.5 11 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V5C2.5 4.44772 2.94772 4 3.5 4H7.5M10 2.5H13.5M13.5 2.5V6M13.5 2.5L7 9" />
                                </svg>
                              </a>
                            ) : (
                              <Link
                                key={link.path}
                                to={link.path}
                                className="mobile-nav-dropdown-item"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {link.label}
                              </Link>
                            )
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {additionalLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mobile-nav-footer">
                  <Link
                    to="/auth"
                    className="mobile-nav-cta"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
