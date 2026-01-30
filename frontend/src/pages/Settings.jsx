import React, { useState, useEffect } from 'react';
import { useNavigate, useNavigate as useHookNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Key,
  Shield,
  CreditCard,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight,
  Crown,
  Palette,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { showNotification } from '../utils/notifications';
import '../styles/command-center.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Settings() {
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState('');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [apiAccess, setApiAccess] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [loadingKeys, setLoadingKeys] = useState(false);

  useEffect(() => {
    document.title = 'Settings | FlacronAI';
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'api-keys' && user) {
      fetchApiAccess();
      fetchApiKeys();
    }
  }, [activeTab, user]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : '');
  };

  const getAuthToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    showNotification(text, type);
  };

  // Profile Functions
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/update-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName: displayName.trim() })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Name updated successfully');
      } else {
        showMessage('error', data.error || 'Failed to update name');
      }
    } catch (error) {
      showMessage('error', 'Error updating name');
    } finally {
      setLoading(false);
    }
  };

  // Password Functions
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Password changed successfully');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showMessage('error', data.error || 'Failed to change password');
      }
    } catch (error) {
      showMessage('error', 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  // API Keys Functions
  const fetchApiAccess = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/api-access`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setApiAccess(data.apiAccess);
      }
    } catch (error) {
      console.error('Error fetching API access:', error);
    }
  };

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/api-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.keys || []);
      } else if (data.code === 'NO_API_ACCESS') {
        setApiKeys([]);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showMessage('error', 'Please enter a name for your API key');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newKeyName.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setNewlyCreatedKey(data.apiKey);
        setNewKeyName('');
        fetchApiKeys();
        showMessage('success', 'API key created! Copy it now - it won\'t be shown again.');
      } else {
        showMessage('error', data.error || 'Failed to create API key');
      }
    } catch (error) {
      showMessage('error', 'Error creating API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'API key revoked successfully');
        fetchApiKeys();
      } else {
        showMessage('error', data.error || 'Failed to revoke API key');
      }
    } catch (error) {
      showMessage('error', 'Error revoking API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, keyId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
      showNotification('Copied to clipboard', 'info');
    } catch (error) {
      showMessage('error', 'Failed to copy to clipboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="cc-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--cc-accent)" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="cc-layout">
      {/* Mobile Overlay */}
      <div
        className={`cc-mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar - Same as Dashboard */}
      <aside className={`cc-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="cc-sidebar-header">
          <h1>FLACRON<span>AI</span></h1>
          <button className="cc-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <ChevronLeft size={16} style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        <nav className="cc-nav">
          <div className="cc-nav-section">
            <div className="cc-nav-label">Main</div>
            <button className="cc-nav-item" onClick={() => navigate('/dashboard#generate')}>
              <Plus size={20} className="cc-nav-icon" />
              <span className="cc-nav-text">New Report</span>
            </button>
            <button className="cc-nav-item" onClick={() => navigate('/dashboard#my-reports')}>
              <LayoutDashboard size={20} className="cc-nav-icon" />
              <span className="cc-nav-text">My Reports</span>
            </button>
          </div>

          <div className="cc-nav-section">
            <div className="cc-nav-label">Account</div>
            <button className="cc-nav-item" onClick={() => navigate('/dashboard#usage')}>
              <CreditCard size={20} className="cc-nav-icon" />
              <span className="cc-nav-text">Usage & Billing</span>
            </button>
            <button className="cc-nav-item" onClick={() => navigate('/dashboard#upgrade')}>
              <Crown size={20} className="cc-nav-icon" />
              <span className="cc-nav-text">Upgrade Plan</span>
            </button>
            <button className="cc-nav-item active">
              <SettingsIcon size={20} className="cc-nav-icon" />
              <span className="cc-nav-text">Settings</span>
            </button>
          </div>
        </nav>

        <div className="cc-sidebar-footer">
          <div className="cc-user-info" onClick={handleLogout}>
            <div className="cc-user-avatar">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="cc-user-details">
              <div className="cc-user-name">{user?.displayName || 'User'}</div>
              <div className="cc-user-plan">{userProfile?.tierName || 'Starter'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="cc-main">
        <header className="cc-header">
          <div className="cc-header-left">
            <button className="cc-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={20} />
            </button>
            <div className="cc-breadcrumb">
              <span className="cc-breadcrumb-item">Dashboard</span>
              <span className="cc-breadcrumb-separator">/</span>
              <span className="cc-breadcrumb-current">Settings</span>
            </div>
          </div>

          <div className="cc-header-right">
            <button className="cc-theme-toggle" onClick={toggleDarkMode} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="cc-content">
          <div className="cc-page-header">
            <h1 className="cc-page-title">Settings</h1>
            <p className="cc-page-subtitle">Manage your account settings and preferences</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Settings Sidebar Tabs */}
            <div className="cc-card">
              <div className="cc-card-body" style={{ padding: '0.5rem' }}>
                {settingsTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`cc-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ marginBottom: '0.25rem' }}
                  >
                    <tab.icon size={18} className="cc-nav-icon" />
                    <span className="cc-nav-text">{tab.label}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: activeTab === tab.id ? 1 : 0.3 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Tab Content */}
            <div className="cc-card">
              <div className="cc-card-body" style={{ padding: '2rem' }}>
                {activeTab === 'profile' && (
                  <div className="cc-form-section">
                    <h3 className="cc-form-section-title">Profile Settings</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cc-text-secondary)', marginBottom: '1.5rem' }}>Update your personal information</p>

                    <form onSubmit={handleUpdateName} style={{ maxWidth: '480px' }}>
                      <div className="cc-form-group">
                        <label className="cc-form-label">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="cc-form-input"
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted)', marginTop: '0.5rem' }}>Email cannot be changed</p>
                      </div>

                      <div className="cc-form-group">
                        <label className="cc-form-label">Display Name</label>
                        <input
                          type="text"
                          className="cc-form-input"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </div>

                      <div className="cc-form-group">
                        <label className="cc-form-label">Current Plan</label>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          background: 'var(--cc-accent-subtle)',
                          color: 'var(--cc-accent)',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {(userProfile?.tier || 'STARTER').toUpperCase()}
                        </div>
                      </div>

                      <button type="submit" className="cc-btn cc-btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="cc-form-section">
                    <h3 className="cc-form-section-title">Security Settings</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cc-text-secondary)', marginBottom: '1.5rem' }}>Manage your password and security preferences</p>

                    <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
                      <div className="cc-form-group">
                        <label className="cc-form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="cc-form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            minLength={6}
                            style={{ paddingRight: '2.5rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--cc-text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="cc-form-group">
                        <label className="cc-form-label">Confirm New Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="cc-form-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          minLength={6}
                        />
                      </div>

                      <button type="submit" className="cc-btn cc-btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Change Password'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'api-keys' && (
                  <div className="cc-form-section">
                    <h3 className="cc-form-section-title">API Keys</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cc-text-secondary)', marginBottom: '1.5rem' }}>Manage your API keys for programmatic access</p>

                    {apiAccess && !apiAccess.hasAccess ? (
                      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--cc-bg)', borderRadius: '12px', border: '1px solid var(--cc-border)' }}>
                        <Lock size={48} color="var(--cc-text-muted)" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ color: 'var(--cc-text-primary)', marginBottom: '0.5rem' }}>API Access Not Available</h4>
                        <p style={{ color: 'var(--cc-text-secondary)', marginBottom: '1.5rem' }}>Upgrade to a Professional or higher plan to access our API.</p>
                        <button className="cc-btn cc-btn-primary" onClick={() => navigate('/dashboard#upgrade')}>Upgrade Now</button>
                      </div>
                    ) : (
                      <>
                        {newlyCreatedKey && (
                          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '12px', marginBottom: '1.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                              <AlertCircle size={20} color="#22c55e" />
                              <div>
                                <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>Save your API key now!</strong>
                                <p style={{ fontSize: '0.8125rem', color: '#166534', marginBottom: '0.75rem' }}>This key will only be shown once. Copy it and store it securely.</p>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                  <code style={{ fontSize: '0.875rem', color: '#166534', wordBreak: 'break-all' }}>{newlyCreatedKey}</code>
                                  <button onClick={() => copyToClipboard(newlyCreatedKey, 'new')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>
                                    {copiedKeyId === 'new' ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setNewlyCreatedKey(null)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: '1.25rem' }}>&times;</button>
                          </div>
                        )}

                        <form onSubmit={handleCreateApiKey} style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                              type="text"
                              className="cc-form-input"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                              placeholder="Key Name (e.g. Production)"
                            />
                            <button type="submit" className="cc-btn cc-btn-primary" disabled={loading}>
                              <Plus size={18} />
                              <span>Create Key</span>
                            </button>
                          </div>
                        </form>

                        <div className="cc-reports-list">
                          {loadingKeys ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                          ) : apiKeys.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cc-text-muted)' }}>No API keys created yet.</div>
                          ) : (
                            apiKeys.map(key => (
                              <div key={key.keyId} className="cc-report-item" style={{ opacity: key.isActive ? 1 : 0.5 }}>
                                <div className="cc-report-icon"><Key size={20} /></div>
                                <div className="cc-report-info">
                                  <div className="cc-report-title">{key.name}</div>
                                  <div className="cc-report-meta">
                                    <code>{key.keyPreview}</code>
                                    <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="cc-report-actions" style={{ opacity: 1 }}>
                                  {key.isActive ? (
                                    <button className="cc-btn cc-btn-ghost" onClick={() => handleRevokeKey(key.keyId)} title="Revoke Key" style={{ color: '#ef4444' }}>
                                      <Trash2 size={18} />
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Revoked</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="cc-form-section">
                    <h3 className="cc-form-section-title">Billing & Subscription</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cc-text-secondary)', marginBottom: '1.5rem' }}>Manage your subscription and billing information</p>

                    <div style={{ background: 'var(--cc-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--cc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--cc-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Current Plan</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--cc-text-primary)' }}>{(userProfile?.tier || 'STARTER').toUpperCase()}</span>
                          {userProfile?.tier !== 'starter' && <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '20px' }}>Active</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="cc-btn cc-btn-primary" onClick={() => navigate('/dashboard#upgrade')}>Upgrade</button>
                        <button className="cc-btn cc-btn-secondary" onClick={() => navigate('/dashboard#usage')}>History</button>
                      </div>
                    </div>

                    {userProfile?.tier === 'enterprise' && (
                      <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid var(--cc-accent)', borderRadius: '12px', background: 'var(--cc-accent-subtle)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--cc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <Palette size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--cc-text-primary)' }}>White Label Portal</h4>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--cc-text-secondary)' }}>Configure your own branding and domains.</p>
                        </div>
                        <button className="cc-btn cc-btn-primary" onClick={() => navigate('/white-label')}>Configure</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
