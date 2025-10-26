import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/notifications';
import { showToast } from '../utils/uxEnhancements';
import '../styles/styles.css';
import '../styles/modern-enhancements.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Checkout = () => {
  const { user, token } = useAuth();
  // const navigate = useNavigate(); // Removed unused variable
  const [currentTier, setCurrentTier] = useState('starter');
  const [currentTierName, setCurrentTierName] = useState('Loading...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentTier();

    // Check if returning from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      verifyCheckoutSession(sessionId);
    }
  }, []);

  const verifyCheckoutSession = async (sessionId) => {
    try {
      showToast('Activating your subscription...', 'info');

      const response = await fetch(`${API_BASE_URL}/payment/verify-session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        showNotification(`Successfully upgraded to ${result.tier} tier!`, 'success');
        showToast(`Successfully upgraded to ${result.tier} tier!`, 'success');

        // Refresh tier info
        setTimeout(() => {
          fetchCurrentTier();
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 1500);
      }
    } catch (error) {
      console.error('Verify checkout error:', error);
    }
  };

  const fetchCurrentTier = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setCurrentTier(result.usage.tier);
        setCurrentTierName(result.usage.tierName);
      }
    } catch (error) {
      console.error('Failed to fetch current tier:', error);
    }
  };

  const handlePlanSelection = async (selectedTier, priceId) => {
    if (selectedTier === currentTier) {
      showNotification('This is your current plan', 'info');
      showToast('This is your current plan', 'info');
      return;
    }

    setLoading(true);

    // Check if it's a free plan (Starter)
    if (selectedTier === 'starter') {
      if (window.confirm('Are you sure you want to downgrade to the Starter plan? You will lose access to premium features.')) {
        await downgradePlan(selectedTier);
      }
      setLoading(false);
      return;
    }

    // For paid plans, redirect to Stripe checkout
    await initiateCheckout(selectedTier, priceId);
    setLoading(false);
  };

  const downgradePlan = async (tier) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newTier: tier })
      });

      const result = await response.json();

      if (result.success) {
        showNotification('Successfully downgraded to Starter plan', 'success');
        showToast('Successfully downgraded to Starter plan', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to downgrade plan');
      }
    } catch (error) {
      console.error('Downgrade error:', error);
      showNotification(error.message, 'error');
      showToast(error.message, 'error');
    }
  };

  const initiateCheckout = async (tier, priceId) => {
    try {
      showNotification('Redirecting to secure checkout...', 'info');
      showToast('Redirecting to secure checkout...', 'info');

      const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tier,
          priceId: priceId,
          userId: user?.uid
        })
      });

      const result = await response.json();

      if (result.success && result.url) {
        showToast('Redirecting to payment...', 'success');
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);

      if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
        const message = 'Payment integration coming soon! For now, contact support@flacronenterprises.com to upgrade.';
        showNotification(message, 'info');
        showToast('Payment integration coming soon!', 'info');
      } else {
        showNotification(error.message, 'error');
        showToast(error.message, 'error');
      }
    }
  };

  const getTierButton = (tier) => {
    const tierOrder = { starter: 0, professional: 1, agency: 2, enterprise: 3 };

    if (tier === currentTier) {
      return (
        <button className="select-plan-btn current-plan" disabled>
          Current Plan
        </button>
      );
    } else if (tierOrder[tier] < tierOrder[currentTier]) {
      return (
        <button
          className="select-plan-btn"
          onClick={() => handlePlanSelection(tier, `price_${tier}`)}
          disabled={loading}
        >
          Downgrade
        </button>
      );
    } else {
      return (
        <button
          className="select-plan-btn"
          onClick={() => handlePlanSelection(tier, `price_${tier}`)}
          disabled={loading}
        >
          Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </button>
      );
    }
  };

  return (
    <div className="checkout-container">
      <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>

      <div className="checkout-header">
        <h1>Upgrade Your Plan</h1>
        <p>Choose the perfect plan for your needs</p>
      </div>

      <div className="current-plan-banner">
        <h3>Your Current Plan</h3>
        <p className="current-tier">{currentTierName}</p>
      </div>

      <div className="pricing-grid">
        {/* Starter Plan */}
        <div className={`pricing-card ${currentTier === 'starter' ? 'current' : ''}`} data-tier="starter">
          {currentTier === 'starter' && <span className="current-badge">CURRENT PLAN</span>}
          <div className="tier-name">Starter <span className="free-badge">FREE</span></div>
          <div className="tier-price">
            <span className="currency">$</span>0<span className="period">/month</span>
          </div>
          <p className="tier-description">Perfect for trying out the service</p>

          <ul className="features-list">
            <li>1 report per month</li>
            <li>All report types</li>
            <li>PDF export</li>
            <li>HTML export</li>
            <li className="unavailable">DOCX export</li>
            <li className="unavailable">Custom logo</li>
            <li className="unavailable">Photo upload</li>
            <li className="unavailable">Priority support</li>
          </ul>

          {getTierButton('starter')}
        </div>

        {/* Professional Plan */}
        <div className={`pricing-card featured ${currentTier === 'professional' ? 'current' : ''}`} data-tier="professional">
          <span className="featured-badge">MOST POPULAR</span>
          {currentTier === 'professional' && <span className="current-badge">CURRENT PLAN</span>}
          <div className="tier-name">Professional</div>
          <div className="tier-price">
            <span className="currency">$</span>39.99<span className="period">/month</span>
          </div>
          <p className="tier-description">For individual professionals and adjusters</p>

          <ul className="features-list">
            <li>20 reports per month</li>
            <li>All report types</li>
            <li>PDF, DOCX & HTML export</li>
            <li>No watermark</li>
            <li>Custom logo support</li>
            <li>Photo upload (5 per report)</li>
            <li>AI photo analysis</li>
            <li>Email support</li>
          </ul>

          {getTierButton('professional')}
        </div>

        {/* Agency Plan */}
        <div className={`pricing-card ${currentTier === 'agency' ? 'current' : ''}`} data-tier="agency">
          {currentTier === 'agency' && <span className="current-badge">CURRENT PLAN</span>}
          <div className="tier-name">Agency</div>
          <div className="tier-price">
            <span className="currency">$</span>99.99<span className="period">/month</span>
          </div>
          <p className="tier-description">For small agencies and teams</p>

          <ul className="features-list">
            <li>100 reports per month</li>
            <li>Up to 5 user accounts</li>
            <li>All export formats</li>
            <li>Agency dashboard</li>
            <li>Custom branding</li>
            <li>Photo upload (10 per report)</li>
            <li>AI photo analysis</li>
            <li>Priority email support</li>
          </ul>

          {getTierButton('agency')}
        </div>

        {/* Enterprise Plan */}
        <div className={`pricing-card ${currentTier === 'enterprise' ? 'current' : ''}`} data-tier="enterprise">
          {currentTier === 'enterprise' && <span className="current-badge">CURRENT PLAN</span>}
          <div className="tier-name">Enterprise</div>
          <div className="tier-price">
            <span className="currency">$</span>499<span className="period">/month</span>
          </div>
          <p className="tier-description">For large enterprises and insurance companies</p>

          <ul className="features-list">
            <li>Unlimited reports</li>
            <li>Unlimited users</li>
            <li>API access</li>
            <li>White-label portal</li>
            <li>Custom integration</li>
            <li>Unlimited photo uploads</li>
            <li>Advanced AI features</li>
            <li>Dedicated support</li>
          </ul>

          {getTierButton('enterprise')}
        </div>
      </div>

      <div className="checkout-footer">
        <h3>All plans include:</h3>
        <p>
          <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i> AI-powered report generation using Google Gemini<br/>
          <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i> Professional insurance report templates<br/>
          <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i> Secure cloud storage<br/>
          <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i> Regular updates and improvements<br/>
          <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i> 30-day money-back guarantee (paid plans)
        </p>

        <div className="payment-methods">
          <div className="payment-method"><i className="fas fa-credit-card"></i> Credit Card</div>
          <div className="payment-method"><i className="fas fa-credit-card"></i> Debit Card</div>
          <div className="payment-method"><i className="fas fa-lock"></i> Secure Payment</div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
