import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import TierBadge from './TierBadge.jsx';

const Navbar = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
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
  useEffect(() => setUserMenuOpen(false), [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs/api' },
    ...(isAuthenticated ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
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
                  className={`text-sm transition-colors font-medium ${
                    location.pathname === link.href
                      ? 'text-orange-500 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-500">
                    {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <TierBadge tier={tier} />
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e5e7eb] rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-[#e5e7eb]">
                        <p className="text-xs font-semibold text-gray-900 truncate">{userProfile?.displayName || 'My Account'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Zap className="w-4 h-4 text-orange-500" />
                          Dashboard
                        </Link>
                        <Link to="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-[#e5e7eb] py-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                    className={`block px-3 py-2.5 rounded-lg transition-colors ${
                      location.pathname === link.href
                        ? 'text-orange-500 font-semibold bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-[#e5e7eb] space-y-1">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{userProfile?.displayName || 'My Account'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/dashboard" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">Dashboard</Link>
                    <Link to="/settings" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">Settings</Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
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
