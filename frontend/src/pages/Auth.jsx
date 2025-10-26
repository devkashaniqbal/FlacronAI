import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  useEffect(() => {
    document.title = 'Sign In | FlacronAI';
  }, []);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        // Validate passwords match
        if (formData.password !== formData.passwordConfirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          setError('Password must be 8+ characters with uppercase, lowercase, number, and special character');
          setLoading(false);
          return;
        }

        await register(formData.email, formData.password, formData.displayName);
        setSuccess('Account created! Please check your email to verify.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      await resetPassword(resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox.');
      setResetEmail('');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess('');
      }, 3000);
    } catch (err) {
      let errorMsg = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      setResetError(errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', passwordConfirm: '', displayName: '' });
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        .auth-container {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .auth-form-section {
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          overflow-y: auto;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .auth-header h1 span {
          color: #FF7C08;
        }

        .auth-header p {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .auth-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .auth-tab {
          flex: 1;
          padding: 0.75rem;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s;
        }

        .auth-tab.active {
          background: #FF7C08;
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #FF7C08;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          padding-right: 45px;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          color: #6b7280;
          transition: color 0.3s;
        }

        .password-toggle:hover {
          color: #FF7C08;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #FF7C08;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .submit-btn:hover {
          background: #e76e06;
        }

        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message, .success-message {
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
        }

        .form-help {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .forgot-password-link {
          display: block;
          text-align: right;
          margin-top: -0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #FF7C08;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
        }

        .forgot-password-link:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .auth-footer a {
          color: #FF7C08;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        .security-badges {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .auth-showcase-section {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .auth-showcase-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 60%;
          height: 100%;
          background: radial-gradient(ellipse at top right, rgba(255, 124, 8, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .showcase-content {
          position: relative;
          z-index: 2;
          max-width: 500px;
          color: white;
        }

        .showcase-logo {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: white;
        }

        .showcase-logo span {
          color: #FF7C08;
        }

        .showcase-tagline {
          font-size: 1.5rem;
          font-weight: 600;
          color: #FF7C08;
          margin-bottom: 2rem;
        }

        .showcase-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2.5rem;
        }

        .showcase-features {
          list-style: none;
          margin-bottom: 2rem;
        }

        .showcase-features li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .showcase-features li:last-child {
          border-bottom: none;
        }

        .showcase-features i {
          color: #FF7C08;
          font-size: 1.5rem;
          width: 30px;
          text-align: center;
        }

        .showcase-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #FF7C08;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.3s;
        }

        .modal-close:hover {
          color: #FF7C08;
        }

        .modal-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        @media (max-width: 1024px) {
          .auth-container {
            grid-template-columns: 1fr;
          }
          .auth-showcase-section {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .auth-form-section {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="auth-container">
        {/* Left Side - Authentication Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h1>FLACRON<span>AI</span></h1>
              <p>AI-Powered Insurance Report Generator</p>
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="displayName">Full Name *</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="John Doe"
                    minLength="2"
                    maxLength="50"
                  />
                  <p className="form-help">Enter your full name (letters and spaces only)</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address {isLogin ? '' : '*'}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
                {!isLogin && <p className="form-help">You will receive a verification email</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password {isLogin ? '' : '*'}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder={isLogin ? 'Enter your password' : 'Strong password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
                {!isLogin && (
                  <p className="form-help">Must be 8+ characters with uppercase, lowercase, number, and special character</p>
                )}
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="passwordConfirm">Confirm Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="passwordConfirm"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      required={!isLogin}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <a
                  className="forgot-password-link"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </a>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/">Back to Home</Link>
            </div>

            {/* Security Badges */}
            <div className="security-badges">
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>Your data is safe with us</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>256-bit Encryption</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>Secure & Private</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                  </svg>
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - FlacronAI Showcase */}
        <div className="auth-showcase-section">
          <div className="showcase-content">
            <h1 className="showcase-logo">FLACRON<span>AI</span></h1>
            <p className="showcase-tagline">Transform Insurance Claims with AI</p>
            <p className="showcase-description">
              Revolutionary AI-powered platform that generates comprehensive insurance reports in seconds.
              Simplify your workflow, reduce processing time, and increase accuracy with intelligent automation.
            </p>

            <ul className="showcase-features">
              <li>
                <i className="fas fa-brain"></i>
                <span>Advanced AI Analysis for accurate claim assessment</span>
              </li>
              <li>
                <i className="fas fa-bolt"></i>
                <span>Generate reports in under 60 seconds</span>
              </li>
              <li>
                <i className="fas fa-file-pdf"></i>
                <span>Professional PDF reports with detailed insights</span>
              </li>
              <li>
                <i className="fas fa-shield-alt"></i>
                <span>Bank-level security & GDPR compliant</span>
              </li>
              <li>
                <i className="fas fa-chart-line"></i>
                <span>Real-time analytics and tracking dashboard</span>
              </li>
            </ul>

            <div className="showcase-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Reports Generated</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">60s</div>
                <div className="stat-label">Avg. Processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowForgotModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                &times;
              </button>
            </div>
            <p className="modal-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetSuccess && <div className="success-message">{resetSuccess}</div>}
            {resetError && <div className="error-message">{resetError}</div>}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" className="submit-btn" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;
