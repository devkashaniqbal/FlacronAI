import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Lazy load all pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Subscriptions = lazy(() => import('./pages/Subscriptions.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const CRM = lazy(() => import('./pages/CRM.jsx'));
const ApiDocs = lazy(() => import('./pages/ApiDocs.jsx'));
const Developers = lazy(() => import('./pages/Developers.jsx'));

const Contact = lazy(() => import('./pages/Contact.jsx'));
const FAQs = lazy(() => import('./pages/FAQs.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const WhiteLabelPortal = lazy(() => import('./pages/WhiteLabelPortal.jsx'));
const EnterpriseOnboarding = lazy(() => import('./pages/EnterpriseOnboarding.jsx'));
const AdminTierUpdate = lazy(() => import('./pages/AdminTierUpdate.jsx'));
const EnterpriseDashboard = lazy(() => import('./pages/EnterpriseDashboard.jsx'));
const AcceptInvite = lazy(() => import('./pages/AcceptInvite.jsx'));
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy.jsx'));

const PageLoader = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-orange-500/30 rounded-full" />
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs/api" element={<ApiDocs />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/enterprise/:subdomain" element={<EnterpriseOnboarding />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="/cookies-policy" element={<CookiesPolicy />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/crm" element={<ProtectedRoute requiredTier="agency"><CRM /></ProtectedRoute>} />
        <Route path="/white-label" element={<ProtectedRoute requiredTier="enterprise"><WhiteLabelPortal /></ProtectedRoute>} />
        <Route path="/admin-tier-update" element={<ProtectedRoute><AdminTierUpdate /></ProtectedRoute>} />
        <Route path="/enterprise-dashboard" element={<ProtectedRoute requiredTier="enterprise"><EnterpriseDashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-bg flex items-center justify-center text-center p-4">
            <div>
              <h1 className="text-8xl font-black text-orange-500/20 mb-4">404</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
              <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary inline-block">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
};

export default App;
