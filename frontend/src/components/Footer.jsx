import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.42a8.16 8.16 0 004.77 1.52V7.48a4.85 4.85 0 01-1-.79z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHashClick = (e, href) => {
    const hash = href.replace('/#', '');
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: hash } });
    }
  };

  const links = {
    Product: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'API Docs', href: '/docs/api' },
      { label: 'FAQs', href: '/faqs' },
    ],
    Company: [
      { label: 'Parent Company', href: 'https://flacronenterprises.com/', external: true },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Cookies Policy', href: '/cookies-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
  };

  const socials = [
    { label: 'Instagram', icon: InstagramIcon, href: 'https://www.instagram.com/flacronenterprisesllc/' },
    { label: 'LinkedIn',  icon: LinkedInIcon,  href: 'https://www.linkedin.com/company/flacronenterprisesllc/' },
    { label: 'Facebook',  icon: FacebookIcon,  href: 'https://www.facebook.com/people/Flacron-Enterprises/61579538447653/' },
    { label: 'TikTok',    icon: TikTokIcon,    href: 'https://www.tiktok.com/@flacronenterprises' },
    { label: 'X',         icon: XIcon,         href: 'https://x.com/flacron14958' },
    { label: 'YouTube',   icon: YouTubeIcon,   href: 'https://www.youtube.com/channel/UC09l7Vh-7D-7xQcNT002YGw' },
  ];

  return (
    <footer className="bg-[#ffffff] border-t border-[#e5e7eb] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg text-gray-900">FlacronAI</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
              AI-powered insurance inspection reports. Generate professional CRU GROUP-standard reports in minutes.
            </p>
            {/* Powered by badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Powered by</span>
              <span className="text-xs bg-orange-500/10 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-semibold">FlacronAI Engine</span>
              <span className="text-xs bg-sky-500/10 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-semibold">Microsoft</span>
            </div>
          </div>

          {/* Product & Company links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-gray-900 font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-gray-500 hover:text-orange-500 text-sm transition-colors">
                        {item.label}
                      </a>
                    ) : item.href.startsWith('/#') ? (
                      <a href={item.href} onClick={(e) => handleHashClick(e, item.href)}
                        className="text-gray-500 hover:text-orange-500 text-sm transition-colors cursor-pointer">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.href} className="text-gray-500 hover:text-orange-500 text-sm transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect */}
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-4">Connect</h4>
            <div className="flex flex-col gap-2.5">
              {socials.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-500 hover:text-orange-500 transition-colors group">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-500/10 transition-colors">
                    <Icon />
                  </div>
                  <span className="text-sm">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5e7eb] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 Flacron Enterprises. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
