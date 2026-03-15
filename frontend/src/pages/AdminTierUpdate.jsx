import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, CheckCircle, AlertCircle, Crown, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import TierBadge from '../components/TierBadge';
import { salesAPI } from '../services/api';

const TIER_OPTIONS = [
  { value: 'starter', label: 'Starter', desc: 'Free — 5 reports/month' },
  { value: 'professional', label: 'Professional', desc: '$39.99/mo — 50 reports' },
  { value: 'agency', label: 'Agency', desc: '$99.99/mo — 200 reports + CRM' },
  { value: 'enterprise', label: 'Enterprise', desc: '$499/mo — Unlimited + White-label' },
];

export default function AdminTierUpdate() {
  const [email, setEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLookupLoading(true);
    setFoundUser(null);
    setLookupError(null);
    setSuccessMsg('');
    setSelectedTier('');
    try {
      const res = await salesAPI.updateUserTier(email.trim(), null);
      if (res.data?.user) {
        setFoundUser(res.data.user);
        setSelectedTier(res.data.user.tier || 'starter');
      } else {
        setLookupError('User not found with that email address.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setLookupError('No account found with that email address.');
      } else {
        setLookupError(err.response?.data?.message || 'Lookup failed. Please try again.');
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleUpdateTier = async () => {
    if (!foundUser || !selectedTier) return;
    setUpdateLoading(true);
    setSuccessMsg('');
    try {
      await salesAPI.updateUserTier(foundUser.email, selectedTier);
      setSuccessMsg(`Successfully updated ${foundUser.email} to the ${selectedTier} tier.`);
      setFoundUser(prev => ({ ...prev, tier: selectedTier }));
      toast.success(`Tier updated to ${selectedTier}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tier');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin — Tier Management</h1>
              <p className="text-gray-600 text-sm">Update user subscription tiers manually</p>
            </div>
          </div>

          {/* Lookup Form */}
          <div className="card p-6 mb-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Look Up User</h2>
            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" className="input pl-10" placeholder="Enter user email address"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={lookupLoading || !email.trim()} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                {lookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Look Up
              </button>
            </form>

            {lookupError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{lookupError}</p>
              </motion.div>
            )}
          </div>

          {/* User Info */}
          {foundUser && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-[#e5e7eb]">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-xl font-bold text-orange-400">
                  {(foundUser.displayName || foundUser.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">{foundUser.displayName || 'No display name'}</p>
                  <p className="text-gray-600 text-sm">{foundUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 block mb-1">Current Tier</span>
                  <TierBadge tier={foundUser.tier || 'starter'} />
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Account Created</span>
                  <p className="text-gray-900">
                    {foundUser.createdAt
                      ? new Date(foundUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—'}
                  </p>
                </div>
                {foundUser.usage && (
                  <>
                    <div>
                      <span className="text-gray-600 block mb-1">Reports This Month</span>
                      <p className="text-gray-900">{foundUser.usage.reportsThisMonth || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Total Reports</span>
                      <p className="text-gray-900">{foundUser.usage.totalReports || 0}</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="label">Select New Tier</label>
                <div className="space-y-2">
                  {TIER_OPTIONS.map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTier === opt.value ? 'border-orange-500/50 bg-orange-500/10' : 'border-gray-200 bg-gray-100 hover:bg-gray-100'}`}>
                      <input type="radio" name="tier" value={opt.value} checked={selectedTier === opt.value}
                        onChange={() => setSelectedTier(opt.value)} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedTier === opt.value ? 'border-orange-500' : 'border-gray-600'}`}>
                        {selectedTier === opt.value && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-medium">{opt.label}</p>
                        <p className="text-gray-600 text-xs">{opt.desc}</p>
                      </div>
                      <TierBadge tier={opt.value} />
                    </label>
                  ))}
                </div>
              </div>

              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <p className="text-green-300 text-sm">{successMsg}</p>
                </motion.div>
              )}

              <button
                onClick={handleUpdateTier}
                disabled={updateLoading || !selectedTier || selectedTier === foundUser.tier}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                {updateLoading ? 'Updating...' : selectedTier === foundUser.tier ? 'Already on this tier' : `Update to ${selectedTier} Tier`}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
