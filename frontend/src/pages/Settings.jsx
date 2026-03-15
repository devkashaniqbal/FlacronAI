import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Lock, Key, Bell, CreditCard, Upload, Eye, EyeOff, Plus,
  Trash2, Copy, Check, AlertTriangle, ExternalLink, Download, X,
  Shield, RefreshCw
} from 'lucide-react';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { usersAPI, paymentAPI } from '../services/api';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

function KeyModal({ apiKey, onClose }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="card w-full max-w-md p-6"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">API Key Created</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-sm">Copy this key now. It will never be shown again.</p>
        </div>
        <div className="bg-gray-200 rounded-xl p-3 font-mono text-sm text-orange-300 break-all mb-4">{apiKey}</div>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Key'}
          </button>
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
          <p className="text-gray-600 text-sm">Your plan will remain active until the end of the billing period. You will be moved to the Starter plan.</p>
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

export default function Settings() {
  const { userProfile, tier, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const logoInputRef = useRef();

  // Profile state
  const [profileForm, setProfileForm] = useState({ displayName: '', phone: '', company: '', address: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Security state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [creatingKey, setCreatingKey] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    reportGenerated: true, subscriptionRenewal: true, usageLimitWarning: true
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Billing state
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        address: userProfile.address || '',
      });
      setLogoPreview(userProfile.logoUrl || null);
      setNotifications(userProfile.notifications || { reportGenerated: true, subscriptionRenewal: true, usageLimitWarning: true });
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'api-keys' && ['agency', 'enterprise'].includes(tier)) fetchApiKeys();
    if (activeTab === 'billing') fetchBilling();
  }, [activeTab, tier]);

  const fetchApiKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await usersAPI.getApiKeys();
      const keys = res.data.apiKeys || res.data;
      setApiKeys(Array.isArray(keys) ? keys : []);
    } catch { toast.error('Failed to load API keys'); }
    finally { setKeysLoading(false); }
  };

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([paymentAPI.getSubscription(), paymentAPI.getInvoices()]);
      setSubscription(subRes.data.subscription || subRes.data);
      setInvoices(invRes.data.invoices || invRes.data || []);
    } catch { toast.error('Failed to load billing info'); }
    finally { setBillingLoading(false); }
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      await usersAPI.updateProfile(profileForm);
      if (logoFile) {
        const fd = new FormData(); fd.append('logo', logoFile);
        await usersAPI.uploadLogo(fd);
      }
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) { toast.error('Enter your current password'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.currentPassword === pwForm.newPassword) { toast.error('New password must be different from current password'); return; }
    setPwLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      // Check if user has a Google provider (no password)
      const hasEmailProvider = currentUser.providerData.some(p => p.providerId === 'password');
      if (!hasEmailProvider) {
        toast.error('Your account uses Google sign-in. Password change is not applicable.');
        return;
      }

      // Reauthenticate with current password to verify it
      const credential = EmailAuthProvider.credential(currentUser.email, pwForm.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Current password is valid — now update to new password
      await updatePassword(currentUser, pwForm.newPassword);

      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        toast.error('New password is too weak — use at least 8 characters');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error(err.message || 'Failed to change password');
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) { toast.error('Enter a name for the API key'); return; }
    setCreatingKey(true);
    try {
      const res = await usersAPI.createApiKey(newKeyName.trim());
      setCreatedKey(res.data.key || res.data.apiKey);
      setNewKeyName('');
      fetchApiKeys();
    } catch { toast.error('Failed to create API key'); }
    finally { setCreatingKey(false); }
  };

  const handleRevokeKey = async (keyId) => {
    try {
      await usersAPI.revokeApiKey(keyId);
      toast.success('API key revoked');
      fetchApiKeys();
    } catch { toast.error('Failed to revoke key'); }
  };

  const handleNotifSave = async () => {
    setNotifSaving(true);
    try {
      await usersAPI.updateProfile({ notifications });
      toast.success('Notification settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setNotifSaving(false); }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await paymentAPI.cancelSubscription();
      toast.success('Subscription cancelled. Your plan remains active until the period ends.');
      setShowCancelModal(false);
      fetchBilling();
    } catch { toast.error('Failed to cancel subscription'); }
    finally { setCancelLoading(false); }
  };

  const usagePercent = userProfile?.usage
    ? Math.round((userProfile.usage.reportsThisMonth / (userProfile.usage.monthlyLimit || 1)) * 100)
    : 0;

  const filteredTabs = TABS;

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your account preferences and configuration</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <aside className="md:w-48 shrink-0">
            <nav className="flex md:flex-col gap-1">
              {filteredTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
                    activeTab === tab.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e5e7eb]">
                      <div className="relative">
                        {logoPreview
                          ? <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
                          : <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400">
                              {(profileForm.displayName || 'U')[0].toUpperCase()}
                            </div>}
                      </div>
                      <div>
                        <button onClick={() => logoInputRef.current?.click()} className="btn-secondary text-sm py-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Upload Logo
                        </button>
                        <p className="text-gray-500 text-xs mt-1.5">PNG, JPG up to 2MB</p>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {[
                        { key: 'displayName', label: 'Display Name', placeholder: 'Your name' },
                        { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
                        { key: 'company', label: 'Company Name', placeholder: 'Your company' },
                        { key: 'address', label: 'Business Address', placeholder: 'Your address' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="label">{f.label}</label>
                          <input className="input" placeholder={f.placeholder}
                            value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <button onClick={handleProfileSave} disabled={profileLoading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                      {[
                        { key: 'currentPassword', label: 'Current Password', show: 'current' },
                        { key: 'newPassword', label: 'New Password', show: 'new' },
                        { key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="label">{f.label}</label>
                          <div className="relative">
                            <input type={showPw[f.show] ? 'text' : 'password'} className="input pr-10"
                              value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                            <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.show]: !p[f.show] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                              {showPw[f.show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                        {pwLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api-keys' && (
                <motion.div key="api-keys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {!['agency', 'enterprise'].includes(tier) ? (
                    <div className="card p-10 text-center">
                      <Key className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-gray-900 font-semibold mb-2">API Access Requires Agency Plan</h3>
                      <p className="text-gray-600 text-sm mb-4">Upgrade to Agency or Enterprise to create API keys.</p>
                      <button onClick={() => navigate('/pricing')} className="btn-primary text-sm py-2 px-6">View Plans</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create API Key</h2>
                        <div className="flex gap-3">
                          <input className="input flex-1" placeholder="Key name (e.g. Production App)"
                            value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                          <button onClick={handleCreateKey} disabled={creatingKey} className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                            <Plus className="w-4 h-4" /> {creatingKey ? 'Creating...' : 'Create Key'}
                          </button>
                        </div>
                      </div>
                      <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active API Keys</h2>
                        {keysLoading ? (
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
                          </div>
                        ) : apiKeys.length === 0 ? (
                          <div className="text-center py-8">
                            <Key className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">No API keys yet. Create one above.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {apiKeys.map(key => (
                              <div key={key._id || key.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-100 border border-gray-200">
                                <div>
                                  <p className="text-gray-900 text-sm font-medium">{key.name}</p>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-gray-500 text-xs">Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                    {key.lastUsed && <span className="text-gray-500 text-xs">Last used {new Date(key.lastUsed).toLocaleDateString()}</span>}
                                    {key.usageCount !== undefined && <span className="text-gray-500 text-xs">{key.usageCount} calls</span>}
                                  </div>
                                </div>
                                <button onClick={() => handleRevokeKey(key._id || key.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Revoke">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Notifications</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'reportGenerated', label: 'Report Generated', desc: 'Receive an email when your report is ready' },
                        { key: 'subscriptionRenewal', label: 'Subscription Renewal', desc: 'Get notified 7 days before your plan renews' },
                        { key: 'usageLimitWarning', label: 'Usage Limit Warning', desc: 'Alert when you reach 80% of your monthly limit' },
                      ].map(n => (
                        <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-100 border border-gray-200">
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{n.label}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{n.desc}</p>
                          </div>
                          <button onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))}
                            className={`relative w-10 h-5 rounded-full transition-colors ${notifications[n.key] ? 'bg-orange-500' : 'bg-gray-200'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${notifications[n.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleNotifSave} disabled={notifSaving} className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50">
                      {notifSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {notifSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="space-y-4">
                    <div className="card p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                      {billingLoading ? (
                        <div className="space-y-3"><div className="skeleton h-8 w-32" /><div className="skeleton h-4 w-full" /></div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-gray-900 font-semibold capitalize text-xl">{tier} Plan</p>
                              {subscription && <p className="text-gray-600 text-sm mt-1">
                                {subscription.status === 'active' ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : `Status: ${subscription.status}`}
                              </p>}
                            </div>
                            <button onClick={() => navigate('/pricing')} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" /> Change Plan
                            </button>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                              <span>Monthly Reports Used</span>
                              <span>{userProfile?.usage?.reportsThisMonth || 0} / {userProfile?.usage?.monthlyLimit || 0}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                            </div>
                          </div>
                          {tier !== 'starter' && subscription?.status === 'active' && (
                            <button onClick={() => setShowCancelModal(true)} className="btn-danger text-sm py-2 mt-4 flex items-center gap-2">
                              <X className="w-4 h-4" /> Cancel Subscription
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="card p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h2>
                      {billingLoading ? (
                        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
                      ) : invoices.length === 0 ? (
                        <div className="text-center py-8">
                          <CreditCard className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">No invoices yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#e5e7eb]">
                                {['Date', 'Amount', 'Status', 'Download'].map(h => (
                                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {invoices.map(inv => (
                                <tr key={inv.id} className="border-b border-[#e5e7eb]">
                                  <td className="px-3 py-3 text-sm text-gray-700">{new Date(inv.date).toLocaleDateString()}</td>
                                  <td className="px-3 py-3 text-sm text-gray-900 font-medium">${(inv.amount / 100).toFixed(2)}</td>
                                  <td className="px-3 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    {inv.pdfUrl && (
                                      <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-gray-100 rounded-lg inline-flex" title="Download PDF">
                                        <Download className="w-4 h-4 text-gray-600" />
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {createdKey && <KeyModal apiKey={createdKey} onClose={() => setCreatedKey(null)} />}
        {showCancelModal && (
          <CancelModal
            onConfirm={handleCancelSubscription}
            onClose={() => setShowCancelModal(false)}
            loading={cancelLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
