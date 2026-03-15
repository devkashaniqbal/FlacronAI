import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, Check, X, AlertTriangle, ExternalLink, Zap, Star, Users, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import TierBadge from '../components/TierBadge';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';

const TIER_INFO = {
  starter: {
    name: 'Starter', price: 0, icon: Zap, color: 'text-gray-600', bg: 'bg-gray-500/10',
    features: ['5 reports/month', 'PDF export', 'Basic AI generation', 'Email support', 'FlacronAI watermark on reports'],
  },
  professional: {
    name: 'Professional', price: 39.99, icon: Star, color: 'text-orange-400', bg: 'bg-orange-500/10',
    features: ['50 reports/month', 'No watermarks', 'PDF, DOCX, HTML export', 'GPT-4 Vision analysis', 'Priority email support'],
  },
  agency: {
    name: 'Agency', price: 99.99, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10',
    features: ['200 reports/month', 'Full CRM suite', 'API access', 'Client management', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise', price: 499, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10',
    features: ['Unlimited reports', 'White-label portal', 'Custom subdomain', 'Full API access', 'Dedicated support manager'],
  },
};

function CancelModal({ onConfirm, onClose, loading }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="card w-full max-w-sm p-6"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cancel Subscription?</h2>
          <p className="text-gray-600 text-sm">Your plan remains active until the end of the billing period. After that, your account reverts to the free Starter plan with 5 reports/month.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Keep Plan</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 text-sm py-2">
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SubscriptionContent() {
  const { tier, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const currentTierInfo = TIER_INFO[tier] || TIER_INFO.starter;
  const Icon = currentTierInfo.icon;

  const usagePercent = userProfile?.usage
    ? Math.round((userProfile.usage.reportsThisMonth / (userProfile.usage.monthlyLimit || 1)) * 100)
    : 0;

  useEffect(() => {
    paymentAPI.getSubscription()
      .then(res => setSubscription(res.data.subscription || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await paymentAPI.cancelSubscription();
      toast.success('Subscription cancelled. Active until end of billing period.');
      setShowCancelModal(false);
      await refreshProfile();
      const res = await paymentAPI.getSubscription();
      setSubscription(res.data.subscription || res.data);
    } catch {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your plan and usage</p>
      </motion.div>

      <div className="space-y-5">
        {/* Current Plan */}
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${currentTierInfo.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${currentTierInfo.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-900 font-bold text-lg">{currentTierInfo.name} Plan</h2>
                  <TierBadge tier={tier} />
                </div>
                {loading ? (
                  <div className="skeleton h-4 w-40 mt-1" />
                ) : (
                  <p className="text-gray-600 text-sm mt-0.5">
                    {subscription?.status === 'active'
                      ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : subscription?.status === 'canceled'
                        ? `Active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : tier === 'starter'
                          ? 'Free plan — no renewal'
                          : 'Subscription active'}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${currentTierInfo.price === 0 ? '0' : currentTierInfo.price}</p>
              {currentTierInfo.price > 0 && <p className="text-gray-600 text-xs">/month</p>}
            </div>
          </div>

          {/* Usage Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Reports this month</span>
              <span className="text-gray-900 font-medium">
                {userProfile?.usage?.reportsThisMonth || 0} / {userProfile?.usage?.monthlyLimit || 0}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {usagePercent >= 80 && (
              <p className="text-yellow-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> You have used {usagePercent}% of your monthly limit.
              </p>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {currentTierInfo.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-400 shrink-0" /> {f}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-[#e5e7eb]">
            {tier !== 'enterprise' && (
              <button onClick={() => navigate('/pricing')} className="btn-primary text-sm py-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Upgrade Plan
              </button>
            )}
            {tier !== 'starter' && subscription?.status === 'active' && (
              <button onClick={() => setShowCancelModal(true)} className="btn-danger text-sm py-2 flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel Subscription
              </button>
            )}
          </div>
        </motion.div>

        {/* Other Plans */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Compare Other Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(TIER_INFO).filter(([id]) => id !== tier).map(([id, info]) => {
              const TierIcon = info.icon;
              const isUpgrade = info.price > currentTierInfo.price;
              return (
                <div key={id} className="card p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${info.bg} flex items-center justify-center shrink-0`}>
                    <TierIcon className={`w-5 h-5 ${info.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-semibold">{info.name}</p>
                    <p className="text-gray-600 text-xs">{info.price === 0 ? 'Free' : `$${info.price}/mo`}</p>
                  </div>
                  <button onClick={() => navigate('/pricing')}
                    className={`text-xs py-1.5 px-3 whitespace-nowrap rounded-xl font-medium transition-all active:scale-95 ${
                      isUpgrade ? 'bg-orange-500 hover:bg-orange-600 text-gray-900' : 'bg-gray-100 hover:bg-gray-100 text-gray-700'}`}>
                    {isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-gray-500 text-xs mt-3">All plan changes take effect immediately. Visit the <button onClick={() => navigate('/pricing')} className="text-orange-400 underline">pricing page</button> for full details.</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <CancelModal
            onConfirm={handleCancel}
            onClose={() => setShowCancelModal(false)}
            loading={cancelLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Subscriptions() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#ffffff]">
        <Navbar />
        <SubscriptionContent />
      </div>
    </ProtectedRoute>
  );
}
