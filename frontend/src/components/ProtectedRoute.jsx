import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requiredTier }) => {
  const { isAuthenticated, loading, tier } = useAuth();
  const location = useLocation();

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
