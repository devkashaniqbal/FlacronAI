import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, Calendar, FileText, Plus, Search, X, Edit,
  Trash2, ChevronLeft, ChevronRight, Upload, Eye, CheckCircle,
  Clock, XCircle, AlertCircle, TrendingUp, Activity, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { crmAPI } from '../services/api';

const SIDEBAR_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'claims', label: 'Claims', icon: FileText },
];

const APPT_STATUSES = { scheduled: 'bg-orange-500/20 text-orange-400 border-orange-500/30', completed: 'bg-green-500/20 text-green-400 border-green-500/30', cancelled: 'bg-red-500/20 text-red-400 border-red-500/30' };
const CLAIM_STATUSES = ['open', 'in-progress', 'pending-review', 'closed'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function StatusPill({ status }) {
  const cls = APPT_STATUSES[status] || 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>{status}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function NewClientModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await crmAPI.createClient(form);
      toast.success('Client created'); onSaved();
    } catch { toast.error('Failed to create client'); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="New Client" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
        </div>
        <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
        <div><label className="label">Notes</label><textarea className="input min-h-[80px]" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? 'Creating...' : 'Create Client'}</button>
          <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function NewAppointmentModal({ clients, onClose, onSaved }) {
  const [form, setForm] = useState({ clientId: '', title: '', date: '', time: '', location: '', notes: '', status: 'scheduled' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await crmAPI.createAppointment(form);
      toast.success('Appointment scheduled'); onSaved();
    } catch { toast.error('Failed to schedule appointment'); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="New Appointment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Client</label>
          <select className="input" required value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
            <option value="">Select client...</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">Title</label><input className="input" required placeholder="e.g. Property Inspection" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Date</label><input type="date" className="input" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label className="label">Time</label><input type="time" className="input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
        </div>
        <div><label className="label">Location</label><input className="input" placeholder="Address or virtual link" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
        <div><label className="label">Notes</label><textarea className="input min-h-[70px]" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? 'Scheduling...' : 'Schedule'}</button>
          <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function NewClaimModal({ clients, onClose, onSaved }) {
  const [form, setForm] = useState({ clientId: '', claimNumber: '', lossType: 'Water Damage', lossDate: '', status: 'open', propertyAddress: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await crmAPI.createClaim(form);
      toast.success('Claim created'); onSaved();
    } catch { toast.error('Failed to create claim'); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="New Claim" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Client</label>
          <select className="input" required value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
            <option value="">Select client...</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Claim Number *</label><input className="input" required value={form.claimNumber} onChange={e => setForm(p => ({ ...p, claimNumber: e.target.value }))} /></div>
          <div><label className="label">Loss Date</label><input type="date" className="input" value={form.lossDate} onChange={e => setForm(p => ({ ...p, lossDate: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Loss Type</label>
            <select className="input" value={form.lossType} onChange={e => setForm(p => ({ ...p, lossType: e.target.value }))}>
              {['Water Damage', 'Fire', 'Wind', 'Hail', 'Mold', 'Vandalism', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Property Address</label><input className="input" value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} /></div>
        <div><label className="label">Notes</label><textarea className="input min-h-[70px]" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? 'Creating...' : 'Create Claim'}</button>
          <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function ClientSlideOver({ client, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!client) return;
    crmAPI.getClientReports(client._id).then(r => { setReports(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [client]);
  if (!client) return null;
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="w-full max-w-md bg-[#f8f8f8] border-l border-[#e5e7eb] h-full overflow-y-auto p-6"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{client.name}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="space-y-3 mb-6 text-sm">
          {[['Email', client.email], ['Phone', client.phone], ['Company', client.company], ['Address', client.address]].map(([l, v]) => v && (
            <div key={l} className="flex gap-3"><span className="text-gray-600 w-20">{l}:</span><span className="text-gray-900">{v}</span></div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Linked Reports</h3>
          {loading ? <div className="skeleton h-20 w-full" /> : reports.length === 0
            ? <p className="text-gray-500 text-sm">No reports linked.</p>
            : <div className="space-y-2">
                {reports.map(r => (
                  <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-200">
                    <div><p className="text-gray-900 text-sm font-mono">{r.claimNumber}</p><p className="text-gray-500 text-xs">{r.lossType}</p></div>
                    <span className="text-xs text-gray-600">{r.status}</span>
                  </div>
                ))}
              </div>}
        </div>
        {client.notes && <div className="mt-6"><h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3><p className="text-gray-600 text-sm">{client.notes}</p></div>}
      </motion.div>
    </motion.div>
  );
}

function CalendarGrid({ appointments, month, year, onPrev, onNext }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  const today = new Date();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
        <h3 className="text-gray-900 font-semibold">{MONTHS[month]} {year}</h3>
        <button onClick={onNext} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAppts = appointments.filter(a => a.date?.startsWith(dateStr));
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          return (
            <div key={i} className={`min-h-[60px] p-1 rounded-lg border transition-colors ${isToday ? 'border-orange-500/50 bg-orange-500/10' : 'border-transparent hover:bg-gray-100'}`}>
              <span className={`text-xs font-medium ${isToday ? 'text-orange-400' : 'text-gray-600'}`}>{day}</span>
              <div className="space-y-0.5 mt-0.5">
                {dayAppts.slice(0, 2).map((a, ai) => (
                  <div key={ai} className={`text-xs px-1 py-0.5 rounded truncate ${
                    a.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                    a.status === 'cancelled' ? 'bg-red-500/30 text-red-300' :
                    'bg-orange-500/30 text-blue-300'}`}>{a.title}</div>
                ))}
                {dayAppts.length > 2 && <div className="text-xs text-gray-500">+{dayAppts.length - 2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CRM() {
  const { tier } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [clients, setClients] = useState([]); const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [appointments, setAppointments] = useState([]); const [apptsLoading, setApptsLoading] = useState(false);
  const [claims, setClaims] = useState([]); const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimStatusFilter, setClaimStatusFilter] = useState('all');

  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [calView, setCalView] = useState('month');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const [csvImporting, setCsvImporting] = useState(false);
  const csvRef = useRef();

  const stats = {
    totalClients: clients.length,
    apptsThisWeek: appointments.filter(a => {
      const d = new Date(a.date); const now = new Date();
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
      return d >= weekStart && d <= weekEnd;
    }).length,
    openClaims: claims.filter(c => c.status === 'open' || c.status === 'in-progress').length,
    reportsThisMonth: claims.filter(c => {
      const d = new Date(c.createdAt); const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  const fetchAll = useCallback(async () => {
    setClientsLoading(true); setApptsLoading(true); setClaimsLoading(true);
    try {
      const [cl, ap, cr] = await Promise.all([crmAPI.getClients(), crmAPI.getAppointments(), crmAPI.getClaims()]);
      setClients(cl.data?.clients || cl.data || []);
      setAppointments(ap.data?.appointments || ap.data || []);
      setClaims(cr.data?.claims || cr.data || []);
    } catch { toast.error('Failed to load CRM data'); }
    finally { setClientsLoading(false); setApptsLoading(false); setClaimsLoading(false); }
  }, []);

  useEffect(() => { if (['agency', 'enterprise'].includes(tier)) fetchAll(); }, [tier, fetchAll]);

  const handleDeleteClient = async (id) => {
    try { await crmAPI.deleteClient(id); toast.success('Client deleted'); fetchAll(); } catch { toast.error('Delete failed'); }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean).slice(1);
      const parsed = lines.map(l => { const [name, email, phone, company] = l.split(',').map(s => s.trim()); return { name, email, phone, company }; }).filter(r => r.name);
      if (!parsed.length) { toast.error('No valid rows found in CSV'); return; }
      setCsvImporting(true);
      try {
        await Promise.all(parsed.map(c => crmAPI.createClient(c)));
        toast.success(`Imported ${parsed.length} clients`); fetchAll();
      } catch { toast.error('Some imports failed'); }
      finally { setCsvImporting(false); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredClaims = claimStatusFilter === 'all' ? claims : claims.filter(c => c.status === claimStatusFilter);

  if (!['agency', 'enterprise'].includes(tier)) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center card p-10 max-w-md">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">CRM Requires Agency Plan</h2>
            <p className="text-gray-600 text-sm mb-6">Upgrade to Agency or Enterprise to access the full CRM suite.</p>
            <button onClick={() => navigate('/pricing')} className="btn-primary">View Plans</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:flex flex-col border-r border-[#e5e7eb] bg-[#f8f8f8] px-4 py-6 gap-1">
          {SIDEBAR_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">CRM Dashboard</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-orange-400 bg-orange-500/10' },
                    { label: 'Appts This Week', value: stats.apptsThisWeek, icon: Calendar, color: 'text-amber-400 bg-amber-500/10' },
                    { label: 'Open Claims', value: stats.openClaims, icon: AlertCircle, color: 'text-red-400 bg-red-500/10' },
                    { label: 'Claims This Month', value: stats.reportsThisMonth, icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
                  ].map(s => (
                    <div key={s.label} className="card p-5">
                      <div className={`w-10 h-10 rounded-xl ${s.color.split(' ')[1]} flex items-center justify-center mb-3`}>
                        <s.icon className={`w-5 h-5 ${s.color.split(' ')[0]}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-gray-600 text-sm mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Activity</h3>
                    {clientsLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
                      : clients.slice(0, 5).map(c => (
                        <div key={c._id} className="flex items-center gap-3 py-2 border-b border-[#e5e7eb] last:border-0">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400">
                            {(c.name || 'C')[0].toUpperCase()}
                          </div>
                          <div><p className="text-gray-900 text-sm">{c.name}</p><p className="text-gray-500 text-xs">{c.email}</p></div>
                          <span className="ml-auto text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                  </div>
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Upcoming Appointments</h3>
                    {apptsLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
                      : appointments.filter(a => new Date(a.date) >= new Date()).slice(0, 5).map(a => (
                        <div key={a._id} className="flex items-center gap-3 py-2 border-b border-[#e5e7eb] last:border-0">
                          <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                          <div><p className="text-gray-900 text-sm">{a.title}</p><p className="text-gray-500 text-xs">{a.date} {a.time}</p></div>
                          <StatusPill status={a.status} />
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clients */}
            {activeTab === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                  <div className="flex gap-2">
                    <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    <button onClick={() => csvRef.current?.click()} disabled={csvImporting} className="btn-secondary text-sm py-2 px-3 flex items-center gap-2">
                      <Upload className="w-4 h-4" /> {csvImporting ? 'Importing...' : 'Import CSV'}
                    </button>
                    <button onClick={() => setShowNewClient(true)} className="btn-primary text-sm py-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> New Client
                    </button>
                  </div>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input className="input pl-10" placeholder="Search clients..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-[#e5e7eb]">
                      {['Name', 'Email', 'Phone', 'Company', 'Created', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {clientsLoading ? [...Array(5)].map((_, i) => (
                        <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>)}</tr>
                      )) : filteredClients.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-12 text-center">
                          <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-600">No clients found. Add your first client.</p>
                        </td></tr>
                      ) : filteredClients.map(c => (
                        <tr key={c._id} className="border-b border-[#e5e7eb] hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setSelectedClient(c)}>
                          <td className="px-4 py-3"><div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">{(c.name || 'C')[0].toUpperCase()}</div>
                            <span className="text-gray-900 text-sm font-medium">{c.name}</span>
                          </div></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{c.company}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <button onClick={() => setSelectedClient(c)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-600" /></button>
                              <button onClick={() => handleDeleteClient(c._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Appointments */}
            {activeTab === 'appointments' && (
              <motion.div key="appts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                  <div className="flex gap-2">
                    <div className="flex rounded-xl border border-[#e5e7eb] overflow-hidden">
                      {['month', 'week', 'list'].map(v => (
                        <button key={v} onClick={() => setCalView(v)}
                          className={`px-3 py-2 text-sm font-medium transition-colors ${calView === v ? 'bg-orange-500 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowNewAppt(true)} className="btn-primary text-sm py-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> New Appointment
                    </button>
                  </div>
                </div>
                <div className="card p-6">
                  {calView === 'month' && (
                    <CalendarGrid appointments={appointments} month={calMonth} year={calYear}
                      onPrev={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                      onNext={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} />
                  )}
                  {calView === 'week' && (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">Week view — showing all appointments this week:</p>
                      <div className="space-y-2">
                        {appointments.filter(a => {
                          const d = new Date(a.date); const now = new Date();
                          const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
                          const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
                          return d >= weekStart && d <= weekEnd;
                        }).map(a => (
                          <div key={a._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-100 border border-gray-200">
                            <div className="text-sm font-medium text-orange-400 w-24 shrink-0">{a.date}</div>
                            <div className="flex-1"><p className="text-gray-900 text-sm">{a.title}</p><p className="text-gray-500 text-xs">{a.location}</p></div>
                            <StatusPill status={a.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {calView === 'list' && (
                    <div className="space-y-2">
                      {apptsLoading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />) :
                        appointments.length === 0 ? (
                          <div className="text-center py-8"><Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-gray-600">No appointments yet.</p></div>
                        ) : appointments.map(a => (
                          <div key={a._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-100 border border-gray-200">
                            <div className="text-sm font-medium text-orange-400 w-32 shrink-0">{a.date} {a.time}</div>
                            <div className="flex-1"><p className="text-gray-900 text-sm font-medium">{a.title}</p><p className="text-gray-500 text-xs">{a.location}</p></div>
                            <StatusPill status={a.status} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Claims */}
            {activeTab === 'claims' && (
              <motion.div key="claims" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
                  <button onClick={() => setShowNewClaim(true)} className="btn-primary text-sm py-2 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Claim
                  </button>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['all', ...CLAIM_STATUSES].map(s => (
                    <button key={s} onClick={() => setClaimStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${claimStatusFilter === s ? 'bg-orange-500 text-gray-900' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-[#e5e7eb]">
                      {['Claim #', 'Client', 'Loss Type', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {claimsLoading ? [...Array(5)].map((_, i) => (
                        <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>)}</tr>
                      )) : filteredClaims.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-12 text-center">
                          <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-600">No claims found.</p>
                        </td></tr>
                      ) : filteredClaims.map(c => {
                        const client = clients.find(cl => cl._id === c.clientId);
                        return (
                          <tr key={c._id} className="border-b border-[#e5e7eb] hover:bg-gray-100">
                            <td className="px-4 py-3 text-sm font-mono text-orange-400">{c.claimNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{client?.name || c.clientId}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{c.lossType}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{c.lossDate}</td>
                            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              c.status === 'closed' ? 'bg-gray-500/20 text-gray-600' :
                              c.status === 'open' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'}`}>{c.status}</span></td>
                            <td className="px-4 py-3">
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-600" /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showNewClient && <NewClientModal onClose={() => setShowNewClient(false)} onSaved={() => { setShowNewClient(false); fetchAll(); }} />}
        {showNewAppt && <NewAppointmentModal clients={clients} onClose={() => setShowNewAppt(false)} onSaved={() => { setShowNewAppt(false); fetchAll(); }} />}
        {showNewClaim && <NewClaimModal clients={clients} onClose={() => setShowNewClaim(false)} onSaved={() => { setShowNewClaim(false); fetchAll(); }} />}
        {selectedClient && <ClientSlideOver client={selectedClient} onClose={() => setSelectedClient(null)} />}
      </AnimatePresence>
    </div>
  );
}
