import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/styles.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Subscriptions = () => {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.subscriptions);
      } else {
        setError(result.error || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = filter === 'all'
    ? subscriptions
    : subscriptions.filter(sub => sub.tier === filter);

  const getTierBadgeClass = (tier) => {
    const classes = {
      professional: 'badge-professional',
      agency: 'badge-agency',
      enterprise: 'badge-enterprise'
    };
    return classes[tier] || 'badge-default';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'badge-success',
      canceling: 'badge-warning',
      canceled: 'badge-danger',
      past_due: 'badge-danger'
    };
    return classes[status] || 'badge-default';
  };

  const formatDate = (dateString) => {
    if (dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="subscriptions-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Subscription Management</h1>
          <p style={{ color: '#6b7280' }}>View and manage all active subscriptions</p>
        </div>
        <Link to="/crm" className="back-btn">← Back to CRM</Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Subscriptions</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{subscriptions.length}</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Professional</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {subscriptions.filter(s => s.tier === 'professional').length}
            </div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Agency</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {subscriptions.filter(s => s.tier === 'agency').length}
            </div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Enterprise</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
              {subscriptions.filter(s => s.tier === 'enterprise').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: filter === 'all' ? '2px solid #3b82f6' : '1px solid #d1d5db',
              background: filter === 'all' ? '#eff6ff' : 'white',
              color: filter === 'all' ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? '600' : '400'
            }}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('professional')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: filter === 'professional' ? '2px solid #3b82f6' : '1px solid #d1d5db',
              background: filter === 'professional' ? '#eff6ff' : 'white',
              color: filter === 'professional' ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: filter === 'professional' ? '600' : '400'
            }}
          >
            Professional ({subscriptions.filter(s => s.tier === 'professional').length})
          </button>
          <button
            onClick={() => setFilter('agency')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: filter === 'agency' ? '2px solid #8b5cf6' : '1px solid #d1d5db',
              background: filter === 'agency' ? '#f5f3ff' : 'white',
              color: filter === 'agency' ? '#8b5cf6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: filter === 'agency' ? '600' : '400'
            }}
          >
            Agency ({subscriptions.filter(s => s.tier === 'agency').length})
          </button>
          <button
            onClick={() => setFilter('enterprise')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: filter === 'enterprise' ? '2px solid #ec4899' : '1px solid #d1d5db',
              background: filter === 'enterprise' ? '#fdf2f8' : 'white',
              color: filter === 'enterprise' ? '#ec4899' : '#6b7280',
              cursor: 'pointer',
              fontWeight: filter === 'enterprise' ? '600' : '400'
            }}
          >
            Enterprise ({subscriptions.filter(s => s.tier === 'enterprise').length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div>Loading subscriptions...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSubscriptions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              No subscriptions found
            </div>
            <div>There are no active subscriptions to display.</div>
          </div>
        )}

        {/* Subscriptions Table */}
        {!loading && !error && filteredSubscriptions.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Plan</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Started</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.userId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{subscription.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: {subscription.userId.substring(0, 8)}...</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{subscription.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getTierBadgeClass(subscription.tier)}`} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {subscription.tier}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{subscription.amount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusBadgeClass(subscription.subscriptionStatus)}`} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {subscription.subscriptionStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(subscription.createdAt)}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(subscription.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .badge-professional {
          background: #eff6ff;
          color: #1e40af;
        }
        .badge-agency {
          background: #f5f3ff;
          color: #6d28d9;
        }
        .badge-enterprise {
          background: #fdf2f8;
          color: #be185d;
        }
        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge-default {
          background: #f3f4f6;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;
