import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI, paymentAPI } from '../services/api.js';
import { auth } from '../config/firebase.js';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [authState, setAuthState] = useState('form'); // 'form' | 'verifying' | 'processing'
  const [resendCooldown, setResendCooldown] = useState(0);

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', displayName: '' });
  const { login, register, loginWithGoogle, emailVerified, reloadUser } = useAuth();
  const navigate = useNavigate();

  const pendingPlan = searchParams.get('plan');

  // Save pending plan to sessionStorage on mount so it survives auth redirects
  useEffect(() => {
    if (pendingPlan && pendingPlan !== 'starter') {
      sessionStorage.setItem('flac_pending_plan', pendingPlan);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePostAuth = useCallback(async () => {
    const planToUse = pendingPlan || sessionStorage.getItem('flac_pending_plan');
    if (planToUse && planToUse !== 'starter') {
      try {
        const res = await paymentAPI.createCheckout(planToUse);
        if (res.data?.url) {
          sessionStorage.removeItem('flac_pending_plan');
          window.location.href = res.data.url;
          return;
        }
      } catch {
        toast.error('Account created! Redirecting to plans...');
        navigate('/pricing');
        return;
      }
    }
    navigate('/dashboard');
  }, [pendingPlan, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'signup') {
      if (!form.displayName) errs.displayName = 'Full name is required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResendVerification = async () => {
    try {
      await authAPI.sendVerification(pendingPlan || sessionStorage.getItem('flac_pending_plan'));
      toast.success('Verification email sent!');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error('Failed to resend. Please try again.');
    }
  };

  const handleCheckVerified = async () => {
    setAuthState('processing');
    await reloadUser();
    // Small delay to ensure Firebase has synced
    await new Promise(r => setTimeout(r, 500));
    if (auth.currentUser?.emailVerified) {
      await handlePostAuth();
    } else {
      setAuthState('verifying');
      toast.error('Email not verified yet. Please check your inbox.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        await handlePostAuth();
      } else {
        await register(form.email, form.password, form.displayName);
        toast.success('Account created! Please verify your email.');
        // Fire verification email (don't block on this)
        authAPI.sendVerification(pendingPlan || sessionStorage.getItem('flac_pending_plan')).catch(() => {});
        setAuthState('verifying');
      }
    } catch (err) {
      const code = err?.code;
      const msg =
        code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : code === 'auth/email-already-in-use'
          ? 'Email already registered. Please sign in instead.'
          : code === 'auth/account-exists-with-different-credential'
          ? 'An account with this email already exists. Please sign in with your email and password.'
          : code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please try again later or reset your password.'
          : code === 'auth/invalid-email'
          ? 'Invalid email address'
          : err?.message || 'Authentication failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      // Google users are already verified — go straight to post-auth
      await handlePostAuth();
    } catch (err) {
      if (
        err?.code === 'auth/account-exists-with-different-credential' ||
        err?.code === 'auth/email-already-in-use'
      ) {
        const msg = 'An account with this email already exists. Please sign in with your email and password instead.';
        toast.error(msg, { duration: 5000 });
        setErrors({ general: msg });
        setMode('login');
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // user closed the popup — silent, no error toast
      } else if (err?.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setForgotSent(true); // Don't reveal if email exists
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Verification screen ──────────────────────────────────────────────────────
  if (authState === 'verifying' || authState === 'processing') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-40 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Zap className="w-5 h-5 text-gray-900" fill="white" />
            </div>
            <span className="font-bold text-xl text-gray-900">FlacronAI</span>
          </Link>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-600 text-sm mb-6">
              We sent a verification link to{' '}
              <strong className="text-gray-900">{form.email}</strong>.
              <br />Check your inbox and click the link to continue.
            </p>

            {authState === 'processing' ? (
              <div className="flex items-center justify-center gap-2 py-3 mb-4 text-gray-600">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Checking verification status...</span>
              </div>
            ) : (
              <button
                onClick={handleCheckVerified}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              >
                <CheckCircle className="w-4 h-4" />
                I've Verified My Email
              </button>
            )}

            {resendCooldown > 0 ? (
              <p className="text-gray-500 text-sm font-medium">Resend in {resendCooldown}s</p>
            ) : (
              <button
                onClick={handleResendVerification}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Resend Verification Email
              </button>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Wrong email?{' '}
              <button
                onClick={() => setAuthState('form')}
                className="text-orange-500 hover:text-orange-600 font-medium underline"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main auth form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Zap className="w-5 h-5 text-gray-900" fill="white" />
          </div>
          <span className="font-bold text-xl text-gray-900">FlacronAI</span>
        </Link>

        {/* Card */}
        <div className="card p-8">
          {/* Plan context banner */}
          {pendingPlan && pendingPlan !== 'starter' && (
            <div className="mb-6 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
              <span className="font-semibold">
                {pendingPlan.replace('_annual', '').charAt(0).toUpperCase() + pendingPlan.replace('_annual', '').slice(1)} Plan selected
              </span>
              {' '}— {mode === 'signup' ? 'create your account' : 'sign in'} to continue to payment.
            </div>
          )}

          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${mode === m ? 'bg-orange-500 text-gray-900 shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        name="displayName"
                        type="text"
                        value={form.displayName}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className={`input pl-10 ${errors.displayName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
                  </div>
                )}

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-orange-400 hover:text-orange-300">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                {errors.general && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-600 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-100 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium transition-all"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>

              {mode === 'signup' && (
                <p className="text-center text-xs text-gray-600 mt-4">
                  By signing up, you agree to our{' '}
                  <Link to="/terms-of-service" className="text-orange-400 hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-orange-400 hover:underline">Privacy Policy</Link>
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }} className="text-orange-400 hover:text-orange-300 font-medium">
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-300 backdrop-blur-sm"
            onClick={() => { setForgotOpen(false); setForgotSent(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-8 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
              {forgotSent ? (
                <div>
                  <p className="text-gray-600 text-sm mb-4">If that email exists, a reset link has been sent.</p>
                  <button onClick={() => { setForgotOpen(false); setForgotSent(false); }} className="btn-primary w-full">Done</button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p className="text-gray-600 text-sm mb-4">Enter your email to receive a reset link.</p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input mb-4"
                    required
                  />
                  <button type="submit" disabled={forgotLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {forgotLoading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
