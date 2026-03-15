import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import TierBadge from './TierBadge.jsx';

const Navbar = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, userProfile, logout, tier } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashClick = (e, href) => {
    const hash = href.replace('/#', '');
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: hash } });
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs/api' },
  ];

  const bgClass = scrolled || !transparent
    ? 'bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-lg shadow-black/20'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-gray-900" fill="white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">FlacronAI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link =>
              link.href.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleHashClick(e, link.href)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <TierBadge tier={tier} />
                <Link to="/dashboard" className="btn-primary text-sm py-2 px-5">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Sign in</Link>
                <Link to="/auth?mode=signup" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#f8f8f8] border-t border-[#e5e7eb]"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link =>
                link.href.startsWith('/#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleHashClick(e, link.href)}
                    className="block px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="block px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-[#e5e7eb] space-y-2">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="block btn-primary text-center">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/auth" className="block text-center py-2.5 text-gray-600 hover:text-gray-900">Sign in</Link>
                    <Link to="/auth?mode=signup" className="block btn-primary text-center">Get Started Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
