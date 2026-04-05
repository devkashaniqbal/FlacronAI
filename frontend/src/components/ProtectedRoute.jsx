import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requiredTier }) => {
  const { isAuthenticated, loading, tier, user, emailVerified, reloadUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check email verification for email/password users (Google users already verified)
  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com');
  if (!emailVerified && !isGoogleUser) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm mb-6">
            Please verify your email address to access your dashboard. Check your inbox for the verification link.
          </p>
          <button
            onClick={async () => { await reloadUser(); }}
            className="btn-primary w-full mb-3 flex items-center justify-center gap-2"
          >
            I've Verified My Email
          </button>
          {resendDone ? (
            <p className="text-green-600 text-sm font-medium">Email sent! Check your inbox.</p>
          ) : (
            <button
              onClick={async () => {
                setResending(true);
                try {
                  const { authAPI } = await import('../services/api.js');
                  await authAPI.sendVerification();
                  setResendDone(true);
                  setTimeout(() => setResendDone(false), 30000);
                } catch (err) {
                  console.error('Resend verification error:', err?.response?.data || err.message);
                  toast.error('Could not send email. Check console for details.');
                }
                setResending(false);
              }}
              disabled={resending}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          )}
          <button
            onClick={() => navigate('/auth')}
            className="block mx-auto mt-4 text-gray-500 hover:text-gray-700 text-xs"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (requiredTier) {
    const tierOrder = ['starter', 'professional', 'agency', 'enterprise'];
    const userIdx = tierOrder.indexOf(tier);
    const reqIdx = tierOrder.indexOf(requiredTier);
    if (userIdx < reqIdx) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upgrade Required</h2>
            <p className="text-gray-600 mb-6">
              This feature requires <strong className="text-orange-400 capitalize">{requiredTier}</strong> tier or higher.
              You're currently on <strong className="text-gray-900 capitalize">{tier}</strong>.
            </p>
            <a href="/pricing" className="btn-primary inline-block">View Pricing Plans</a>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
