import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamsAPI } from '../services/api';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const [status, setStatus] = useState('pending'); // pending | loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // Redirect to auth with redirect back here
      navigate(`/auth?redirect=/invite/${token}`, { replace: true });
      return;
    }
    if (status !== 'pending') return;

    const accept = async () => {
      setStatus('loading');
      try {
        const res = await teamsAPI.acceptInvite(token);
        await refreshProfile();
        setMessage(res.data?.message || 'You have joined the enterprise team!');
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'This invite link is invalid or has expired.');
        setStatus('error');
      }
    };

    accept();
  }, [authLoading, isAuthenticated, token, status]);

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invite</h1>

        {(status === 'pending' || status === 'loading') && (
          <>
            <p className="text-gray-500 text-sm mb-8">Processing your invitation...</p>
            <Loader className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-700 text-sm mb-6">{message}</p>
            <p className="text-gray-500 text-xs mb-6">
              Your account has been upgraded to Enterprise tier.
            </p>
            <button
              onClick={() => navigate('/enterprise-dashboard')}
              className="btn-primary w-full"
            >
              Go to Enterprise Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-700 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1 text-sm py-2">
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/contact')} className="btn-primary flex-1 text-sm py-2">
                Contact Support
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
