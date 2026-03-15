import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, BarChart3, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const SECTIONS = [
  {
    id: 'what-are-cookies',
    icon: Cookie,
    color: 'orange',
    title: 'What Are Cookies?',
    content: `Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work efficiently, as well as to provide information to the website owners.

Cookies help us recognize your device, remember your preferences, and understand how you interact with our platform. They do not contain personal information by themselves, but may be linked to personal data we hold about you.

We also use similar technologies such as web beacons, pixels, and local storage that function similarly to cookies. This policy covers all such technologies collectively referred to as "cookies."`,
  },
  {
    id: 'cookies-we-use',
    icon: Settings,
    color: 'blue',
    title: 'Cookies We Use',
    subsections: [
      {
        label: 'Essential Cookies',
        badge: 'Always Active',
        badgeColor: 'green',
        description: 'These cookies are strictly necessary for the website to function. They cannot be disabled.',
        items: [
          { name: 'auth-token', purpose: 'Maintains your authenticated session across page loads', duration: 'Session / 30 days', provider: 'FlacronAI' },
          { name: 'csrf-token', purpose: 'Protects against Cross-Site Request Forgery attacks', duration: 'Session', provider: 'FlacronAI' },
          { name: '__session', purpose: 'Firebase Authentication session management', duration: 'Session', provider: 'Google Firebase' },
          { name: 'stripe.mid', purpose: 'Fraud prevention during payment processing', duration: '1 year', provider: 'Stripe' },
          { name: '__stripe_sid', purpose: 'Secure payment session identification', duration: 'Session', provider: 'Stripe' },
        ],
      },
      {
        label: 'Analytics Cookies',
        badge: 'Optional',
        badgeColor: 'blue',
        description: 'These cookies help us understand how visitors interact with our platform so we can improve it.',
        items: [
          { name: '_ga', purpose: 'Google Analytics — distinguishes unique users', duration: '2 years', provider: 'Google' },
          { name: '_ga_*', purpose: 'Google Analytics — maintains session state', duration: '2 years', provider: 'Google' },
          { name: 'firebase_analytics', purpose: 'Firebase Analytics — tracks feature usage and performance', duration: '13 months', provider: 'Google Firebase' },
        ],
      },
      {
        label: 'Preference Cookies',
        badge: 'Optional',
        badgeColor: 'purple',
        description: 'These cookies remember your settings and preferences to provide a personalized experience.',
        items: [
          { name: 'flacron_theme', purpose: 'Remembers your UI theme preference', duration: '1 year', provider: 'FlacronAI' },
          { name: 'flacron_sidebar', purpose: 'Stores sidebar collapsed/expanded state', duration: '30 days', provider: 'FlacronAI' },
          { name: 'flacron_report_prefs', purpose: 'Saves your default report type and format preferences', duration: '6 months', provider: 'FlacronAI' },
        ],
      },
    ],
  },
  {
    id: 'third-party',
    icon: ExternalLink,
    color: 'amber',
    title: 'Third-Party Cookies',
    content: `We work with trusted third-party services that may also set cookies on your device when you use FlacronAI. These third parties have their own privacy policies and cookie practices.

**Google Firebase** — Authentication, analytics, and database services. Firebase may set cookies to manage your authentication session and to collect anonymized usage analytics. Learn more at firebase.google.com/support/privacy.

**Stripe** — Secure payment processing. Stripe sets cookies for fraud prevention and to ensure secure, seamless payment flows. No payment card data is ever stored on our servers. Learn more at stripe.com/privacy.

**IBM (WatsonX)** — AI report generation infrastructure. WatsonX processes report generation requests server-side and does not set cookies in your browser directly.

We do not use advertising cookies or tracking cookies for ad targeting purposes. We will never sell your data to third-party advertisers.`,
  },
  {
    id: 'managing-cookies',
    icon: Settings,
    color: 'green',
    title: 'Managing Your Cookie Preferences',
    content: `You have several options to control how cookies are used when you visit FlacronAI:

**Browser Settings** — Most browsers allow you to view, block, or delete cookies through their settings. Blocking all cookies may affect some features of our platform, particularly authentication and payment functionality.

**Opt-Out of Analytics** — You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.

**Do Not Track** — Some browsers support a "Do Not Track" (DNT) signal. We honor DNT signals and will not load analytics cookies when your browser sends a DNT header.

**Cookie Consent** — When you first visit our platform, you will be presented with a cookie consent notice. You can update your preferences at any time by clearing your browser cookies and revisiting the site.

Please note that disabling essential cookies will affect core functionality including login, report saving, and payment processing.`,
  },
  {
    id: 'browser-instructions',
    icon: Settings,
    color: 'slate',
    title: 'Browser-Specific Instructions',
    browsers: [
      { name: 'Google Chrome', steps: 'Settings → Privacy and Security → Cookies and other site data', url: 'support.google.com/chrome/answer/95647' },
      { name: 'Mozilla Firefox', steps: 'Options → Privacy & Security → Cookies and Site Data', url: 'support.mozilla.org/kb/cookies-information-websites-store-on-your-computer' },
      { name: 'Safari', steps: 'Preferences → Privacy → Manage Website Data', url: 'support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
      { name: 'Microsoft Edge', steps: 'Settings → Privacy, search, and services → Cookies', url: 'support.microsoft.com/microsoft-edge/delete-cookies' },
      { name: 'Opera', steps: 'Settings → Advanced → Privacy & security → Site settings → Cookies', url: 'help.opera.com/en/latest/security-and-privacy' },
    ],
  },
  {
    id: 'retention',
    icon: BarChart3,
    color: 'indigo',
    title: 'Cookie Retention Periods',
    content: `Cookies are retained for varying periods depending on their purpose:

**Session Cookies** — Temporary cookies that are deleted when you close your browser. Used for authentication and security.

**Persistent Cookies (30 days)** — Remember your preferences and keep you logged in for a convenient experience. Deleted after 30 days of inactivity.

**Analytics Cookies (13–24 months)** — Used to track usage trends over time. These are anonymized and do not identify you personally.

**Payment Security Cookies (1 year)** — Used by Stripe to prevent fraud across sessions.

You can delete all cookies at any time through your browser settings. Essential cookies will be recreated on your next visit.`,
  },
  {
    id: 'updates',
    icon: Shield,
    color: 'orange',
    title: 'Updates to This Policy',
    content: `We may update this Cookies Policy from time to time to reflect changes in technology, law, or our business practices. When we make material changes, we will:

- Update the "Last updated" date at the top of this page
- Display a notice on our platform if the changes are significant
- Where required by law, seek your consent for new cookie types

We encourage you to review this policy periodically. Your continued use of FlacronAI after any changes constitutes your acceptance of the updated policy.

**Last updated:** March 1, 2026`,
  },
  {
    id: 'contact',
    icon: Shield,
    color: 'gray',
    title: 'Contact Us',
    content: `If you have questions about our use of cookies or this policy, please contact us:

**Email:** support@flacronenterprises.com
**Data Protection Officer:** support@flacronenterprises.com (EU residents)
**Mailing Address:** FlacronAI, 410 E 95th St, Brooklyn, NY 11212, United States

For general privacy questions, please see our full [Privacy Policy](/privacy-policy).`,
  },
];

const colorMap = {
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-700' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500', badge: 'bg-gray-100 text-gray-700' },
};

