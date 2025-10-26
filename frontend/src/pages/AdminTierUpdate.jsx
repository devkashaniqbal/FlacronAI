import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminTierUpdate = () => {
  const { user, token } = useAuth();
  const [selectedTier, setSelectedTier] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateTier = async () => {
    if (!user?.uid) {
      setMessage('Error: User ID not found');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          newTier: selectedTier
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Successfully upgraded to ${selectedTier} tier! Please refresh the page.`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '4rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '1rem', color: '#1f2937' }}>Admin: Update Tier</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Use this tool to manually update your tier after payment.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          Your User ID:
        </label>
        <input
          type="text"
          value={user?.uid || 'Loading...'}
          disabled
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: '#f9fafb',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          Select New Tier:
        </label>
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <option value="starter">Starter (Free)</option>
          <option value="professional">Professional ($39.99/month)</option>
          <option value="agency">Agency ($99.99/month)</option>
          <option value="enterprise">Enterprise ($499/month)</option>
        </select>
      </div>

      <button
        onClick={handleUpdateTier}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Updating...' : 'Update Tier'}
      </button>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '6px',
          background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        <strong>Note:</strong> This is a temporary admin tool. Once webhooks are working, tier updates will happen automatically after payment.
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <a href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>
    </div>
  );
};

export default AdminTierUpdate;
