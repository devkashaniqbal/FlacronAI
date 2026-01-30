import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import CRMLogin from './pages/CRMLogin';
import Subscriptions from './pages/Subscriptions';
import AdminTierUpdate from './pages/AdminTierUpdate';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EnterpriseOnboarding from './pages/EnterpriseOnboarding';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import Developers from './pages/Developers';
import WhiteLabelPortal from './pages/WhiteLabelPortal';
import NotFound from './pages/NotFound';

import './App.css';
import './styles/responsive.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/crm-login" element={<CRMLogin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-tier-update"
            element={
              <ProtectedRoute>
                <AdminTierUpdate />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/enterprise/:subdomain" element={<EnterpriseOnboarding />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/docs/api" element={<ApiDocs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/developers" element={<Developers />} />
          <Route
            path="/white-label"
            element={
              <ProtectedRoute>
                <WhiteLabelPortal />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