const badgeColorMap = {
  green: 'bg-green-100 text-green-700 border border-green-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
};

const renderContent = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**') && !para.slice(2).includes('**')) {
      return <p key={i} className="font-semibold text-gray-900 mt-4 mb-1">{para.slice(2, -2)}</p>;
    }
    const parts = para.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">
        {parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j} className="text-gray-900 font-semibold">{p}</strong> : p
        )}
      </p>
    );
  });
};

const AccordionSection = ({ section }) => {
  const [open, setOpen] = useState(true);
  const colors = colorMap[section.color] || colorMap.gray;
  const Icon = section.icon;

  return (
    <motion.div
      id={section.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-[#e5e7eb]">
          {section.content && (
            <div className="pt-5">{renderContent(section.content)}</div>
          )}

          {section.subsections && (
            <div className="pt-5 space-y-6">
              {section.subsections.map(sub => (
                <div key={sub.label}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{sub.label}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColorMap[sub.badgeColor] || ''}`}>
                      {sub.badge}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">{sub.description}</p>
                  <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Cookie Name', 'Purpose', 'Duration', 'Provider'].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-gray-600 font-semibold border-b border-[#e5e7eb]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sub.items.map((item, i) => (
                          <tr key={i} className="border-b border-[#e5e7eb] last:border-0 hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-gray-800">{item.name}</td>
                            <td className="px-4 py-3 text-gray-600">{item.purpose}</td>
                            <td className="px-4 py-3 text-gray-500">{item.duration}</td>
                            <td className="px-4 py-3 text-gray-500">{item.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.browsers && (
            <div className="pt-5 space-y-3">
              {section.browsers.map(b => (
                <div key={b.name} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-[#e5e7eb]">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.steps}</p>
                  </div>
                  <a
                    href={`https://${b.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                  >
                    Guide <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-12 bg-[#f8f8f8] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-200 rounded-xl flex items-center justify-center">
                <Cookie className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                Legal
              </span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">Cookies Policy</h1>
            <p className="text-gray-500 text-lg mb-4">
              How FlacronAI uses cookies and similar technologies to deliver and improve our platform.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>Last updated: <strong className="text-gray-600">March 1, 2026</strong></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Effective: <strong className="text-gray-600">March 1, 2026</strong></span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="flex-shrink-0 text-xs text-gray-500 hover:text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">

        {/* Summary banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-orange-800 font-semibold mb-2 text-sm">Summary</h2>
          <ul className="space-y-1.5 text-orange-700 text-sm">
            <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />We use essential cookies to keep you logged in and to process payments securely.</li>
            <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />We use optional analytics cookies (Google Firebase) to understand how our platform is used.</li>
            <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />We do <strong>not</strong> use advertising cookies or sell your data to advertisers.</li>
            <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />You can opt out of analytics cookies at any time without affecting core functionality.</li>
          </ul>
        </motion.div>

        {SECTIONS.map(section => (
          <AccordionSection key={section.id} section={section} />
        ))}

        {/* Related links */}
        <div className="border-t border-[#e5e7eb] pt-8 mt-8">
          <p className="text-sm text-gray-500 mb-4">Related policies:</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms of Service', href: '/terms-of-service' },
              { label: 'Contact Us', href: '/contact' },
            ].map(l => (
              <Link key={l.label} to={l.href}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-200 hover:border-orange-300 px-4 py-2 rounded-lg transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
