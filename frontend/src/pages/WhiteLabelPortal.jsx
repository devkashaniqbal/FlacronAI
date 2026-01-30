import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/command-center.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function WhiteLabelPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  // Command Center State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // White Label Settings State
  const [settings, setSettings] = useState({
    companyName: '',
    logo: null,
    logoPreview: '',
    favicon: null,
    faviconPreview: '',
    primaryColor: '#FF7C08',
    secondaryColor: '#FF9A3C',
    accentColor: '#0f172a',
    customDomain: '',
    domainVerified: false,
    subdomain: '',
    emailFromName: '',
    emailFromAddress: '',
    emailFooterText: '',
    removeBranding: true,
    customLoginPage: true,
    customDashboard: true,
    teamMembers: []
  });

  const [newMember, setNewMember] = useState({ email: '', role: 'viewer' });
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    document.title = 'White Label Portal | FlacronAI';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    loadSettings();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setShowShortcuts(false);
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key) {
          case '1': e.preventDefault(); setActiveTab('branding'); break;
          case '2': e.preventDefault(); setActiveTab('domain'); break;
          case '3': e.preventDefault(); setActiveTab('email'); break;
          case '4': e.preventDefault(); setActiveTab('team'); break;
          case '5': e.preventDefault(); setActiveTab('advanced'); break;
          case 's': e.preventDefault(); handleSave(); break;
        }
      }
      if (e.key === '?' && !commandPaletteOpen) {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : '');
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/white-label/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.keys(settings).forEach(key => {
        if (key === 'logo' || key === 'favicon') {
          if (settings[key] instanceof File) formData.append(key, settings[key]);
        } else if (key === 'teamMembers') {
          formData.append(key, JSON.stringify(settings[key]));
        } else if (key !== 'logoPreview' && key !== 'faviconPreview') {
          formData.append(key, settings[key]);
        }
      });
      const response = await fetch(`${API_BASE_URL}/white-label/settings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, logo: file, logoPreview: URL.createObjectURL(file) }));
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, favicon: file, faviconPreview: URL.createObjectURL(file) }));
    }
  };

  const addTeamMember = () => {
    if (newMember.email && newMember.email.includes('@')) {
      setSettings(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { ...newMember, id: Date.now(), status: 'pending' }]
      }));
      setNewMember({ email: '', role: 'viewer' });
      setShowAddMember(false);
    }
  };

  const removeTeamMember = (id) => {
    setSettings(prev => ({ ...prev, teamMembers: prev.teamMembers.filter(m => m.id !== id) }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const commandItems = [
    { id: 'branding', title: 'Branding', desc: 'Logo, colors, company info', icon: 'palette', shortcut: ['Ctrl', '1'], action: () => setActiveTab('branding') },
    { id: 'domain', title: 'Domain', desc: 'Custom domain settings', icon: 'globe', shortcut: ['Ctrl', '2'], action: () => setActiveTab('domain') },
    { id: 'email', title: 'Email Templates', desc: 'Customize email branding', icon: 'mail', shortcut: ['Ctrl', '3'], action: () => setActiveTab('email') },
    { id: 'team', title: 'Team Management', desc: 'Manage team members', icon: 'users', shortcut: ['Ctrl', '4'], action: () => setActiveTab('team') },
    { id: 'advanced', title: 'Advanced', desc: 'API and advanced settings', icon: 'settings', shortcut: ['Ctrl', '5'], action: () => setActiveTab('advanced') },
    { id: 'save', title: 'Save Changes', desc: 'Save all settings', icon: 'save', shortcut: ['Ctrl', 'S'], action: handleSave },
    { id: 'preview', title: 'Toggle Preview', desc: 'Show/hide live preview', icon: 'eye', action: () => setShowPreview(!showPreview) },
    { id: 'dashboard', title: 'Back to Dashboard', desc: 'Return to main dashboard', icon: 'home', action: () => navigate('/dashboard') },
  ];

  const filteredCommands = commandItems.filter(item =>
    item.title.toLowerCase().includes(commandSearch.toLowerCase()) ||
    item.desc.toLowerCase().includes(commandSearch.toLowerCase())
  );

  if (!user || (user.tier !== 'enterprise' && user.subscription?.tier !== 'enterprise')) {
    return (
      <div className="cc-layout">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cc-bg)' }}>
          <div className="cc-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #FF7C08, #FF9A3C)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--cc-text-primary)', marginBottom: '0.5rem' }}>Enterprise Feature</h1>
            <p style={{ color: 'var(--cc-text-muted)', marginBottom: '1.5rem' }}>The White Label Portal is exclusively available for Enterprise plan subscribers.</p>
            <button className="cc-btn cc-btn-primary" onClick={() => navigate('/pricing')}>
              Upgrade to Enterprise
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-layout">
      <div className={`cc-mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <aside className={`cc-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="cc-sidebar-header">
          <h1>WHITE<span>LABEL</span></h1>
          <button className="cc-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>

        <nav className="cc-nav">
          <div className="cc-nav-section">
            <div className="cc-nav-label">Configuration</div>
            <button className={`cc-nav-item ${activeTab === 'branding' ? 'active' : ''}`} onClick={() => setActiveTab('branding')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              <span className="cc-nav-text">Branding</span>
              <span className="cc-shortcut-hint">1</span>
            </button>
            <button className={`cc-nav-item ${activeTab === 'domain' ? 'active' : ''}`} onClick={() => setActiveTab('domain')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              <span className="cc-nav-text">Domain</span>
              <span className="cc-shortcut-hint">2</span>
            </button>
            <button className={`cc-nav-item ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
              <span className="cc-nav-text">Email Templates</span>
              <span className="cc-shortcut-hint">3</span>
            </button>
            <button className={`cc-nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              <span className="cc-nav-text">Team</span>
              <span className="cc-shortcut-hint">4</span>
            </button>
            <button className={`cc-nav-item ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
              <span className="cc-nav-text">Advanced</span>
              <span className="cc-shortcut-hint">5</span>
            </button>
          </div>

          <div className="cc-nav-section">
            <div className="cc-nav-label">Actions</div>
            <button className="cc-nav-item" onClick={() => navigate('/dashboard')}>
              <svg className="cc-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>
              <span className="cc-nav-text">Dashboard</span>
            </button>
          </div>
        </nav>

        <div className="cc-sidebar-footer">
          <button className="cc-btn cc-btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={handleSave} disabled={loading}>
            {loading ? (
              <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Saving...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg> Save Changes</>
            )}
          </button>
          {saveStatus && (
            <div style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center', background: saveStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: saveStatus === 'success' ? '#22c55e' : '#ef4444' }}>
              {saveStatus === 'success' ? 'Saved successfully!' : 'Error saving'}
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="cc-main">
        <header className="cc-header">
          <div className="cc-header-left">
            <button className="cc-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <div className="cc-breadcrumb">
              <span className="cc-breadcrumb-item">White Label</span>
              <span className="cc-breadcrumb-separator">/</span>
              <span className="cc-breadcrumb-current">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>
          <div className="cc-header-right">
            <button className="cc-cmd-trigger" onClick={() => setCommandPaletteOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <span>Search commands...</span>
              <div className="cc-cmd-shortcut"><kbd>Ctrl</kbd><kbd>K</kbd></div>
            </button>
            <button className="cc-btn cc-btn-secondary" onClick={() => setShowPreview(!showPreview)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button className="cc-theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>
          </div>
        </header>

        <div className="cc-content-wrapper">
          <div className="cc-content" style={{ flex: showPreview ? '1' : '1' }}>
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <>
                <div className="cc-page-header">
                  <h1 className="cc-page-title">Branding Settings</h1>
                  <p className="cc-page-subtitle">Customize your portal's look and feel</p>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Company Information</h2></div>
                  <div className="cc-card-body">
                    <div className="cc-form-group">
                      <label className="cc-form-label">Company Name</label>
                      <input type="text" className="cc-form-input" value={settings.companyName} onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Your Company Name" />
                    </div>
                  </div>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Logo & Favicon</h2></div>
                  <div className="cc-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label className="cc-form-label">Company Logo</label>
                        <div style={{ border: '2px dashed var(--cc-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'var(--cc-bg)', cursor: 'pointer' }}>
                          {settings.logoPreview ? (
                            <div style={{ position: 'relative' }}>
                              <img src={settings.logoPreview} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%' }} />
                              <button onClick={() => setSettings(prev => ({ ...prev, logo: null, logoPreview: '' }))} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                            </div>
                          ) : (
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                              <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cc-text-muted)" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                              <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.875rem', margin: 0 }}>Upload Logo</p>
                              <small style={{ color: 'var(--cc-text-muted)' }}>PNG, SVG or JPG</small>
                            </label>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="cc-form-label">Favicon</label>
                        <div style={{ border: '2px dashed var(--cc-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'var(--cc-bg)', cursor: 'pointer' }}>
                          {settings.faviconPreview ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img src={settings.faviconPreview} alt="Favicon" style={{ width: '48px', height: '48px' }} />
                              <button onClick={() => setSettings(prev => ({ ...prev, favicon: null, faviconPreview: '' }))} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                            </div>
                          ) : (
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                              <input type="file" accept="image/*" onChange={handleFaviconUpload} hidden />
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cc-text-muted)" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                              <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.875rem', margin: 0 }}>Upload Favicon</p>
                              <small style={{ color: 'var(--cc-text-muted)' }}>32x32 or 64x64</small>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cc-card">
                  <div className="cc-card-header"><h2 className="cc-card-title">Brand Colors</h2></div>
                  <div className="cc-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {[
                        { key: 'primaryColor', label: 'Primary' },
                        { key: 'secondaryColor', label: 'Secondary' },
                        { key: 'accentColor', label: 'Accent' }
                      ].map(color => (
                        <div key={color.key}>
                          <label className="cc-form-label">{color.label} Color</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="color" value={settings[color.key]} onChange={(e) => setSettings(prev => ({ ...prev, [color.key]: e.target.value }))} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                            <input type="text" className="cc-form-input" value={settings[color.key]} onChange={(e) => setSettings(prev => ({ ...prev, [color.key]: e.target.value }))} style={{ flex: 1 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: settings.primaryColor, color: 'white', fontSize: '0.875rem' }}>Primary</button>
                      <button style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: settings.secondaryColor, color: 'white', fontSize: '0.875rem' }}>Secondary</button>
                      <button style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: settings.accentColor, color: 'white', fontSize: '0.875rem' }}>Accent</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Domain Tab */}
            {activeTab === 'domain' && (
              <>
                <div className="cc-page-header">
                  <h1 className="cc-page-title">Domain Settings</h1>
                  <p className="cc-page-subtitle">Configure your custom domain</p>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Subdomain</h2></div>
                  <div className="cc-card-body">
                    <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Your portal will be accessible at this subdomain</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                      <input type="text" className="cc-form-input" value={settings.subdomain} onChange={(e) => setSettings(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="yourcompany" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }} />
                      <span style={{ padding: '0.625rem 1rem', background: 'var(--cc-border)', color: 'var(--cc-text-secondary)', fontSize: '0.875rem', borderRadius: '0 8px 8px 0' }}>.flacronai.com</span>
                    </div>
                    {settings.subdomain && (
                      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--cc-bg)', borderRadius: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cc-accent)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                        <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--cc-text-primary)' }}>https://{settings.subdomain}.flacronai.com</span>
                        <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => copyToClipboard(`https://${settings.subdomain}.flacronai.com`)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cc-card">
                  <div className="cc-card-header"><h2 className="cc-card-title">Custom Domain</h2></div>
                  <div className="cc-card-body">
                    <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Use your own domain for a fully branded experience</p>
                    <div className="cc-form-group">
                      <label className="cc-form-label">Domain Name</label>
                      <input type="text" className="cc-form-input" value={settings.customDomain} onChange={(e) => setSettings(prev => ({ ...prev, customDomain: e.target.value }))} placeholder="reports.yourcompany.com" />
                    </div>
                    {settings.customDomain && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--cc-bg)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          {settings.domainVerified ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.875rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg> Verified
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.875rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg> Pending Verification
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--cc-text-primary)', marginBottom: '0.75rem' }}>DNS Records</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--cc-surface)', borderRadius: '6px', fontSize: '0.8125rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', background: 'var(--cc-accent-subtle)', color: 'var(--cc-accent)', borderRadius: '4px', fontWeight: '600' }}>CNAME</span>
                            <span style={{ color: 'var(--cc-text-secondary)', flex: 1 }}>{settings.customDomain}</span>
                            <span style={{ color: 'var(--cc-text-primary)', fontFamily: 'monospace' }}>proxy.flacronai.com</span>
                            <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => copyToClipboard('proxy.flacronai.com')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg></button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--cc-surface)', borderRadius: '6px', fontSize: '0.8125rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '4px', fontWeight: '600' }}>TXT</span>
                            <span style={{ color: 'var(--cc-text-secondary)', flex: 1 }}>_flacron-verify</span>
                            <span style={{ color: 'var(--cc-text-primary)', fontFamily: 'monospace' }}>verify={user?.uid?.slice(0, 12)}</span>
                            <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => copyToClipboard(`verify=${user?.uid?.slice(0, 12)}`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg></button>
                          </div>
                        </div>
                        <button className="cc-btn cc-btn-secondary" style={{ marginTop: '1rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                          Verify Domain
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <>
                <div className="cc-page-header">
                  <h1 className="cc-page-title">Email Templates</h1>
                  <p className="cc-page-subtitle">Customize emails sent from your portal</p>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Sender Information</h2></div>
                  <div className="cc-card-body">
                    <div className="cc-form-grid">
                      <div className="cc-form-group">
                        <label className="cc-form-label">From Name</label>
                        <input type="text" className="cc-form-input" value={settings.emailFromName} onChange={(e) => setSettings(prev => ({ ...prev, emailFromName: e.target.value }))} placeholder="Your Company" />
                      </div>
                      <div className="cc-form-group">
                        <label className="cc-form-label">Reply-To Email</label>
                        <input type="email" className="cc-form-input" value={settings.emailFromAddress} onChange={(e) => setSettings(prev => ({ ...prev, emailFromAddress: e.target.value }))} placeholder="noreply@yourcompany.com" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Email Footer</h2></div>
                  <div className="cc-card-body">
                    <div className="cc-form-group">
                      <label className="cc-form-label">Footer Text</label>
                      <textarea className="cc-form-textarea" value={settings.emailFooterText} onChange={(e) => setSettings(prev => ({ ...prev, emailFooterText: e.target.value }))} placeholder="Your Company Name | 123 Business St, City, State 12345" rows={3} />
                    </div>
                  </div>
                </div>

                <div className="cc-card">
                  <div className="cc-card-header"><h2 className="cc-card-title">Email Preview</h2></div>
                  <div className="cc-card-body">
                    <div style={{ border: '1px solid var(--cc-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--cc-bg)', borderBottom: '1px solid var(--cc-border)', fontSize: '0.8125rem' }}>
                        <strong>From:</strong> {settings.emailFromName || 'Your Company'} &lt;{settings.emailFromAddress || 'noreply@yourcompany.com'}&gt;
                      </div>
                      <div style={{ padding: '1.5rem', background: 'var(--cc-surface)' }}>
                        <div style={{ width: '100%', height: '60px', background: settings.primaryColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                          {settings.logoPreview ? <img src={settings.logoPreview} alt="Logo" style={{ maxHeight: '40px' }} /> : <span style={{ color: 'white', fontWeight: '600' }}>{settings.companyName || 'Your Logo'}</span>}
                        </div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--cc-text-primary)' }}>Your Report is Ready</h4>
                        <p style={{ color: 'var(--cc-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Your insurance inspection report has been generated and is ready for download.</p>
                        <button style={{ padding: '0.625rem 1.25rem', background: settings.primaryColor, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500' }}>View Report</button>
                      </div>
                      <div style={{ padding: '1rem', background: 'var(--cc-bg)', borderTop: '1px solid var(--cc-border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--cc-text-muted)' }}>
                        {settings.emailFooterText || 'Your Company | Address | Contact'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <>
                <div className="cc-page-header">
                  <h1 className="cc-page-title">Team Management</h1>
                  <p className="cc-page-subtitle">Manage users who have access to your portal</p>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header">
                    <h2 className="cc-card-title">Team Members</h2>
                    <button className="cc-btn cc-btn-primary" onClick={() => setShowAddMember(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                      Add Member
                    </button>
                  </div>
                  <div className="cc-card-body">
                    {showAddMember && (
                      <div style={{ padding: '1rem', background: 'var(--cc-bg)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div className="cc-form-grid">
                          <div className="cc-form-group">
                            <label className="cc-form-label">Email Address</label>
                            <input type="email" className="cc-form-input" value={newMember.email} onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))} placeholder="colleague@company.com" />
                          </div>
                          <div className="cc-form-group">
                            <label className="cc-form-label">Role</label>
                            <select className="cc-form-select" value={newMember.role} onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}>
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button className="cc-btn cc-btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
                          <button className="cc-btn cc-btn-primary" onClick={addTeamMember}>Add Member</button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Owner */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--cc-bg)', borderRadius: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--cc-accent), #ff9a3c)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>{user?.email?.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', color: 'var(--cc-text-primary)' }}>{user?.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cc-accent)', fontWeight: '600' }}>Owner</div>
                        </div>
                        <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' }}>Active</span>
                      </div>

                      {settings.teamMembers.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--cc-bg)', borderRadius: '8px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--cc-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cc-text-secondary)', fontWeight: '600' }}>{member.email.charAt(0).toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: 'var(--cc-text-primary)' }}>{member.email}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted)', textTransform: 'capitalize' }}>{member.role}</div>
                          </div>
                          <span style={{ padding: '0.25rem 0.5rem', background: member.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: member.status === 'pending' ? '#f59e0b' : '#22c55e', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' }}>{member.status === 'pending' ? 'Pending' : 'Active'}</span>
                          <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => removeTeamMember(member.id)} style={{ color: '#ef4444' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                          </button>
                        </div>
                      ))}

                      {settings.teamMembers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cc-text-muted)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem' }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                          <p style={{ margin: 0 }}>No team members added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cc-card">
                  <div className="cc-card-header"><h2 className="cc-card-title">Role Permissions</h2></div>
                  <div className="cc-card-body">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)', color: 'var(--cc-text-secondary)' }}>Permission</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)', color: 'var(--cc-text-secondary)' }}>Viewer</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)', color: 'var(--cc-text-secondary)' }}>Editor</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)', color: 'var(--cc-text-secondary)' }}>Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'View Reports', viewer: true, editor: true, admin: true },
                          { name: 'Generate Reports', viewer: false, editor: true, admin: true },
                          { name: 'Manage Team', viewer: false, editor: false, admin: true },
                          { name: 'Edit Branding', viewer: false, editor: false, admin: true },
                        ].map(perm => (
                          <tr key={perm.name}>
                            <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--cc-border)', color: 'var(--cc-text-primary)' }}>{perm.name}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)' }}>{perm.viewer ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)' }}>{perm.editor ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>}</td>
                            <td style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid var(--cc-border)' }}>{perm.admin ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <>
                <div className="cc-page-header">
                  <h1 className="cc-page-title">Advanced Settings</h1>
                  <p className="cc-page-subtitle">Configure advanced features</p>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">Branding Options</h2></div>
                  <div className="cc-card-body">
                    {[
                      { key: 'removeBranding', label: 'Remove FlacronAI Branding', desc: 'Hide all FlacronAI branding from your portal' },
                      { key: 'customLoginPage', label: 'Custom Login Page', desc: 'Use your branding on the login page' },
                      { key: 'customDashboard', label: 'Custom Dashboard', desc: 'Apply branding to the dashboard' },
                    ].map(option => (
                      <div key={option.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--cc-border)' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--cc-text-primary)' }}>{option.label}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--cc-text-muted)' }}>{option.desc}</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                          <input type="checkbox" checked={settings[option.key]} onChange={(e) => setSettings(prev => ({ ...prev, [option.key]: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings[option.key] ? 'var(--cc-accent)' : 'var(--cc-border)', borderRadius: '24px', transition: '0.2s' }}>
                            <span style={{ position: 'absolute', content: '', height: '18px', width: '18px', left: settings[option.key] ? '23px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.2s' }} />
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cc-card" style={{ marginBottom: '1rem' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title">API Integration</h2></div>
                  <div className="cc-card-body">
                    <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Use these endpoints for programmatic access</p>
                    {[
                      { method: 'GET', endpoint: '/api/v1/white-label/settings', color: '#22c55e' },
                      { method: 'POST', endpoint: '/api/v1/white-label/settings', color: '#3b82f6' },
                      { method: 'GET', endpoint: '/api/v1/white-label/team', color: '#22c55e' },
                    ].map((api, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--cc-bg)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: `${api.color}15`, color: api.color, borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{api.method}</span>
                        <code style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--cc-text-primary)' }}>{api.endpoint}</code>
                        <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => copyToClipboard(api.endpoint)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cc-card" style={{ borderColor: '#ef4444' }}>
                  <div className="cc-card-header"><h2 className="cc-card-title" style={{ color: '#ef4444' }}>Danger Zone</h2></div>
                  <div className="cc-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--cc-text-primary)' }}>Reset All Settings</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--cc-text-muted)' }}>This will reset all white label settings to default</div>
                      </div>
                      <button className="cc-btn" style={{ background: '#ef4444', color: 'white' }}>Reset Settings</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Live Preview Panel */}
          {showPreview && (
            <aside style={{ width: '400px', background: 'var(--cc-surface)', borderLeft: '1px solid var(--cc-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--cc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: 'var(--cc-text-primary)' }}>Live Preview</h3>
                <button className="cc-btn cc-btn-ghost cc-btn-icon" onClick={() => setShowPreview(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
                <div style={{ border: '1px solid var(--cc-border)', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
                  {/* Preview Navbar */}
                  <div style={{ background: settings.accentColor, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {settings.logoPreview ? (
                      <img src={settings.logoPreview} alt="Logo" style={{ height: '24px' }} />
                    ) : (
                      <span style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>{settings.companyName || 'Your Company'}</span>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                      <span>Dashboard</span>
                      <span>Reports</span>
                    </div>
                  </div>
                  {/* Preview Content */}
                  <div style={{ padding: '1.5rem', background: 'white' }}>
                    <h3 style={{ fontSize: '1rem', color: settings.accentColor, marginBottom: '1rem' }}>Welcome to {settings.companyName || 'Your Portal'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '1rem', border: `2px solid ${settings.primaryColor}20`, borderRadius: '8px', textAlign: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={settings.primaryColor} strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Generate</span>
                      </div>
                      <div style={{ padding: '1rem', border: `2px solid ${settings.primaryColor}20`, borderRadius: '8px', textAlign: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={settings.primaryColor} strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Reports</span>
                      </div>
                    </div>
                    <button style={{ width: '100%', padding: '0.625rem', background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '0.875rem' }}>Create New Report</button>
                  </div>
                  {/* Preview Footer */}
                  {!settings.removeBranding && (
                    <div style={{ padding: '0.5rem', background: '#f5f5f5', textAlign: 'center', fontSize: '0.625rem', color: '#999' }}>Powered by FlacronAI</div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <div className="cc-cmd-palette-overlay" onClick={() => setCommandPaletteOpen(false)}>
          <div className="cc-cmd-palette" onClick={(e) => e.stopPropagation()}>
            <div className="cc-cmd-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" className="cc-cmd-input" placeholder="Type a command..." value={commandSearch} onChange={(e) => setCommandSearch(e.target.value)} autoFocus />
              <kbd style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem', background: 'var(--cc-bg)', border: '1px solid var(--cc-border)', borderRadius: '4px', color: 'var(--cc-text-muted)' }}>ESC</kbd>
            </div>
            <div className="cc-cmd-results">
              <div className="cc-cmd-group">
                <div className="cc-cmd-group-label">Commands</div>
                {filteredCommands.map((item) => (
                  <div key={item.id} className="cc-cmd-item" onClick={() => { item.action(); setCommandPaletteOpen(false); }}>
                    <div className="cc-cmd-item-icon">
                      {item.icon === 'palette' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>}
                      {item.icon === 'globe' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>}
                      {item.icon === 'mail' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>}
                      {item.icon === 'users' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
                      {item.icon === 'settings' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>}
                      {item.icon === 'save' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>}
                      {item.icon === 'eye' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                      {item.icon === 'home' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
                    </div>
                    <div className="cc-cmd-item-content">
                      <div className="cc-cmd-item-title">{item.title}</div>
                      <div className="cc-cmd-item-desc">{item.desc}</div>
                    </div>
                    {item.shortcut && <div className="cc-cmd-item-shortcut">{item.shortcut.map((k, i) => <kbd key={i}>{k}</kbd>)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Panel */}
      <div className={`cc-shortcuts-panel ${showShortcuts ? 'visible' : ''}`}>
        <div className="cc-shortcuts-title">Keyboard Shortcuts</div>
        {[
          { label: 'Command Palette', keys: ['Ctrl', 'K'] },
          { label: 'Branding', keys: ['Ctrl', '1'] },
          { label: 'Domain', keys: ['Ctrl', '2'] },
          { label: 'Email', keys: ['Ctrl', '3'] },
          { label: 'Team', keys: ['Ctrl', '4'] },
          { label: 'Advanced', keys: ['Ctrl', '5'] },
          { label: 'Save', keys: ['Ctrl', 'S'] },
        ].map(s => (
          <div key={s.label} className="cc-shortcut-row">
            <span className="cc-shortcut-label">{s.label}</span>
            <div className="cc-shortcut-keys">{s.keys.map((k, i) => <kbd key={i}>{k}</kbd>)}</div>
          </div>
        ))}
      </div>

      <button className="cc-shortcuts-trigger" onClick={() => setShowShortcuts(!showShortcuts)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
      </button>
    </div>
  );
}

export default WhiteLabelPortal;
