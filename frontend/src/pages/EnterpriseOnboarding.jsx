import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Building2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { whiteLabelAPI } from '../services/api';

const DEFAULT_BRAND = {
  companyName: 'FlacronAI',
  primaryColor: '#f97316',
  secondaryColor: '#8b5cf6',
  logoUrl: null,
  headerText: 'AI-Powered Insurance Claim Reports',
  footerText: '© 2026 FlacronAI, Inc. All rights reserved.',
  hideFlacronBranding: false,
};

function SkeletonPortal() {
  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="skeleton h-14 w-40 mx-auto rounded-xl" />
        <div className="skeleton h-8 w-64 mx-auto rounded-xl" />
        <div className="skeleton h-4 w-48 mx-auto rounded-lg" />
        <div className="card p-6 mt-6 space-y-4">
          <div className="skeleton h-10 w-full rounded-xl" />
          <div className="skeleton h-10 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseOnboarding() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [brandFound, setBrandFound] = useState(false);

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', displayName: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) { navigate('/dashboard'); return; }
    if (!subdomain) { setLoading(false); return; }
    whiteLabelAPI.getPortal(subdomain).then(res => {
      const config = res.data?.config || res.data;
      if (config) {
        setBrand({ ...DEFAULT_BRAND, ...config });
        setBrandFound(true);
      }
    }).catch(() => {
      // Fall back to FlacronAI default branding
    }).finally(() => setLoading(false));
  }, [subdomain, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setAuthError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.displayName);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonPortal />;

  const primary = brand.primaryColor || '#f97316';
  const secondary = brand.secondaryColor || '#8b5cf6';

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {/* Branded Header */}
      <header className="py-4 px-6 border-b border-gray-200" style={{ background: `${primary}18` }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.companyName} className="h-9 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-900 font-bold text-base" style={{ background: primary }}>
              {(brand.companyName || 'A')[0]}
            </div>
          )}
          <span className="text-gray-900 font-bold text-lg">{brand.companyName}</span>
        </div>
      </header>

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 -top-20 -left-20 animate-blob"
          style={{ background: primary }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-10 -bottom-10 -right-10 animate-blob animation-delay-2000"
          style={{ background: secondary }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {/* Branding Header */}
          <div className="text-center mb-8">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.companyName} className="h-14 object-contain mx-auto mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-900 font-bold text-3xl mx-auto mb-4" style={{ background: primary }}>
                {(brand.companyName || 'A')[0]}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{brand.companyName}</h1>
            <p className="text-gray-600 text-sm mt-1">{brand.headerText || 'Secure Client Portal'}</p>
            {brandFound && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${primary}25`, color: primary, border: `1px solid ${primary}40` }}>
                <Building2 className="w-3 h-3" /> Enterprise Portal
              </div>
            )}
          </div>

          {/* Auth Card */}
          <div className="card p-6" style={{ borderColor: `${primary}30` }}>
            {/* Mode Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setAuthError(''); setForm(f => ({ ...f, password: '', confirmPassword: '' })); }}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={mode === m ? { background: primary, color: 'white' } : { color: '#9ca3af' }}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="label">Full Name</label>
                    <input className="input" placeholder="John Smith" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" required placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-10" required placeholder="Minimum 8 characters"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="label">Confirm Password</label>
                    <input type={showPw ? 'text' : 'password'} className="input" placeholder="Repeat your password"
                      value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                  </motion.div>
                )}
              </AnimatePresence>

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{authError}</p>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-gray-900 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                style={{ background: primary, boxShadow: `0 0 20px ${primary}40` }}>
                {submitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-6">
            {brand.footerText}
            {!brand.hideFlacronBranding && (
              <span> · <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Powered by FlacronAI</button></span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
