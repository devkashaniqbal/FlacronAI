import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/crmNotifications';
import '../styles/crm.css';

const API_BASE = '/api/crm';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CRM = () => {
  const { user, token } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [claims, setClaims] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [salesLeads, setSalesLeads] = useState([]);
  const [analytics, setAnalytics] = useState({
    overview: { totalClients: 0, activeClaims: 0, completedClaims: 0 },
    revenue: { total: 0 },
    claimsByType: {},
    claimsByStatus: {},
    recentActivity: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetailModalOpen, setLeadDetailModalOpen] = useState(false);

  const chartTypeRef = useRef(null);
  const chartStatusRef = useRef(null);

  useEffect(() => {
    if (currentView === 'dashboard') {
      loadDashboard();
      loadSubscriptions(); // Load subscriptions for revenue
    } else if (currentView === 'clients') {
      loadClients();
    } else if (currentView === 'claims') {
      loadClaims();
    } else if (currentView === 'subscriptions') {
      loadSubscriptions();
    } else if (currentView === 'salesLeads') {
      loadSalesLeads();
    }
  }, [currentView, statusFilter, priorityFilter]);

  const getUserId = () => {
    return user?.uid || 'demo-user';
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { 'x-user-id': getUserId() }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showNotification('Failed to load dashboard', 'error');
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch(`${API_BASE}/clients`, {
        headers: { 'x-user-id': getUserId() }
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showNotification('Failed to load clients', 'error');
    }
  };

  const loadClaims = async () => {
    try {
      let url = `${API_BASE}/claims?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;

      const response = await fetch(url, {
        headers: { 'x-user-id': getUserId() }
      });
      const data = await response.json();
      if (data.success) {
        setClaims(data.claims);
      }
    } catch (error) {
      console.error('Error loading claims:', error);
      showNotification('Failed to load claims', 'error');
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      showNotification('Failed to load subscriptions', 'error');
    }
  };

  const loadSalesLeads = async () => {
    try {
      let url = `${API_BASE_URL}/sales/leads?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSalesLeads(data.leads);
      }
    } catch (error) {
      console.error('Error loading sales leads:', error);
      showNotification('Failed to load sales leads', 'error');
    }
  };

  const updateSalesLead = async (leadId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Sales lead updated successfully', 'success');
        loadSalesLeads();
      }
    } catch (error) {
      console.error('Error updating sales lead:', error);
      showNotification('Failed to update sales lead', 'error');
    }
  };

  const convertLeadToCustomer = async (lead) => {
    if (!confirm(`Convert ${lead.companyName} to Enterprise customer?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales/leads/${lead.id}/convert-to-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: lead.companyName,
          fullName: lead.fullName,
          workEmail: lead.workEmail,
          phone: lead.phone
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification(`${lead.companyName} converted to Enterprise customer!`, 'success');
        loadSalesLeads();
        loadClients();
      } else {
        showNotification(data.message || 'Failed to convert lead', 'error');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      showNotification('Failed to convert lead to customer', 'error');
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const clientData = {
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      type: formData.get('type'),
      notes: formData.get('notes')
    };

    try {
      const response = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId()
        },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Client added successfully', 'success');
        setClientModalOpen(false);
        e.target.reset();
        loadClients();
        loadDashboard();
      } else {
        showNotification(data.error || 'Failed to add client', 'error');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      showNotification('Failed to add client', 'error');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const select = document.getElementById('claim-client-select');
    const selectedOption = select.options[select.selectedIndex];

    const claimData = {
      claimNumber: formData.get('claimNumber'),
      clientId: formData.get('clientId'),
      clientName: selectedOption.dataset.name,
      insuredName: formData.get('insuredName'),
      propertyAddress: formData.get('propertyAddress'),
      lossDate: formData.get('lossDate'),
      lossType: formData.get('lossType'),
      priority: formData.get('priority'),
      inspectionDate: formData.get('inspectionDate'),
      notes: formData.get('notes')
    };

    try {
      const response = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId()
        },
        body: JSON.stringify(claimData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Claim created successfully', 'success');
        setClaimModalOpen(false);
        e.target.reset();
        loadClaims();
        loadDashboard();
      } else {
        showNotification(data.error || 'Failed to create claim', 'error');
      }
    } catch (error) {
      console.error('Error creating claim:', error);
      showNotification('Failed to create claim', 'error');
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false); // Close mobile menu when switching views
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: { title: 'Dashboard', subtitle: 'Overview of your CRM activities' },
      clients: { title: 'Clients', subtitle: 'Manage your client relationships' },
      claims: { title: 'Claims', subtitle: 'Track and manage insurance claims' },
      calendar: { title: 'Calendar', subtitle: 'Schedule and manage inspections' },
      reports: { title: 'Reports', subtitle: 'Generated insurance reports' },
      analytics: { title: 'Analytics', subtitle: 'Business insights and metrics' },
      subscriptions: { title: 'Subscriptions', subtitle: 'Manage user subscriptions and revenue' }
    };
    return titles[currentView] || titles.dashboard;
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (action) => {
    const icons = {
      created: 'fa-plus-circle',
      status_change: 'fa-sync',
      updated: 'fa-edit',
      completed: 'fa-check-circle',
      assigned: 'fa-user-plus'
    };
    return icons[action] || 'fa-circle';
  };

  const filteredClients = clients.filter(client =>
    client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const claimsByTypeData = {
    labels: Object.keys(analytics.claimsByType || {}),
    datasets: [{
      data: Object.values(analytics.claimsByType || {}),
      backgroundColor: [
        '#EF4444', // Fire - Red
        '#3B82F6', // Water - Blue
        '#10B981', // Wind - Green
        '#F59E0B', // Hail - Orange
        '#8B5CF6', // Mold - Purple
        '#6B7280'  // Other - Gray
      ]
    }]
  };

  const claimsByStatusData = {
    labels: Object.keys(analytics.claimsByStatus || {}).map(status =>
      status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    ),
    datasets: [{
      label: 'Claims',
      data: Object.values(analytics.claimsByStatus || {}),
      backgroundColor: '#4F46E5',
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const pageTitle = getPageTitle();

  return (
    <div className="crm-page">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar Navigation */}
      <aside className={`crm-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-fire"></i>
            <span>FlacronAI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#dashboard"
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('dashboard'); }}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
          <a
            href="#clients"
            className={`nav-item ${currentView === 'clients' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('clients'); }}
          >
            <i className="fas fa-users"></i>
            <span>Clients</span>
          </a>
          <a
            href="#claims"
            className={`nav-item ${currentView === 'claims' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('claims'); }}
          >
            <i className="fas fa-folder-open"></i>
            <span>Claims</span>
          </a>
          <a
            href="#analytics"
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('analytics'); }}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Analytics</span>
          </a>
          <a
            href="#subscriptions"
            className={`nav-item ${currentView === 'subscriptions' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('subscriptions'); }}
          >
            <i className="fas fa-credit-card"></i>
            <span>Subscriptions</span>
          </a>
          <a
            href="#salesLeads"
            className={`nav-item ${currentView === 'salesLeads' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('salesLeads'); }}
          >
            <i className="fas fa-handshake"></i>
            <span>Sales Leads</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <a href="/dashboard" className="nav-item">
            <i className="fas fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="crm-main">
        {/* Header */}
        <header className="crm-header">
          <div className="header-left">
            <h1 id="page-title">{pageTitle.title}</h1>
            <p id="page-subtitle">{pageTitle.subtitle}</p>
          </div>
          <div className="header-right">
            <button className="btn-icon" title="Notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <button className="btn-icon" title="Settings">
              <i className="fas fa-cog"></i>
            </button>
            <div className="user-profile">
              <img src={`https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=4F46E5&color=fff`} alt="User" />
              <span>{user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="crm-content">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="view-container active">
              {/* Dashboard Header */}
              <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Overview of your CRM activities</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{analytics.overview.totalClients}</h3>
                    <p>Total Clients</p>
                  </div>
                  <div className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> 12%
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{subscriptions.length}</h3>
                    <p>Paid Subscribers</p>
                  </div>
                  <div className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> {subscriptions.length > 0 ? '100%' : '0%'}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="stat-info">
                    <h3>${(() => {
                      const revenue = subscriptions.reduce((total, sub) => {
                        const amount = parseFloat(sub.amount.replace(/[^0-9.]/g, '')) || 0;
                        return total + amount;
                      }, 0);
                      return revenue.toFixed(2);
                    })()}</h3>
                    <p>Monthly Revenue</p>
                  </div>
                  <div className="stat-trend positive">
                    <i className="fas fa-arrow-up"></i> {subscriptions.length > 0 ? '15%' : '0%'}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{analytics.overview.completedClaims}</h3>
                    <p>Completed Claims</p>
                  </div>
                  <div className="stat-trend neutral">
                    <i className="fas fa-minus"></i> 0%
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>Claims by Type</h3>
                  <Doughnut ref={chartTypeRef} data={claimsByTypeData} options={chartOptions} />
                </div>
                <div className="chart-card">
                  <h3>Claims by Status</h3>
                  <Bar ref={chartStatusRef} data={claimsByStatusData} options={barChartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {!analytics.recentActivity || analytics.recentActivity.length === 0 ? (
                    <p className="text-muted">No recent activity</p>
                  ) : (
                    analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <i className={`fas ${getActivityIcon(activity.action)}`}></i>
                        </div>
                        <div className="activity-content">
                          <p>
                            <strong>{activity.claimNumber}</strong> - {activity.note}
                          </p>
                          <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Clients View */}
          {currentView === 'clients' && (
            <div className="view-container active">
              <div className="view-header">
                <div className="search-bar">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={() => setClientModalOpen(true)}>
                  <i className="fas fa-plus"></i> Add Client
                </button>
              </div>

              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Contact Person</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Type</th>
                      <th>Total Claims</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">No clients found</td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr key={client.clientId}>
                          <td><strong>{client.companyName}</strong></td>
                          <td>{client.contactName}</td>
                          <td>{client.email}</td>
                          <td>{client.phone}</td>
                          <td><span className="badge">{client.type?.replace(/_/g, ' ')}</span></td>
                          <td>{client.totalClaims || 0}</td>
                          <td><span className={`badge status-${client.status}`}>{client.status}</span></td>
                          <td>
                            <button className="btn-icon" title="View">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn-icon" title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Claims View */}
          {currentView === 'claims' && (
            <div className="view-container active">
              <div className="view-header">
                <div>
                  <h1>Claims</h1>
                  <p>Track and manage insurance claims</p>
                </div>
                <div className="view-actions">
                  <div className="filter-group">
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    className="filter-select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  </div>
                  <button className="btn-primary" onClick={() => setClaimModalOpen(true)}>
                    <i className="fas fa-plus"></i> New Claim
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Claim #</th>
                      <th>Client</th>
                      <th>Insured</th>
                      <th>Loss Type</th>
                      <th>Loss Date</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">No claims found</td>
                      </tr>
                    ) : (
                      claims.map((claim) => (
                        <tr key={claim.claimId}>
                          <td><strong>{claim.claimNumber}</strong></td>
                          <td>{claim.clientName}</td>
                          <td>{claim.insuredName}</td>
                          <td>{claim.lossType}</td>
                          <td>{claim.lossDate}</td>
                          <td><span className={`badge status-${claim.status}`}>{claim.status?.replace(/_/g, ' ')}</span></td>
                          <td><span className={`badge priority-${claim.priority}`}>{claim.priority}</span></td>
                          <td>
                            <button className="btn-icon" title="View">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn-icon" title="Update Status">
                              <i className="fas fa-sync"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {currentView === 'calendar' && (
            <div className="view-container active">
              <div className="calendar-grid">
                <p className="text-muted">Calendar view - Coming soon!</p>
              </div>
            </div>
          )}

          {/* Reports View */}
          {currentView === 'reports' && (
            <div className="view-container active">
              <p className="text-muted">Reports view - Coming soon!</p>
            </div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <div className="view-container active">
              <p className="text-muted">Analytics view - Coming soon!</p>
            </div>
          )}

          {/* Subscriptions View */}
          {currentView === 'subscriptions' && (
            <div className="view-container active">
              {/* Subscription Stats */}
              <div className="stats-grid" style={{marginBottom: '2rem'}}>
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{subscriptions.length}</h3>
                    <p>Total Subscriptions</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{subscriptions.filter(s => s.tier === 'professional').length}</h3>
                    <p>Professional</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{subscriptions.filter(s => s.tier === 'agency').length}</h3>
                    <p>Agency</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">
                    <i className="fas fa-crown"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{subscriptions.filter(s => s.tier === 'enterprise').length}</h3>
                    <p>Enterprise</p>
                  </div>
                </div>
              </div>

              {/* Subscriptions Table */}
              <div className="content-card">
                <div className="card-header">
                  <h2>All Subscriptions</h2>
                  <div className="header-actions">
                    <span className="text-muted">Total Revenue: ${(() => {
                      const revenue = subscriptions.reduce((total, sub) => {
                        const amount = parseFloat(sub.amount.replace(/[^0-9.]/g, '')) || 0;
                        return total + amount;
                      }, 0);
                      return revenue.toFixed(2);
                    })()}/month</span>
                  </div>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-credit-card"></i>
                    <h3>No active subscriptions</h3>
                    <p>No users have subscribed to paid plans yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Started</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((subscription, index) => (
                          <tr key={subscription.userId || index}>
                            <td>
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <img
                                  src={`https://ui-avatars.com/api/?name=${subscription.displayName}&background=random`}
                                  alt={subscription.displayName}
                                  style={{width: '32px', height: '32px', borderRadius: '50%'}}
                                />
                                <div>
                                  <div style={{fontWeight: '500'}}>{subscription.displayName}</div>
                                  <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                                    ID: {subscription.userId.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{subscription.email}</td>
                            <td>
                              <span className={`badge ${
                                subscription.tier === 'professional' ? 'badge-blue' :
                                subscription.tier === 'agency' ? 'badge-purple' :
                                'badge-orange'
                              }`}>
                                {subscription.tier.toUpperCase()}
                              </span>
                            </td>
                            <td style={{fontWeight: '600', color: '#10b981'}}>{subscription.amount}</td>
                            <td>
                              <span className={`badge ${
                                subscription.subscriptionStatus === 'active' ? 'badge-green' :
                                subscription.subscriptionStatus === 'canceling' ? 'badge-yellow' :
                                'badge-gray'
                              }`}>
                                {subscription.subscriptionStatus || 'Active'}
                              </span>
                            </td>
                            <td>{new Date(subscription.createdAt).toLocaleDateString()}</td>
                            <td>{new Date(subscription.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Leads View */}
          {currentView === 'salesLeads' && (
            <div className="view-container active">
              <div className="view-header">
                <h1>Sales Leads</h1>
                <div className="view-actions">
                  <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                      <option value="">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid" style={{marginBottom: '2rem'}}>
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{salesLeads.length}</h3>
                    <p>Total Leads</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{salesLeads.filter(l => l.status === 'new').length}</h3>
                    <p>New Leads</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange">
                    <i className="fas fa-fire"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{salesLeads.filter(l => l.priority === 'high').length}</h3>
                    <p>High Priority</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{salesLeads.filter(l => l.status === 'converted').length}</h3>
                    <p>Converted</p>
                  </div>
                </div>
              </div>

              {/* Sales Leads Table */}
              <div className="content-card">
                <div className="card-header">
                  <h2>All Sales Leads</h2>
                  <div className="header-actions">
                    <span className="text-muted">{salesLeads.length} total leads</span>
                  </div>
                </div>
                {salesLeads.length === 0 ? (
                  <div style={{padding: '2rem', textAlign: 'center'}}>
                    <p className="text-muted">No sales leads found.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Contact</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Type</th>
                          <th>Monthly Usage</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesLeads.map((lead) => (
                          <tr key={lead.id}>
                            <td><strong>{lead.companyName}</strong></td>
                            <td>{lead.fullName}</td>
                            <td><a href={`mailto:${lead.workEmail}`}>{lead.workEmail}</a></td>
                            <td>{lead.phone}</td>
                            <td><span className="badge badge-blue">{lead.companyType}</span></td>
                            <td>{lead.monthlyUsage}</td>
                            <td>
                              <span className={`badge priority-${lead.priority}`}>{lead.priority}</span>
                            </td>
                            <td>
                              <select
                                value={lead.status}
                                onChange={(e) => updateSalesLead(lead.id, { status: e.target.value })}
                                className={`status-select status-${lead.status}`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="converted">Converted</option>
                                <option value="lost">Lost</option>
                              </select>
                            </td>
                            <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <div style={{display: 'flex', gap: '0.5rem'}}>
                                <button
                                  className="btn-icon"
                                  title="View Request Details"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setLeadDetailModalOpen(true);
                                  }}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {lead.status !== 'converted' && (
                                  <button
                                    className="btn-primary"
                                    style={{fontSize: '0.75rem', padding: '0.5rem 0.75rem'}}
                                    onClick={() => convertLeadToCustomer(lead)}
                                  >
                                    Make Customer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      {leadDetailModalOpen && selectedLead && (
        <div className="modal-overlay" onClick={() => setLeadDetailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h2>Sales Lead Request Details</h2>
              <button className="close-button" onClick={() => setLeadDetailModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{padding: '2rem'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem'}}>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Company Name</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.companyName}</p>
                </div>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Contact Person</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.fullName}</p>
                </div>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Work Email</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.workEmail}</p>
                </div>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Phone</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.phone}</p>
                </div>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Company Type</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.companyType}</p>
                </div>
                <div>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Monthly Usage</p>
                  <p style={{fontWeight: '600', fontSize: '1rem'}}>{selectedLead.monthlyUsage}</p>
                </div>
                <div style={{gridColumn: '1 / -1'}}>
                  <p style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>Message</p>
                  <p style={{fontWeight: '500', fontSize: '1rem', backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '8px'}}>
                    {selectedLead.message || 'No message provided'}
                  </p>
                </div>
              </div>
              <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                <button
                  className="btn-primary"
                  style={{flex: 1}}
                  onClick={() => {
                    convertLeadToCustomer(selectedLead);
                    setLeadDetailModalOpen(false);
                  }}
                >
                  Make Customer
                </button>
                <button
                  style={{flex: 1, padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer'}}
                  onClick={() => setLeadDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
