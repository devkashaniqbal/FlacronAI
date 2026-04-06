import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users, FileText, DollarSign, TrendingUp, Search, RefreshCw,
  Crown, ChevronDown, X, BarChart3, MessageSquare, Shield,
  Edit2, Check, Trash2, Mail, Download, Eye, CreditCard,
  AlertCircle, ExternalLink,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { salesAPI } from '../services/api';

const TIERS = ['starter', 'professional', 'agency', 'enterprise'];
const TIER_COLORS = {
  starter:      'bg-gray-100 text-gray-600 border-gray-200',
  professional: 'bg-blue-50 text-blue-600 border-blue-200',
  agency:       'bg-purple-50 text-purple-600 border-purple-200',
  enterprise:   'bg-orange-50 text-orange-600 border-orange-200',
};
const LEAD_STATUS_COLORS = {
  new:       'bg-blue-50 text-blue-600 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  qualified: 'bg-purple-50 text-purple-600 border-purple-200',
  converted: 'bg-green-50 text-green-600 border-green-200',
  closed:    'bg-gray-100 text-gray-500 border-gray-200',
};

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '—' : typeof n === 'number' ? n.toLocaleString() : n;
const fmtMoney = (n) => n == null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function exportCSV(users) {
  const header = ['Email', 'Name', 'Plan', 'Reports Total', 'Reports MTD', 'Joined'];
  const rows = users.map(u => [
    u.email, u.displayName || '', u.tier,
    u.reportsGenerated, u.reportsThisMonth,
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'flacronai-users.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── sub-components ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function TierBadge({ tier }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${TIER_COLORS[tier] || TIER_COLORS.starter}`}>
      {tier}
    </span>
  );
}

function TierEditor({ uid, email, currentTier, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSelect = async (tier) => {
    if (tier === currentTier) { setOpen(false); return; }
    setLoading(true);
    try {
      await salesAPI.updateUserTier(email, tier);
      onUpdated(uid, tier);
      toast.success(`${email} → ${tier}`);
    } catch { toast.error('Failed to update tier'); }
    finally { setLoading(false); setOpen(false); }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(o => !o)} disabled={loading}
        className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize transition-opacity ${TIER_COLORS[currentTier] || TIER_COLORS.starter} ${loading ? 'opacity-50' : 'hover:opacity-75 cursor-pointer'}`}>
        {loading ? '…' : currentTier}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {TIERS.map(t => (
            <button key={t} onClick={() => handleSelect(t)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 capitalize ${t === currentTier ? 'text-orange-500 bg-orange-50/50' : 'text-gray-700'}`}>
              {t} {t === currentTier && <Check className="w-3 h-3 inline ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── User Detail Slide-over ─────────────────────────────────────────────────────
function UserSlideOver({ user, onClose, onDeleted }) {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      salesAPI.getUserReports(user.uid),
      salesAPI.getUserBilling(user.uid),
    ]).then(([r, b]) => {
      setReports(r.data.reports || []);
      setBilling(b.data.billing || null);
    }).catch(() => toast.error('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.email} and all their reports? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await salesAPI.deleteUser(user.uid);
      toast.success('User deleted');
      onDeleted(user.uid);
      onClose();
    } catch { toast.error('Failed to delete user'); }
    finally { setDeleting(false); }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}>
        <motion.div className="w-full max-w-lg bg-white border-l border-[#e5e7eb] h-full overflow-y-auto flex flex-col"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-500">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.displayName || '—'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb] shrink-0">
            {[
              { label: 'Plan', value: <TierBadge tier={user.tier} /> },
              { label: 'Reports Total', value: user.reportsGenerated },
              { label: 'Reports MTD', value: user.reportsThisMonth },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3 text-center">
                <div className="text-sm font-semibold text-gray-900">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 p-4 border-b border-[#e5e7eb] shrink-0">
            <button onClick={() => setShowEmailModal(true)}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl border border-[#e5e7eb] hover:bg-gray-50 transition-colors text-gray-700">
              <Mail className="w-4 h-4" /> Email User
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-red-500 disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting…' : 'Delete User'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e7eb] shrink-0">
            {[{ id: 'reports', label: 'Reports', icon: FileText }, { id: 'billing', label: 'Billing', icon: CreditCard }].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${tab === id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>
            ) : tab === 'reports' ? (
              reports.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No reports generated yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#e5e7eb] hover:bg-gray-50">
                      <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-orange-500 truncate">{r.claimNumber}</p>
                        <p className="text-xs text-gray-500">{r.lossType} · {r.lossDate ? new Date(r.lossDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Billing tab
              billing ? (
                <div className="space-y-4">
                  {billing.subscription ? (
                    <div className="rounded-xl border border-[#e5e7eb] p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Active Subscription</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Status</span>
                          <span className={`font-semibold ${billing.subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>{billing.subscription.status}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold text-gray-900">{fmtMoney(billing.subscription.amount)}/{billing.subscription.interval}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Renews</span><span className="text-gray-700">{new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()}</span></div>
                        {billing.subscription.cancelAtPeriodEnd && <p className="text-xs text-amber-600 font-medium">⚠ Cancels at period end</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#e5e7eb] p-4 text-sm text-gray-500">No active subscription</div>
                  )}
                  {billing.invoices?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Invoices</p>
                      <div className="space-y-2">
                        {billing.invoices.map(inv => (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-[#e5e7eb] text-sm">
                            <div>
                              <p className="text-gray-900 font-medium">{fmtMoney(inv.amount)}</p>
                              <p className="text-xs text-gray-400">{new Date(inv.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${inv.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{inv.status}</span>
                              {inv.pdf && <a href={inv.pdf} target="_blank" rel="noreferrer" className="p-1 hover:bg-gray-100 rounded"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /></a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No billing data — free plan user</p>
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>

      {showEmailModal && (
        <EmailModal to={user.email} onClose={() => setShowEmailModal(false)} />
      )}
    </AnimatePresence>
  );
}

// ── Email Modal ────────────────────────────────────────────────────────────────
function EmailModal({ to, onClose }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await salesAPI.sendUserEmail({ to, subject, message });
      toast.success(`Email sent to ${to}`);
      onClose();
    } catch { toast.error('Failed to send email'); }
    finally { setSending(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Email User</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
            <p className="text-sm text-gray-900 mt-1 font-mono">{to}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</label>
            <input className="w-full mt-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Subject line…" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</label>
            <textarea className="w-full mt-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[140px] resize-none"
              placeholder="Write your message…" value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={sending}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Email'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium border border-[#e5e7eb] rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Lead Note Editor ───────────────────────────────────────────────────────────
function LeadNoteEditor({ lead, onSave, onCancel }) {
  const [notes, setNotes] = useState(lead.notes || '');
  return (
    <div className="flex items-center gap-1">
      <input autoFocus
        className="text-xs border border-orange-300 rounded-lg px-2 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-orange-400"
        value={notes} onChange={e => setNotes(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(notes); if (e.key === 'Escape') onCancel(); }} />
      <button onClick={() => onSave(notes)} className="p-1 hover:bg-green-50 rounded text-green-600"><Check className="w-3.5 h-3.5" /></button>
      <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // full list for CSV export
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  // Leads
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsStatus, setLeadsStatus] = useState('');
  const [editingLead, setEditingLead] = useState(null);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

  // Guard
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.email !== ADMIN_EMAIL) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate, ADMIN_EMAIL]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setUserSearch(userSearchInput); setUserPage(1); }, 400);
    return () => clearTimeout(t);
  }, [userSearchInput]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { const res = await salesAPI.getAdminStats(); setStats(res.data.stats); }
    catch { toast.error('Failed to load stats'); }
    finally { setStatsLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await salesAPI.getAdminUsers({ search: userSearch, tier: userTierFilter, page: userPage, limit: 50 });
      setUsers(res.data.data);
      setUserTotal(res.data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  }, [userSearch, userTierFilter, userPage]);

  const fetchAllUsersForExport = async () => {
    try {
      const res = await salesAPI.getAdminUsers({ limit: 200, page: 1 });
      exportCSV(res.data.data);
    } catch { toast.error('Export failed'); }
  };

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try { const res = await salesAPI.getLeads({ status: leadsStatus, limit: 100 }); setLeads(res.data.data || []); }
    catch { toast.error('Failed to load leads'); }
    finally { setLeadsLoading(false); }
  }, [leadsStatus]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);
  useEffect(() => { if (tab === 'leads') fetchLeads(); }, [tab, fetchLeads]);

  const handleTierUpdated = (uid, newTier) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, tier: newTier } : u));
    if (selectedUser?.uid === uid) setSelectedUser(u => ({ ...u, tier: newTier }));
  };

  const handleUserDeleted = (uid) => {
    setUsers(prev => prev.filter(u => u.uid !== uid));
    setUserTotal(t => t - 1);
    if (stats) setStats(s => ({ ...s, totalUsers: s.totalUsers - 1 }));
  };

  const handleLeadUpdate = async (id, updates) => {
    try {
      await salesAPI.updateLead(id, updates);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      setEditingLead(null);
      toast.success('Lead updated');
    } catch { toast.error('Failed to update lead'); }
  };

  if (authLoading || !user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Owner Panel</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Platform-wide overview — FlacronAI</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-[#e5e7eb] rounded-xl bg-white hover:bg-gray-50 transition-colors text-gray-700">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#e5e7eb] rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users',    label: 'Customers', icon: Users },
            { id: 'leads',    label: 'Leads', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === id ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse" />)}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Total Users" value={fmt(stats.totalUsers)} icon={Users} color="bg-blue-50 text-blue-500" />
                  <StatCard label="Paid Users" value={fmt(stats.paidUsers)} sub={`${stats.totalUsers ? Math.round(stats.paidUsers / stats.totalUsers * 100) : 0}% conversion`} icon={Crown} color="bg-orange-50 text-orange-500" />
                  <StatCard label="Est. MRR" value={fmtMoney(stats.mrr)} sub="Based on tier counts" icon={DollarSign} color="bg-green-50 text-green-600" />
                  <StatCard label="Stripe (30d)" value={stats.stripeRevenue30d != null ? fmtMoney(stats.stripeRevenue30d) : 'N/A'} sub="Collected payments" icon={TrendingUp} color="bg-purple-50 text-purple-600" />
                  <StatCard label="Total Reports" value={fmt(stats.totalReports)} icon={FileText} color="bg-gray-100 text-gray-600" />
                  <StatCard label="Reports This Month" value={fmt(stats.reportsThisMonth)} icon={BarChart3} color="bg-yellow-50 text-yellow-600" />
                  <StatCard label="Total Leads" value={fmt(stats.totalLeads)} icon={MessageSquare} color="bg-pink-50 text-pink-500" />
                  <StatCard label="New Leads (MTD)" value={fmt(stats.newLeadsThisMonth)} icon={TrendingUp} color="bg-indigo-50 text-indigo-500" />
                </div>
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Users by Plan</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {TIERS.map(t => (
                      <div key={t} className="rounded-xl border border-[#e5e7eb] p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.tierCounts[t] || 0}</p>
                        <TierBadge tier={t} />
                        {t !== 'starter' && (
                          <p className="text-xs text-gray-400 mt-1">
                            {fmtMoney((stats.tierCounts[t] || 0) * { professional: 39.99, agency: 99.99, enterprise: 499 }[t])}/mo
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">Failed to load stats. Make sure ADMIN_EMAIL is set correctly.</div>
            )}
          </motion.div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full pl-10 pr-4 py-2 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Search by email or name…" value={userSearchInput} onChange={e => setUserSearchInput(e.target.value)} />
              </div>
              <select className="text-sm border border-[#e5e7eb] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={userTierFilter} onChange={e => { setUserTierFilter(e.target.value); setUserPage(1); }}>
                <option value="">All Plans</option>
                {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <button onClick={fetchAllUsersForExport}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-[#e5e7eb] rounded-xl bg-white hover:bg-gray-50 transition-colors text-gray-700">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={fetchUsers}
                className="flex items-center gap-2 text-sm font-medium px-3 py-2 border border-[#e5e7eb] rounded-xl bg-white hover:bg-gray-50 transition-colors text-gray-700">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#e5e7eb]">
                <p className="text-sm font-medium text-gray-700">{userTotal} customers</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] bg-gray-50">
                      {['User', 'Plan', 'Reports Total', 'Reports MTD', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i} className="border-b border-[#e5e7eb]">
                          {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-200 animate-pulse w-24" /></td>)}
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u.uid} className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(u)}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{u.displayName || '—'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <TierEditor uid={u.uid} email={u.email} currentTier={u.tier} onUpdated={handleTierUpdated} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{u.reportsGenerated}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{u.reportsThisMonth}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedUser(u)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View details">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => { setSelectedUser(u); setTimeout(() => {}, 50); }}
                              className="p-1.5 hover:bg-blue-50 rounded-lg" title="Email user"
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}>
                              <Mail className="w-4 h-4 text-blue-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {userTotal > 50 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e7eb]">
                  <p className="text-sm text-gray-500">Page {userPage} · {userTotal} total</p>
                  <div className="flex gap-2">
                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                      className="text-sm font-medium px-3 py-1.5 border border-[#e5e7eb] rounded-lg disabled:opacity-30 hover:bg-gray-50">Previous</button>
                    <button onClick={() => setUserPage(p => p + 1)} disabled={users.length < 50}
                      className="text-sm font-medium px-3 py-1.5 border border-[#e5e7eb] rounded-lg disabled:opacity-30 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── LEADS ── */}
        {tab === 'leads' && (
          <motion.div key="leads" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex gap-3 mb-4">
              <select className="text-sm border border-[#e5e7eb] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={leadsStatus} onChange={e => setLeadsStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {['new', 'contacted', 'qualified', 'converted', 'closed'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button onClick={fetchLeads}
                className="flex items-center gap-2 text-sm font-medium px-3 py-2 border border-[#e5e7eb] rounded-xl bg-white hover:bg-gray-50 transition-colors text-gray-700">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] bg-gray-50">
                      {['Name', 'Email', 'Company', 'Status', 'Received', 'Notes / Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leadsLoading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-[#e5e7eb]">
                          {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-200 animate-pulse w-24" /></td>)}
                        </tr>
                      ))
                    ) : leads.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">No leads yet</td></tr>
                    ) : leads.map(l => (
                      <tr key={l.id} className="border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{l.name}</p>
                          {l.phone && <p className="text-xs text-gray-400">{l.phone}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{l.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{l.company || '—'}</td>
                        <td className="px-4 py-3">
                          <select value={l.status} onChange={e => handleLeadUpdate(l.id, { status: e.target.value })}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${LEAD_STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {['new', 'contacted', 'qualified', 'converted', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {editingLead === l.id ? (
                            <LeadNoteEditor lead={l} onSave={(notes) => handleLeadUpdate(l.id, { notes })} onCancel={() => setEditingLead(null)} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500 truncate max-w-[140px]">{l.notes || l.message || '—'}</p>
                              <button onClick={() => setEditingLead(l.id)} className="p-1 hover:bg-gray-100 rounded shrink-0">
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* User slide-over */}
      <AnimatePresence>
        {selectedUser && (
          <UserSlideOver
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onDeleted={handleUserDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
