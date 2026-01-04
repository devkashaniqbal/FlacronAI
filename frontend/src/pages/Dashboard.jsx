import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/notifications';
import { exportAsDocx, exportAsPdf, exportAsHtml } from '../utils/exportReports';
import { useAutoSave } from '../utils/autoSave';
import { createTemplateSelector } from '../utils/demoTemplates';
import {
  showToast,
  celebrate,
  PersonalizedLoading,
  KeyboardShortcuts,
  SmartFieldFormatter
} from '../utils/uxEnhancements';
import { getReportPrompt } from '../config/aiPrompt';
import QuickStatsCards from '../components/dashboard/QuickStatsCards';
import SearchFilter from '../components/dashboard/SearchFilter';
import ReportAnalytics from '../components/dashboard/ReportAnalytics';
import DragDropUpload from '../components/dashboard/DragDropUpload';
import BulkExport from '../components/dashboard/BulkExport';
import { StatCardSkeleton, ReportCardSkeleton } from '../components/dashboard/LoadingSkeleton';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/modern-enhancements.css';
import '../styles/dashboard-modern.css';
import '../styles/dashboard-features.css';
import '../styles/dashboard-enhanced.css';
import '../styles/modern-dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [currentPage, setCurrentPage] = useState('generate');
  const [usageStats, setUsageStats] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [reportContent, setReportContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [reportImages, setReportImages] = useState([]);

  // Set page title
  useEffect(() => {
    document.title = 'Dashboard | FlacronAI';
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    claimNumber: '',
    insuredName: '',
    lossDate: '',
    lossType: '',
    reportType: '',
    propertyAddress: '',
    propertyDetails: '',
    lossDescription: '',
    damages: '',
    recommendations: '',
    photos: null
  });

  // Auto-save hook
  useAutoSave('reportForm', formData, {
    saveInterval: 3000,
    excludeFields: ['photos'],
    onSave: () => console.log('Auto-saved')
  });

  useEffect(() => {
    fetchUsageStats();

    // Handle hash navigation
    const hash = window.location.hash.slice(1) || 'generate';
    setCurrentPage(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) || 'generate';
      setCurrentPage(newHash);
      // Clear form data when navigating to generate page to prevent demo data persistence
      if (newHash === 'generate') {
        resetForm();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize template selector - re-run when currentPage changes
  useEffect(() => {
    if (currentPage === 'generate') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const templateContainer = document.getElementById('templateSelectorContainer');
        if (templateContainer) {
          const templateManager = createTemplateSelector('reportForm', 'templateSelectorContainer');

          // Add click handlers that update React state
          const templateCards = templateContainer.querySelectorAll('.template-card');
          templateCards.forEach(card => {
            card.onclick = (e) => {
              const templateKey = card.dataset.template;
              const templates = templateManager.getAllTemplates();
              const template = templates[templateKey];

              if (template && template.data) {
                // Update React state
                setFormData(template.data);

                // Show notification
                if (window.showToast) {
                  window.showToast(`Template "${template.name}" applied!`, 'success');
                }

                // Visual feedback
                card.style.borderColor = '#FF7C08';
                card.style.background = '#fff7ed';
                setTimeout(() => {
                  card.style.borderColor = '';
                  card.style.background = '';
                }, 1000);
              }
            };
          });
        }
      }, 100);
    }
  }, [currentPage]);

  // Initialize keyboard shortcuts
  useEffect(() => {
    KeyboardShortcuts.init();
    return () => {
      // Cleanup if needed
    };
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setUsageStats(result.usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const fetchMyReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setMyReports(result.reports || []);
        setFilteredReports(result.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showNotification('Failed to load reports', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchBillingHistory = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment/billing-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setBillingHistory(result.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch billing history:', error);
    } finally {
      setLoadingBilling(false);
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setCurrentReportId(report.id);
    setReportContent(report.content);
    setReportImages(report.images || []);
    setCurrentPage('generate');
    document.getElementById('reportForm').style.display = 'none';
    document.getElementById('reportResult').style.display = 'block';
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        showNotification('Report deleted successfully', 'success');
        fetchMyReports(); // Refresh list
      } else {
        showNotification(result.error || 'Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete report', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photos') {
      setFormData(prev => ({ ...prev, photos: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDragDropFiles = (files) => {
    setFormData(prev => ({ ...prev, photos: files }));
  };

  const handleBulkExport = async (reportIds, format) => {
    // Export each report
    for (const id of reportIds) {
      await handleExport(format, id);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.claimNumber || !formData.insuredName || !formData.lossType) {
      showNotification('Please fill in all required fields', 'error');
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    const loader = new PersonalizedLoading(setLoadingMessage);
    loader.start();

    try {
      // Generate the AI prompt with exact CRU formatting
      const aiPrompt = getReportPrompt(formData);

      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.uid,
          customPrompt: aiPrompt, // Pass the CRU-formatted prompt
          photos: null // Photos will be uploaded separately
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      setCurrentReportId(result.reportId);
      setReportContent(result.report.content);

      // Upload photos if any were selected
      if (formData.photos && formData.photos.length > 0) {
        try {
          const photoFormData = new FormData();
          Array.from(formData.photos).forEach((file) => {
            photoFormData.append('images', file);
          });

          const uploadResponse = await fetch(`${API_BASE_URL}/reports/${result.reportId}/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: photoFormData
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResult.success) {
            showToast(`${uploadResult.uploaded} photo(s) uploaded successfully`, 'success');

            // Fetch the updated report to get image URLs
            const reportResponse = await fetch(`${API_BASE_URL}/reports/${result.reportId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            const reportData = await reportResponse.json();
            if (reportData.success && reportData.report.images) {
              setReportImages(reportData.report.images);
            }
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          showNotification('Report generated but photos failed to upload', 'warning');
        }
      } else {
        setReportImages([]);
      }

      // Show celebration and notifications
      celebrate('Report Generated Successfully!', 'success');
      showToast('Report ready for download', 'success');
      showNotification('Report generated successfully!', 'success');

      // Show report result
      document.getElementById('reportForm').style.display = 'none';
      document.getElementById('reportResult').style.display = 'block';

      // Refresh usage stats and reports list
      fetchUsageStats();
      fetchMyReports();
    } catch (error) {
      console.error('Generate report error:', error);
      showNotification(error.message, 'error');
      showToast(error.message, 'error');
    } finally {
      loader.stop();
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const resetForm = () => {
    setFormData({
      claimNumber: '',
      insuredName: '',
      lossDate: '',
      lossType: '',
      reportType: '',
      propertyAddress: '',
      propertyDetails: '',
      lossDescription: '',
      damages: '',
      recommendations: '',
      photos: null
    });
    setCurrentReportId(null);
    setReportContent('');

    // Clear file input
    const photoInput = document.getElementById('photos');
    if (photoInput) {
      photoInput.value = '';
    }

    const reportForm = document.getElementById('reportForm');
    const reportResult = document.getElementById('reportResult');
    if (reportForm) reportForm.style.display = 'block';
    if (reportResult) reportResult.style.display = 'none';
  };

  const handleUpgradeCheckout = async (tier) => {
    try {
      setLoading(true);
      showNotification('Creating checkout session...', 'info');

      // Validate user and token before making request
      if (!user || !user.uid) {
        showNotification('User not authenticated. Please log in again.', 'error');
        console.error('User object missing or invalid:', user);
        setLoading(false);
        return;
      }

      if (!token) {
        showNotification('Authentication token missing. Please log in again.', 'error');
        console.error('Token missing');
        setLoading(false);
        return;
      }

      console.log('Creating checkout session for:', { tier, userId: user.uid });

      const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tier,
          userId: user.uid
        })
      });

      const result = await response.json();

      console.log('Checkout session response:', { status: response.status, result });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          showNotification('Session expired. Please log in again.', 'error');
          console.error('401 Unauthorized - Token may be expired or invalid');
          // Optionally: logout and redirect to login
          // await logout();
          // navigate('/auth');
        } else {
          showNotification(result.error || `Server error: ${response.status}`, 'error');
        }
        return;
      }

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        showNotification('Redirecting to checkout...', 'success');
        window.location.href = result.url;
      } else {
        showNotification(result.error || 'Failed to create checkout session', 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Failed to create checkout session: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format report content with proper HTML styling
  const formatReportContent = (content) => {
    if (!content) return '';

    // Split content into lines
    const lines = content.split('\n');
    let formattedHTML = '';
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Empty line - add spacing
      if (!trimmed) {
        if (inList) {
          formattedHTML += '</ul>';
          inList = false;
        }
        formattedHTML += '<br/>';
        return;
      }

      // Check if line is a section header (all caps or starts with specific keywords)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 100) {
        if (inList) {
          formattedHTML += '</ul>';
          inList = false;
        }
        formattedHTML += `<h3 style="color: #1f2937; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #FF7C08; padding-bottom: 0.5rem;">${trimmed}</h3>`;
        return;
      }

      // Check if it's a bold sub-header (ends with :)
      if (trimmed.endsWith(':') && trimmed.length < 80) {
        if (inList) {
          formattedHTML += '</ul>';
          inList = false;
        }
        formattedHTML += `<h4 style="color: #374151; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;">${trimmed}</h4>`;
        return;
      }

      // Check if it's a list item (starts with -, *, or number)
      if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
        if (!inList) {
          formattedHTML += '<ul style="margin-left: 1.5rem; margin-bottom: 1rem;">';
          inList = true;
        }
        const content = trimmed.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
        formattedHTML += `<li style="margin-bottom: 0.5rem; line-height: 1.6;">${content}</li>`;
        return;
      }

      // Regular paragraph
      if (inList) {
        formattedHTML += '</ul>';
        inList = false;
      }
      formattedHTML += `<p style="margin-bottom: 0.75rem; line-height: 1.7; color: #4b5563;">${trimmed}</p>`;
    });

    // Close any open lists
    if (inList) {
      formattedHTML += '</ul>';
    }

    return formattedHTML;
  };

  const handleExport = async (format, reportId = null) => {
    // Use provided reportId or fall back to currentReportId
    const idToExport = reportId || currentReportId;

    if (!idToExport) {
      showNotification('No report to export', 'error');
      return;
    }

    try {
      if (format === 'docx') {
        await exportAsDocx(idToExport, token);
      } else if (format === 'pdf') {
        await exportAsPdf(idToExport, token);
      } else if (format === 'html') {
        await exportAsHtml(idToExport, token);
      }
      showNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    setSidebarOpen(false);

    if (page === 'upgrade') {
      setShowPricingModal(true); // Show pricing modal instead of navigating
    } else if (page === 'my-reports') {
      fetchMyReports(); // Load reports when navigating to My Reports
    } else if (page === 'usage') {
      fetchBillingHistory(); // Load billing history when navigating to Usage & Billing
    } else if (page === 'settings') {
      showNotification('Settings page coming soon!', 'info');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pageTitles = {
    'generate': 'Generate Report',
    'my-reports': 'My Reports',
    'usage': 'Usage & Billing',
    'upgrade': 'Upgrade Plan',
    'settings': 'Settings'
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <h1>FLACRON<span>AI</span></h1>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#generate"
            className={`nav-item ${currentPage === 'generate' ? 'active' : ''}`}
            onClick={() => navigateToPage('generate')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Generate Report</span>
          </a>

          <a
            href="#my-reports"
            className={`nav-item ${currentPage === 'my-reports' ? 'active' : ''}`}
            onClick={() => navigateToPage('my-reports')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>My Reports</span>
          </a>

          <a
            href="#usage"
            className={`nav-item ${currentPage === 'usage' ? 'active' : ''}`}
            onClick={() => navigateToPage('usage')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Usage & Billing</span>
          </a>

          <a
            href="#upgrade"
            className={`nav-item ${currentPage === 'upgrade' ? 'active' : ''}`}
            onClick={() => navigateToPage('upgrade')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>Upgrade Plan</span>
          </a>

          <a
            href="#settings"
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => navigateToPage('settings')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" id="sidebarUser">
            <div className="user-avatar"><i className="fas fa-user-circle"></i></div>
            <div className="user-details">
              <p className="user-name">{user?.displayName || 'User'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn btn-outline btn-block" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h2 className="page-title">{pageTitles[currentPage]}</h2>
          <div className="header-actions">
            <span className="welcome-message">
              {user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}!` : ''}
            </span>
            <span className="user-badge">{usageStats?.tierName || 'Starter'}</span>
          </div>
        </header>

        {/* Usage Stats Section */}
        <section className="usage-stats" id="usageStats">
          <div className="container">
            <div className="usage-card">
              <div className="usage-header">
                <h3>Your Plan: <span id="tierName">{usageStats?.tierName || 'Loading...'}</span></h3>
                {usageStats?.tier !== 'enterprise' && (
                  <Link to="/checkout" className="btn btn-primary">Upgrade Plan</Link>
                )}
              </div>
              <div className="usage-info">
                <div className="usage-stat">
                  <p className="stat-label">Reports This Month</p>
                  <p className="stat-value">
                    <span>{usageStats?.periodUsage || 0}</span> / <span>{usageStats?.limit === -1 ? 'Unlimited' : usageStats?.limit || 0}</span>
                  </p>
                </div>
                <div className="usage-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${usageStats?.percentage || 0}%`,
                        background: usageStats?.percentage >= 80 ? '#ef4444' : usageStats?.percentage >= 50 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <p className="progress-text">{usageStats?.remaining || 0} reports remaining</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conditional Content Based on Current Page */}
        {currentPage === 'generate' && (
        <section className="generator" id="dashboard">
          <div className="container">
            {/* Quick Stats Cards */}
            <QuickStatsCards reports={myReports} usageStats={usageStats} />

            <h2 className="section-title">Generate Your Report</h2>
            <p className="section-subtitle">Create professional insurance inspection reports in seconds</p>

            {/* Template Selector Container */}
            <div id="templateSelectorContainer"></div>

            <div className="generator-container">
              <form id="reportForm" className="report-form" onSubmit={handleGenerateReport}>
                <div className="form-section">
                  <h3>Claim Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="claimNumber">Claim Number *</label>
                      <input
                        type="text"
                        id="claimNumber"
                        name="claimNumber"
                        value={formData.claimNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="insuredName">Insured Name *</label>
                      <input
                        type="text"
                        id="insuredName"
                        name="insuredName"
                        value={formData.insuredName}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          const formatted = SmartFieldFormatter.capitalizeName(e.target.value);
                          setFormData(prev => ({ ...prev, insuredName: formatted }));
                        }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lossDate">Loss Date *</label>
                      <input
                        type="date"
                        id="lossDate"
                        name="lossDate"
                        value={formData.lossDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lossType">Loss Type *</label>
                      <select
                        id="lossType"
                        name="lossType"
                        value={formData.lossType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Loss Type</option>
                        <option value="Fire">Fire</option>
                        <option value="Water">Water</option>
                        <option value="Wind">Wind</option>
                        <option value="Mold">Mold</option>
                        <option value="Theft">Theft</option>
                        <option value="Vandalism">Vandalism</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reportType">Report Type *</label>
                      <select
                        id="reportType"
                        name="reportType"
                        value={formData.reportType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Report Type</option>
                        <option value="First Report">First Report</option>
                        <option value="Interim Report">Interim Report</option>
                        <option value="Final Report">Final Report</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Property Details</h3>
                  <div className="form-group">
                    <label htmlFor="propertyAddress">Property Address *</label>
                    <input
                      type="text"
                      id="propertyAddress"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="propertyDetails">Property Details</label>
                    <textarea
                      id="propertyDetails"
                      name="propertyDetails"
                      rows="3"
                      value={formData.propertyDetails}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-story single-family home, built in 1985, 2,500 sq ft..."
                    ></textarea>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Loss Description</h3>
                  <div className="form-group">
                    <label htmlFor="lossDescription">Description of Loss *</label>
                    <textarea
                      id="lossDescription"
                      name="lossDescription"
                      rows="4"
                      value={formData.lossDescription}
                      onChange={handleInputChange}
                      required
                      placeholder="Describe what happened and when..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="damages">Damages Observed *</label>
                    <textarea
                      id="damages"
                      name="damages"
                      rows="4"
                      value={formData.damages}
                      onChange={handleInputChange}
                      required
                      placeholder="List all damages observed during inspection..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recommendations">Recommendations</label>
                    <textarea
                      id="recommendations"
                      name="recommendations"
                      rows="3"
                      value={formData.recommendations}
                      onChange={handleInputChange}
                      placeholder="Your recommendations for repairs, further inspection, etc..."
                    ></textarea>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Photos (Optional)</h3>
                  <DragDropUpload onFilesSelected={handleDragDropFiles} maxFiles={10} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    <span className="btn-text" style={{ display: loading ? 'none' : 'inline' }}>Generate Report</span>
                    <span className="btn-loading" style={{ display: loading ? 'inline-flex' : 'none' }}>
                      <span className="spinner"></span> {loadingMessage || 'Generating...'}
                    </span>
                  </button>
                </div>
              </form>

              <div id="reportResult" className="report-result" style={{ display: 'none' }}>
                <div className="result-header">
                  <h3>Report Generated Successfully!</h3>
                  <p className="result-id">Report ID: <span>{currentReportId}</span></p>
                </div>

                <div
                  className="result-content formatted-report"
                  dangerouslySetInnerHTML={{ __html: formatReportContent(reportContent) }}
                />

                {reportImages.length > 0 && (
                  <div className="report-images">
                    <h4>Attached Photos</h4>
                    <div className="images-grid">
                      {reportImages.map((image, index) => (
                        <div key={index} className="image-item">
                          <img src={image.url} alt={image.fileName || `Photo ${index + 1}`} />
                          <p className="image-name">{image.fileName || `Photo ${index + 1}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="result-actions">
                  <button className="btn btn-primary" onClick={() => handleExport('docx')}>Export as DOCX</button>
                  <button className="btn btn-primary" onClick={() => handleExport('pdf')}>Export as PDF</button>
                  <button className="btn btn-outline" onClick={() => handleExport('html')}>View HTML</button>
                  <button className="btn btn-outline" onClick={resetForm}>Generate New Report</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* My Reports Section */}
        {currentPage === 'my-reports' && (
        <section className="my-reports" id="my-reports">
          <div className="container">
            <h2 className="section-title">My Reports</h2>
            <p className="section-subtitle">View and manage all your generated reports</p>

            {/* Report Analytics */}
            <ReportAnalytics reports={myReports} />

            {loadingReports ? (
              <div className="loading-state">
                <div className="reports-grid">
                  <ReportCardSkeleton />
                  <ReportCardSkeleton />
                  <ReportCardSkeleton />
                  <ReportCardSkeleton />
                </div>
              </div>
            ) : myReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No Reports Yet</h3>
                <p>You haven't generated any reports yet. Click "Generate Report" to create your first one!</p>
                <button className="btn btn-primary" onClick={() => navigateToPage('generate')}>
                  Generate Your First Report
                </button>
              </div>
            ) : (
              <>
                {/* Search and Filter */}
                <SearchFilter reports={myReports} onFilteredReports={setFilteredReports} />

                {/* Bulk Export */}
                <BulkExport reports={filteredReports} onExport={handleBulkExport} />

                <div className="reports-grid">
                  {filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.reportType || 'Insurance Report'}</h3>
                      <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="report-details">
                      <p><strong>Claim:</strong> {report.claimNumber}</p>
                      <p><strong>Insured:</strong> {report.insuredName}</p>
                      <p><strong>Loss Type:</strong> {report.lossType}</p>
                      <p><strong>Property:</strong> {report.propertyAddress}</p>
                    </div>
                    <div className="report-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => viewReport(report)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => handleExport('pdf', report.id)}>
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => handleExport('docx', report.id)}>
                        <i className="fas fa-file-word"></i> DOCX
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteReport(report.id)} title="Delete Report">
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>
        </section>
        )}

        {/* Usage & Billing Section */}
        {currentPage === 'usage' && (
        <section className="usage-billing" id="usage-billing">
          <div className="container">
            <h2 className="section-title">Usage & Billing</h2>

            {/* Current Plan Section */}
            <div className="plan-section">
              <div className="plan-card">
                <h3>Current Plan</h3>
                <div className="plan-details">
                  <div className="plan-name">{usageStats?.tierName || 'Starter'}</div>
                  <div className="plan-price">
                    {usageStats?.price === 'Free' ? 'Free' : `$${usageStats?.price}/month`}
                  </div>
                </div>
                <div className="plan-stats">
                  <div className="stat-item">
                    <span className="stat-label">Reports Used</span>
                    <span className="stat-value">{usageStats?.periodUsage || 0} / {usageStats?.limit === -1 ? '∞' : usageStats?.limit || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Reports Generated</span>
                    <span className="stat-value">{usageStats?.totalReports || 0}</span>
                  </div>
                </div>
                {usageStats?.tier !== 'enterprise' && (
                  <button className="btn btn-primary" onClick={() => setShowPricingModal(true)}>
                    Upgrade Plan
                  </button>
                )}
              </div>

              {/* Features List */}
              <div className="features-list">
                <h4>Your Plan Includes:</h4>
                <ul>
                  {(usageStats?.features && Array.isArray(usageStats.features) ? usageStats.features : [
                    'AI-powered report generation',
                    'Export to PDF, DOCX, HTML',
                    'Professional templates',
                    'Email support'
                  ]).map((feature, index) => (
                    <li key={index}>
                      <i className="fas fa-check-circle"></i> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Billing History */}
            <div className="billing-history">
              <h3>Billing History</h3>
              <div className="billing-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBilling ? (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>
                          Loading billing history...
                        </td>
                      </tr>
                    ) : billingHistory.length > 0 ? (
                      billingHistory.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.description}</td>
                          <td>{item.amount}</td>
                          <td>
                            <span className={`status-badge status-${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            {item.invoiceUrl ? (
                              <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                <i className="fas fa-download"></i> Download
                              </a>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                            <i className="fas fa-receipt" style={{fontSize: '2rem', color: '#9ca3af'}}></i>
                            <div>
                              <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#374151'}}>No billing history yet</p>
                              <p style={{margin: 0, fontSize: '0.875rem', color: '#6b7280'}}>Billing history will appear here once you upgrade to a paid plan</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Upgrade Plan Section */}
        {currentPage === 'upgrade' && (
        <section className="upgrade-section" id="upgrade">
          <div className="container">
            <h2 className="section-title">Upgrade Your Plan</h2>
            <p className="section-subtitle">Choose the perfect plan for your insurance reporting needs</p>

            {/* Current Plan Info */}
            <div className="current-plan-banner">
              <div className="current-plan-info">
                <h3>Current Plan: {usageStats?.tierName || 'Starter'}</h3>
                <p>You're currently on the {usageStats?.tierName || 'Starter'} plan with {usageStats?.remaining || 0} reports remaining this month.</p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="pricing-modal-grid">
              {/* Professional Plan */}
              <div className="pricing-modal-card">
                <div className="plan-badge">Most Popular</div>
                <h3>Professional</h3>
                <div className="plan-price">
                  <span className="price-amount">$39.99</span>
                  <span className="price-period">/month</span>
                </div>
                <ul className="plan-features">
                  <li><i className="fas fa-check"></i> 20 reports per month</li>
                  <li><i className="fas fa-check"></i> AI-powered report generation</li>
                  <li><i className="fas fa-check"></i> PDF & DOCX export</li>
                  <li><i className="fas fa-check"></i> No watermark</li>
                  <li><i className="fas fa-check"></i> Custom logo</li>
                  <li><i className="fas fa-check"></i> Email support</li>
                </ul>
                <button
                  onClick={() => handleUpgradeCheckout('professional')}
                  className="btn btn-primary btn-block"
                  disabled={loading || usageStats?.tier === 'professional'}
                >
                  {loading ? 'Loading...' : usageStats?.tier === 'professional' ? 'Current Plan' : 'Select Professional'}
                </button>
              </div>

              {/* Agency Plan */}
              <div className="pricing-modal-card">
                <div className="plan-badge">Best Value</div>
                <h3>Agency</h3>
                <div className="plan-price">
                  <span className="price-amount">$99.99</span>
                  <span className="price-period">/month</span>
                </div>
                <ul className="plan-features">
                  <li><i className="fas fa-check"></i> 100 reports per month</li>
                  <li><i className="fas fa-check"></i> 5 user accounts</li>
                  <li><i className="fas fa-check"></i> All export formats</li>
                  <li><i className="fas fa-check"></i> Agency dashboard</li>
                  <li><i className="fas fa-check"></i> Custom branding</li>
                  <li><i className="fas fa-check"></i> Priority support</li>
                </ul>
                <button
                  onClick={() => handleUpgradeCheckout('agency')}
                  className="btn btn-primary btn-block"
                  disabled={loading || usageStats?.tier === 'agency'}
                >
                  {loading ? 'Loading...' : usageStats?.tier === 'agency' ? 'Current Plan' : 'Select Agency'}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="pricing-modal-card">
                <div className="plan-badge">Premium</div>
                <h3>Enterprise</h3>
                <div className="plan-price">
                  <span className="price-amount">$499</span>
                  <span className="price-period">/month</span>
                </div>
                <ul className="plan-features">
                  <li><i className="fas fa-check"></i> Unlimited reports</li>
                  <li><i className="fas fa-check"></i> Unlimited users</li>
                  <li><i className="fas fa-check"></i> API access</li>
                  <li><i className="fas fa-check"></i> White-label portal</li>
                  <li><i className="fas fa-check"></i> Custom integration</li>
                  <li><i className="fas fa-check"></i> Dedicated support</li>
                </ul>
                <button
                  onClick={() => handleUpgradeCheckout('enterprise')}
                  className="btn btn-primary btn-block"
                  disabled={loading || usageStats?.tier === 'enterprise'}
                >
                  {loading ? 'Loading...' : usageStats?.tier === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="upgrade-faq">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>Can I change my plan anytime?</h4>
                  <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div className="faq-item">
                  <h4>What payment methods do you accept?</h4>
                  <p>We accept all major credit cards through our secure Stripe payment gateway.</p>
                </div>
                <div className="faq-item">
                  <h4>Is there a long-term commitment?</h4>
                  <p>No, all plans are month-to-month. You can cancel anytime without penalties.</p>
                </div>
                <div className="faq-item">
                  <h4>Do unused reports roll over?</h4>
                  <p>No, report limits reset each monthly billing cycle.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="pricing-modal-overlay" onClick={() => setShowPricingModal(false)}>
            <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPricingModal(false)}>×</button>
              <h2>Choose Your Plan</h2>
              <p className="modal-subtitle">Select the perfect plan for your insurance reporting needs</p>

              <div className="pricing-modal-grid">
                {/* Professional Plan */}
                <div className="pricing-modal-card">
                  <div className="plan-badge">Most Popular</div>
                  <h3>Professional</h3>
                  <div className="plan-price">
                    <span className="price-amount">$39.99</span>
                    <span className="price-period">/month</span>
                  </div>
                  <ul className="plan-features">
                    <li><i className="fas fa-check"></i> 20 reports per month</li>
                    <li><i className="fas fa-check"></i> AI-powered report generation</li>
                    <li><i className="fas fa-check"></i> PDF & DOCX export</li>
                    <li><i className="fas fa-check"></i> No watermark</li>
                    <li><i className="fas fa-check"></i> Custom logo</li>
                    <li><i className="fas fa-check"></i> Email support</li>
                  </ul>
                  <button
                    onClick={() => handleUpgradeCheckout('professional')}
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Select Professional'}
                  </button>
                </div>

                {/* Agency Plan */}
                <div className="pricing-modal-card">
                  <div className="plan-badge">Best Value</div>
                  <h3>Agency</h3>
                  <div className="plan-price">
                    <span className="price-amount">$99.99</span>
                    <span className="price-period">/month</span>
                  </div>
                  <ul className="plan-features">
                    <li><i className="fas fa-check"></i> 100 reports per month</li>
                    <li><i className="fas fa-check"></i> 5 user accounts</li>
                    <li><i className="fas fa-check"></i> All export formats</li>
                    <li><i className="fas fa-check"></i> Agency dashboard</li>
                    <li><i className="fas fa-check"></i> Custom branding</li>
                    <li><i className="fas fa-check"></i> Priority support</li>
                  </ul>
                  <button
                    onClick={() => handleUpgradeCheckout('agency')}
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Select Agency'}
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="pricing-modal-card">
                  <div className="plan-badge">Premium</div>
                  <h3>Enterprise</h3>
                  <div className="plan-price">
                    <span className="price-amount">$499</span>
                    <span className="price-period">/month</span>
                  </div>
                  <ul className="plan-features">
                    <li><i className="fas fa-check"></i> Unlimited reports</li>
                    <li><i className="fas fa-check"></i> Unlimited users</li>
                    <li><i className="fas fa-check"></i> API access</li>
                    <li><i className="fas fa-check"></i> White-label portal</li>
                    <li><i className="fas fa-check"></i> Custom integration</li>
                    <li><i className="fas fa-check"></i> Dedicated support</li>
                  </ul>
                  <button
                    onClick={() => handleUpgradeCheckout('enterprise')}
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Contact Sales'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>FLACRONAI</h3>
                <p>AI-powered insurance report generation using IBM WatsonX AI & OpenAI.</p>
              </div>
              <div className="footer-section">
                <h4>Product</h4>
                <Link to="/#features">Features</Link>
                <Link to="/#pricing">Pricing</Link>
                <Link to="/dashboard">Dashboard</Link>
                <a href="#">API Docs</a>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <a href="https://flacronenterprises.com/about-us/" target="_blank" rel="noopener noreferrer">About</a>
                <a href="https://flacronenterprises.com/contact-us/" target="_blank" rel="noopener noreferrer">Contact</a>
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
              </div>
              <div className="footer-section">
                <h4>Connect</h4>
                <a href="https://www.tiktok.com/@flacronenterprises" target="_blank" rel="noopener noreferrer">TikTok</a>
                <a href="https://www.linkedin.com/company/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://www.instagram.com/flacronenterprisesllc/" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.facebook.com/people/Flacron-Enterprises/61579538447653/" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="mailto:support@flacronenterprises.com">Support</a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2025 Flacron Enterprises. All rights reserved.</p>
              <p>Powered by IBM WatsonX AI & OpenAI</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
