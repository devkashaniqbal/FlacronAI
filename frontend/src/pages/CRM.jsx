import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/crmNotifications';
import '../styles/crm.css';

const API_BASE = '/api/crm';
const API_BASE_URL = 'http://localhost:3000/api';

const CRM = () => {
  const { user, token } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [claims, setClaims] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
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
      {/* Sidebar Navigation */}
      <aside className="crm-sidebar">
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
            href="#calendar"
            className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('calendar'); }}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Calendar</span>
          </a>
          <a
            href="#reports"
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); switchView('reports'); }}
          >
            <i className="fas fa-file-alt"></i>
            <span>Reports</span>
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
                <table className="data-table">
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

              <div className="table-container">
                <table className="data-table">
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
                    <table className="data-table">
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
        </div>
      </main>

      {/* Add Client Modal */}
      {clientModalOpen && (
        <div className="modal active" onClick={(e) => { if (e.target.classList.contains('modal')) setClientModalOpen(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Client</h2>
              <button className="btn-close" onClick={() => setClientModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleClientSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input type="text" name="companyName" required />
                </div>
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input type="text" name="contactName" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" name="phone" required />
                </div>
              </div>
              <div className="form-group">
                <label>Client Type *</label>
                <select name="type" required>
                  <option value="insurance_company">Insurance Company</option>
                  <option value="adjuster">Independent Adjuster</option>
                  <option value="property_owner">Property Owner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3"></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setClientModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Claim Modal */}
      {claimModalOpen && (
        <div className="modal active" onClick={(e) => { if (e.target.classList.contains('modal')) setClaimModalOpen(false); }}>
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Create New Claim</h2>
              <button className="btn-close" onClick={() => setClaimModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={handleClaimSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Claim Number *</label>
                  <input type="text" name="claimNumber" required />
                </div>
                <div className="form-group">
                  <label>Client *</label>
                  <select name="clientId" id="claim-client-select" required>
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c.clientId} value={c.clientId} data-name={c.companyName}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Insured Name *</label>
                  <input type="text" name="insuredName" required />
                </div>
                <div className="form-group">
                  <label>Property Address *</label>
                  <input type="text" name="propertyAddress" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loss Date *</label>
                  <input type="date" name="lossDate" required />
                </div>
                <div className="form-group">
                  <label>Loss Type *</label>
                  <select name="lossType" required>
                    <option value="">Select Type</option>
                    <option value="Fire">Fire</option>
                    <option value="Water Damage">Water Damage</option>
                    <option value="Wind Damage">Wind Damage</option>
                    <option value="Hail Damage">Hail Damage</option>
                    <option value="Mold">Mold</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority">
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Inspection Date</label>
                  <input type="date" name="inspectionDate" />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3"></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setClaimModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
