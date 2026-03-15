import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Zap, FileText, BarChart3, Users, Settings, Globe, Code2,
  Download, RefreshCw, Search, Plus, Trash2, Copy, Check,
  TrendingUp, Shield, Star, X, ChevronRight, ExternalLink, Key,
  Crown, CreditCard, Upload, Eye, AlertCircle, CheckCircle,
  Edit2, UserPlus, UserX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { reportsAPI, usersAPI, whiteLabelAPI, teamsAPI } from '../services/api.js';

// ── Quick Demos ───────────────────────────────────────────────────────────────
const QUICK_DEMOS = [
  { emoji: '💧', label: 'Water', claimNumber: 'CLM-2024-WD-001', insuredName: 'John & Mary Smith', propertyAddress: '1425 Maple Street, Austin TX 78701', lossDate: '2024-01-15', lossType: 'Water Damage', reportType: 'Initial', lossDescription: 'Upstairs bathroom supply line failed overnight.', damagesObserved: 'Ceiling collapse in kitchen below, hardwood buckling.', propertyDetails: '2-story residential, 2,400 sq ft, built 2005.' },
  { emoji: '🔥', label: 'Fire', claimNumber: 'CLM-2024-FD-002', insuredName: 'Robert Chen', propertyAddress: '892 Oak Avenue, Dallas TX 75201', lossDate: '2024-02-03', lossType: 'Fire Damage', reportType: 'Initial', lossDescription: 'Kitchen fire started from stovetop grease ignition.', damagesObserved: 'Full kitchen destruction, smoke throughout home.', propertyDetails: 'Single-story ranch, 1,800 sq ft, built 1998.' },
  { emoji: '🌪️', label: 'Wind', claimNumber: 'CLM-2024-WH-003', insuredName: 'Patricia Williams', propertyAddress: '3301 Pine Road, Houston TX 77001', lossDate: '2024-03-12', lossType: 'Wind/Hail Damage', reportType: 'Initial', lossDescription: 'Severe thunderstorm with hail caused roof damage.', damagesObserved: 'Roof shingles stripped, gutters destroyed, 3 windows broken.', propertyDetails: 'Two-story colonial, 3,100 sq ft, built 2012.' },
  { emoji: '🔨', label: 'Vandalism', claimNumber: 'CLM-2024-VD-004', insuredName: 'Marcus Thompson', propertyAddress: '5521 Cedar Lane, San Antonio TX 78201', lossDate: '2024-04-10', lossType: 'Vandalism', reportType: 'Initial', lossDescription: 'Property broken into while owners on vacation.', damagesObserved: 'Graffiti on walls, smashed windows, stolen appliances.', propertyDetails: 'Single-story residential, 1,600 sq ft, built 2010.' },
];

const FORM_INIT = { claimNumber: '', insuredName: '', propertyAddress: '', lossDate: '', lossType: 'Water Damage', reportType: 'Initial', propertyDetails: '', lossDescription: '', damagesObserved: '', recommendations: '', additionalNotes: '' };
const LOSS_TYPES = ['Water Damage','Fire Damage','Wind/Hail Damage','Vandalism','Theft','Flood','Earthquake','Smoke Damage','Vehicle Impact','Other'];
const REPORT_TYPES = ['Initial','Supplemental','Final','Re-inspection','Catastrophe'];
const GEN_STEPS = ['Analyzing claim data…','Running AI vision on photos…','Generating report via IBM WatsonX…','Scoring & finalizing…'];

const ROLE_COLORS = {
  owner:  'bg-orange-100 text-orange-700 border border-orange-200',
  admin:  'bg-blue-100 text-blue-700 border border-blue-200',
  editor: 'bg-violet-100 text-violet-700 border border-violet-200',
  viewer: 'bg-gray-100 text-gray-600 border border-gray-200',
};
const ROLE_PERMS = {
  admin:  ['Generate reports', 'Export all formats', 'Manage team', 'White-label settings'],
  editor: ['Generate reports', 'Export all formats'],
  viewer: ['View reports only'],
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#e5e7eb] rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-8 ${color}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
          : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50 hover:border-orange-100'
      }`}>
      <item.icon className="w-4 h-4 shrink-0" />
      {item.label}
      {item.badge && (
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-600'}`}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EnterpriseDashboard() {
  const { user, userProfile, tier, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tier && tier !== 'enterprise') {
      toast.error('Enterprise portal requires Enterprise tier');
      navigate('/dashboard');
    }
  }, [tier, navigate]);

  const [activeView, setActiveView] = useState('overview');

  // Report generation state
  const [form, setForm] = useState(FORM_INIT);
  const [photos, setPhotos] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef();

  // Reports list state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, apiCalls: 0, qualityAvg: 0 });

  // White-label state
  const [wlConfig, setWlConfig] = useState({ companyName: '', subdomain: '', reportFooter: '', supportEmail: '', primaryColor: '#f97316', hideFlacronBranding: false });
  const [wlLoading, setWlLoading] = useState(false);
  const [wlSaving, setWlSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef();

  // Team state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [editingRole, setEditingRole] = useState(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await reportsAPI.getAll({ limit: 50 });
      const list = res.data.data || res.data.reports || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setReports(arr);
      const now = new Date();
      const thisMonth = arr.filter(r => {
        const d = new Date(r.createdAt || r.generatedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      const quals = arr.filter(r => r.qualityScore).map(r => r.qualityScore);
      setStats(s => ({ ...s, total: arr.length, thisMonth, qualityAvg: quals.length ? Math.round(quals.reduce((a, b) => a + b, 0) / quals.length) : 0 }));
    } catch { toast.error('Failed to load reports'); }
    finally { setReportsLoading(false); }
  }, []);

  const fetchWlConfig = useCallback(async () => {
    setWlLoading(true);
    try {
      const res = await whiteLabelAPI.getConfig();
      if (res.data?.config) {
        const c = res.data.config;
        setWlConfig({ companyName: c.companyName || '', subdomain: c.subdomain || '', reportFooter: c.reportFooter || '', supportEmail: c.emailFromAddress || '', primaryColor: c.primaryColor || '#f97316', hideFlacronBranding: c.hideFlacronBranding || false });
      }
    } catch { /* no config yet */ }
    finally { setWlLoading(false); }
  }, []);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await teamsAPI.getMembers();
      setMembers(res.data?.members || []);
    } catch { /* optional */ }
    finally { setMembersLoading(false); }
  }, []);

  const fetchApiKeys = useCallback(async () => {
    setApiKeysLoading(true);
    try {
      const res = await usersAPI.getApiKeys();
      const keys = res.data?.apiKeys || res.data || [];
      setApiKeys(Array.isArray(keys) ? keys : []);
    } catch { /* optional */ }
    finally { setApiKeysLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); fetchWlConfig(); fetchMembers(); fetchApiKeys(); }, [fetchReports, fetchWlConfig, fetchMembers, fetchApiKeys]);

  // ── Report generation ─────────────────────────────────────────────────────
  const applyDemo = (d) => {
    const { emoji, label, ...fields } = d;
    setForm(prev => ({ ...prev, ...fields }));
    toast.success(`${label} template loaded!`);
  };

  const handleGenerate = async () => {
    if (!form.claimNumber || !form.insuredName) { toast.error('Claim Number and Insured Name are required'); return; }
    setGenerating(true); setGenStep(0); setGeneratedReport(null); setPdfUrl(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      photos.forEach(p => fd.append('images', p.file));
      const interval = setInterval(() => setGenStep(prev => Math.min(prev + 1, GEN_STEPS.length - 1)), 4000);
      const res = await reportsAPI.generate(fd);
      clearInterval(interval);
      const report = res.data.report || res.data;
      setGeneratedReport(report);
      setReports(prev => [report, ...prev]);
      refreshProfile();
      toast.success('Report generated!');
      autoPreviewPdf(report);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally { setGenerating(false); }
  };

  const autoPreviewPdf = async (report) => {
    if (!report?.id) return;
    setPdfLoading(true);
    try {
      const expRes = await reportsAPI.export(report.id, { format: 'pdf' });
      const { filename } = expRes.data;
      const fileRes = await reportsAPI.download(report.id, filename);
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (err) { console.warn('PDF preview failed:', err.message); }
    finally { setPdfLoading(false); }
  };

  const handleExport = async (reportId, format) => {
    try {
      const expRes = await reportsAPI.export(reportId, { format });
      const { filename } = expRes.data;
      const fileRes = await reportsAPI.download(reportId, filename);
      const mimes = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', html: 'text/html' };
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: mimes[format] }));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  // ── White-label ───────────────────────────────────────────────────────────
  const handleSaveWl = async () => {
    setWlSaving(true);
    try {
      await whiteLabelAPI.updateConfig({
        companyName: wlConfig.companyName,
        subdomain: wlConfig.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        reportFooter: wlConfig.reportFooter,
        emailFromAddress: wlConfig.supportEmail,
        primaryColor: wlConfig.primaryColor,
        hideFlacronBranding: wlConfig.hideFlacronBranding,
      });
      toast.success('White-label settings saved!');
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setWlSaving(false); }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData(); fd.append('logo', file);
      await whiteLabelAPI.uploadLogo(fd);
      toast.success('Logo uploaded!');
    } catch { toast.error('Logo upload failed'); }
    finally { setLogoUploading(false); }
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await whiteLabelAPI.preview();
      const url = window.URL.createObjectURL(new Blob([blob.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch { toast.error('Preview failed'); }
    finally { setPdfLoading(false); }
  };

  // ── Team management ───────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Enter an email address'); return; }
    setInviting(true);
    try {
      const res = await teamsAPI.invite(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteLink(res.data.inviteLink || '');
      setInviteEmail('');
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.error || 'Invite failed'); }
    finally { setInviting(false); }
  };

  const handleUpdateRole = async (memberId, role) => {
    try {
      await teamsAPI.updateRole(memberId, role);
      toast.success('Role updated');
      setEditingRole(null);
      fetchMembers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await teamsAPI.remove(memberId);
      toast.success('Member removed');
      fetchMembers();
    } catch { toast.error('Failed to remove member'); }
  };

  // ── API Keys ──────────────────────────────────────────────────────────────
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    setCreatingKey(true);
    try {
      const res = await usersAPI.createApiKey(newKeyName.trim());
      toast.success('API key created');
      setNewKeyName('');
      if (res.data?.key) { navigator.clipboard.writeText(res.data.key); toast.success("Key copied — save it now, it won't show again"); }
      fetchApiKeys();
    } catch { toast.error('Failed to create key'); }
    finally { setCreatingKey(false); }
  };

  // ── Nav ───────────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'overview',    label: 'Overview',       icon: BarChart3 },
    { id: 'generate',    label: 'Generate Report', icon: Zap },
    { id: 'reports',     label: 'My Reports',      icon: FileText, badge: stats.total || undefined },
    { id: 'whitelabel',  label: 'White-Label',     icon: Globe },
    { id: 'team',        label: 'Team',            icon: Users, badge: members.length || undefined },
    { id: 'api',         label: 'API & Keys',      icon: Code2 },
    { id: 'settings',    label: 'Settings',        icon: Settings },
  ];

  const filteredReports = reports.filter(r =>
    !search || [r.claimNumber, r.insuredName, r.lossType].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  // Shared input classes
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all';
  const selectCls = 'px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-all';
  const cardCls = 'bg-white border border-[#e5e7eb] rounded-2xl';

  return (
    <div className="min-h-screen flex bg-[#ffffff]">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#e5e7eb] bg-[#f8f8f8] sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/25">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">FlacronAI</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500 text-white uppercase tracking-wide">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavItem key={item.id} item={item} active={activeView === item.id}
              onClick={() => { setActiveView(item.id); if (item.id !== 'generate') setGeneratedReport(null); }} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#e5e7eb] space-y-2">
          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Standard Dashboard
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-[#e5e7eb]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xs font-black text-white shrink-0">
              {(user?.displayName || user?.email || 'E')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.displayName || 'Enterprise User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <Crown className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-black text-gray-900">{navItems.find(n => n.id === activeView)?.label}</h1>
            <p className="text-xs text-gray-400">Enterprise Portal · Unlimited Access</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-medium">WatsonX Online</span>
            </div>
            <button onClick={() => setActiveView('generate')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-sm shadow-orange-500/20">
              <Zap className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
            {activeView === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Reports" value={stats.total} sub="All time" icon={FileText} color="bg-gradient-to-br from-orange-500 to-amber-500" trend={12} />
                  <StatCard label="This Month" value={stats.thisMonth} sub="Unlimited cap" icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-cyan-500" trend={8} />
                  <StatCard label="Team Members" value={members.length + 1} sub="Including owner" icon={Users} color="bg-gradient-to-br from-violet-500 to-purple-600" />
                  <StatCard label="Avg Quality" value={stats.qualityAvg ? `${stats.qualityAvg}/100` : 'N/A'} sub="AI report score" icon={Shield} color="bg-gradient-to-br from-emerald-500 to-teal-500" trend={3} />
                </div>

                {/* Quick-action cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Zap, title: 'Generate Report', desc: 'AI-powered unlimited report generation with GPT-4 Vision', action: () => setActiveView('generate'), accent: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-500', chip: 'text-orange-600 bg-orange-100' },
                    { icon: Globe, title: 'White-Label Active', desc: 'Your brand on all reports, exports & portal', action: () => setActiveView('whitelabel'), accent: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-500', chip: 'text-blue-600 bg-blue-100' },
                    { icon: Users, title: 'Manage Team', desc: 'Invite members, set roles, control access', action: () => setActiveView('team'), accent: 'bg-violet-50 border-violet-200', iconBg: 'bg-violet-500', chip: 'text-violet-600 bg-violet-100' },
                  ].map(f => (
                    <motion.button key={f.title} onClick={f.action} whileHover={{ scale: 1.01 }}
                      className={`text-left p-5 rounded-2xl border ${f.accent} hover:shadow-md transition-all`}>
                      <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-3 shadow-sm`}>
                        <f.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{f.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Recent reports table */}
                <div className={`${cardCls} overflow-hidden`}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                    <p className="text-sm font-bold text-gray-900">Recent Reports</p>
                    <button onClick={() => setActiveView('reports')}
                      className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {reportsLoading ? (
                    <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 text-orange-500 animate-spin" /></div>
                  ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-400">No reports yet — generate your first one!</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] bg-gray-50">
                          {['Claim #','Insured','Loss Type','Date','Quality','Export'].map(h => (
                            <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reports.slice(0, 8).map((r, i) => (
                          <tr key={r.id || i} className="border-b border-[#e5e7eb] hover:bg-orange-50/30 transition-colors">
                            <td className="px-6 py-3 text-sm font-mono font-semibold text-orange-500">{r.claimNumber || '—'}</td>
                            <td className="px-6 py-3 text-sm text-gray-900">{r.insuredName || '—'}</td>
                            <td className="px-6 py-3 text-xs text-gray-500">{r.lossType || '—'}</td>
                            <td className="px-6 py-3 text-xs text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                            <td className="px-6 py-3">
                              {r.qualityScore
                                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.qualityScore}/100</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex gap-1">
                                {['pdf','docx'].map(f => (
                                  <button key={f} onClick={() => handleExport(r.id, f)}
                                    className="text-[10px] px-2 py-1 rounded-md bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-600 transition-colors uppercase font-bold">
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ GENERATE REPORT ═══════════════════════════════════════════════ */}
            {activeView === 'generate' && (
              <motion.div key="generate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {!generatedReport ? (
                  <div className="max-w-4xl">
                    <div className={`${cardCls} p-6`}>
                      {/* Quick demos */}
                      <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Demo:</p>
                        {QUICK_DEMOS.map(d => (
                          <button key={d.emoji} onClick={() => applyDemo(d)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-orange-50 hover:border-orange-300 text-xs text-gray-600 hover:text-orange-600 transition-all">
                            {d.emoji} {d.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {[
                          { label: 'Claim Number *', key: 'claimNumber', placeholder: 'CLM-2024-001' },
                          { label: 'Insured Name *', key: 'insuredName', placeholder: 'John Smith' },
                          { label: 'Date of Loss *', key: 'lossDate', type: 'date' },
                          { label: 'Property Address *', key: 'propertyAddress', placeholder: '123 Main St, City, ST' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{f.label}</label>
                            <input type={f.type || 'text'} value={form[f.key]}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.placeholder} className={inputCls} />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Loss Type</label>
                          <select value={form.lossType} onChange={e => setForm(p => ({ ...p, lossType: e.target.value }))}
                            className={`${selectCls} w-full`}>
                            {LOSS_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Report Type</label>
                          <select value={form.reportType} onChange={e => setForm(p => ({ ...p, reportType: e.target.value }))}
                            className={`${selectCls} w-full`}>
                            {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      {[
                        { label: 'Property Details', key: 'propertyDetails', placeholder: 'Construction type, sq ft, age, floors…' },
                        { label: 'Loss Description', key: 'lossDescription', placeholder: 'Describe what happened and when…' },
                        { label: 'Damages Observed', key: 'damagesObserved', placeholder: 'Room-by-room damage observations…' },
                        { label: 'Recommendations', key: 'recommendations', placeholder: 'Adjuster recommendations…' },
                      ].map(f => (
                        <div key={f.key} className="mb-3">
                          <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">{f.label}</label>
                          <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} rows={2}
                            className={`${inputCls} resize-none`} />
                        </div>
                      ))}

                      {/* Photos */}
                      <div className="mb-5">
                        <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Damage Photos (up to 100)</label>
                        <div onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center gap-3 border-2 border-dashed border-[#e5e7eb] rounded-xl py-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-400">Click to add photos {photos.length > 0 && `(${photos.length} added)`}</span>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                          onChange={e => { const arr = Array.from(e.target.files || []); setPhotos(prev => [...prev, ...arr.map(f => ({ file: f, url: URL.createObjectURL(f) }))]); }} />
                        {photos.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {photos.slice(0, 8).map((p, i) => (
                              <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#e5e7eb]">
                                <img src={p.url} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                            {photos.length > 8 && (
                              <div className="w-12 h-12 rounded-lg border border-[#e5e7eb] bg-gray-50 flex items-center justify-center text-xs text-gray-500">+{photos.length - 8}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {generating ? (
                        <div className="flex flex-col items-center py-8 gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                            <Zap className="w-7 h-7 text-orange-500 animate-pulse" />
                          </div>
                          <p className="text-base font-bold text-gray-900">Generating Report…</p>
                          <div className="w-full max-w-sm space-y-2">
                            {GEN_STEPS.map((s, i) => (
                              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                                i < genStep ? 'bg-green-50 text-green-700 border border-green-200' :
                                i === genStep ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                'bg-gray-50 text-gray-400 border border-gray-200'
                              }`}>
                                {i < genStep
                                  ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  : i === genStep
                                    ? <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
                                    : <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleGenerate} disabled={!form.claimNumber || !form.insuredName}
                          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                          <Zap className="w-5 h-5" /> Generate Report with AI — No Watermark
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className={`${cardCls} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-sm font-bold text-gray-900">PDF Preview</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {generatedReport.qualityScore && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                Quality {generatedReport.qualityScore}/100
                              </span>
                            )}
                            <button onClick={() => autoPreviewPdf(generatedReport)} disabled={pdfLoading}
                              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-gray-500 hover:text-gray-900 hover:border-gray-300 flex items-center gap-1.5 transition-colors">
                              <RefreshCw className={`w-3 h-3 ${pdfLoading ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                          </div>
                        </div>
                        {pdfLoading && !pdfUrl ? (
                          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-xl border border-[#e5e7eb]">
                            <RefreshCw className="w-7 h-7 text-orange-500 animate-spin" />
                          </div>
                        ) : pdfUrl ? (
                          <iframe src={pdfUrl} className="w-full rounded-xl border border-[#e5e7eb]" style={{ height: 780 }} title="PDF Preview" />
                        ) : (
                          <div className="flex flex-col items-center py-16 gap-3 rounded-xl border-2 border-dashed border-[#e5e7eb]">
                            <FileText className="w-10 h-10 text-gray-300" />
                            <button onClick={() => autoPreviewPdf(generatedReport)} className="text-sm text-orange-500 hover:text-orange-600 font-medium">Load PDF Preview</button>
                          </div>
                        )}
                      </div>
                      <details className={`${cardCls} p-4`}>
                        <summary className="text-sm font-semibold text-gray-700 cursor-pointer select-none">Raw Report Content</summary>
                        <pre className="mt-3 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed overflow-auto max-h-96 font-mono">{generatedReport.content}</pre>
                      </details>
                    </div>
                    <div className="space-y-4">
                      <div className={`${cardCls} p-4 space-y-2`}>
                        <p className="text-sm font-bold text-gray-900 mb-3">Export</p>
                        {['pdf', 'docx', 'html'].map(f => (
                          <button key={f} onClick={() => handleExport(generatedReport.id, f)}
                            className="w-full flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-orange-50 hover:border-orange-300 text-sm text-gray-700 hover:text-orange-600 transition-all">
                            <Download className="w-4 h-4" /> Download {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setGeneratedReport(null); setPdfUrl(null); setForm(FORM_INIT); setPhotos([]); }}
                        className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" /> Generate Another
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ REPORTS ═══════════════════════════════════════════════════════ */}
            {activeView === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all" />
                  </div>
                  <button onClick={fetchReports}
                    className="p-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 transition-colors">
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${reportsLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => setActiveView('generate')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> New Report
                  </button>
                </div>
                <div className={`${cardCls} overflow-hidden`}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] bg-gray-50">
                        {['Claim #','Insured','Loss Type','Report Type','Date','Quality','Export'].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportsLoading
                        ? [...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-[#e5e7eb]">
                              {[...Array(7)].map((_, j) => (
                                <td key={j} className="px-5 py-3.5">
                                  <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                                </td>
                              ))}
                            </tr>
                          ))
                        : filteredReports.length === 0
                          ? <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No reports found</td></tr>
                          : filteredReports.map((r, i) => (
                              <tr key={r.id || i} className="border-b border-[#e5e7eb] hover:bg-orange-50/30 transition-colors">
                                <td className="px-5 py-3.5 text-sm font-mono font-semibold text-orange-500">{r.claimNumber || '—'}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-900">{r.insuredName || '—'}</td>
                                <td className="px-5 py-3.5 text-xs text-gray-500">{r.lossType || '—'}</td>
                                <td className="px-5 py-3.5 text-xs text-gray-500">{r.reportType || '—'}</td>
                                <td className="px-5 py-3.5 text-xs text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                                <td className="px-5 py-3.5">
                                  {r.qualityScore
                                    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.qualityScore}/100</span>
                                    : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex gap-1">
                                    {['pdf','docx','html'].map(f => (
                                      <button key={f} onClick={() => handleExport(r.id, f)}
                                        className="text-[10px] px-2 py-1 rounded-md bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-600 transition-colors uppercase font-bold">
                                        {f}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ══ WHITE-LABEL ════════════════════════════════════════════════════ */}
            {activeView === 'whitelabel' && (
              <motion.div key="wl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-5">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
                  <Crown className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-700">White-Label Active</p>
                    <p className="text-xs text-orange-600 mt-0.5">Your reports, exports & portal carry your branding. Changes apply to all future reports immediately.</p>
                  </div>
                </div>

                {wlLoading ? (
                  <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 text-orange-500 animate-spin" /></div>
                ) : (
                  <>
                    {/* Logo upload */}
                    <div className={`${cardCls} p-5`}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Logo</label>
                      <div className="flex items-center gap-4">
                        <div onClick={() => logoInputRef.current?.click()}
                          className="w-24 h-14 rounded-xl border-2 border-dashed border-[#e5e7eb] hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center cursor-pointer transition-colors">
                          {logoFile
                            ? <img src={URL.createObjectURL(logoFile)} alt="logo" className="w-full h-full object-contain rounded-xl p-1" />
                            : <Upload className="w-5 h-5 text-gray-400" />}
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); handleLogoUpload(f); } }} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Upload your logo</p>
                          <p className="text-xs text-gray-400">PNG, JPG, SVG — max 5MB. Appears on all PDF reports.</p>
                          {logoUploading && (
                            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Uploading…
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {[
                      { label: 'Company Name', key: 'companyName', placeholder: 'Your Company LLC' },
                      { label: 'Custom Subdomain', key: 'subdomain', placeholder: 'yourcompany (→ yourcompany.flacronai.com)' },
                      { label: 'Report Footer Text', key: 'reportFooter', placeholder: 'Prepared by Your Company | yourcompany.com' },
                      { label: 'Support Email', key: 'supportEmail', placeholder: 'support@yourcompany.com' },
                    ].map(f => (
                      <div key={f.key} className={`${cardCls} p-4`}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{f.label}</label>
                        <input value={wlConfig[f.key]} onChange={e => setWlConfig(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} className={inputCls} />
                      </div>
                    ))}

                    <div className={`${cardCls} p-4`}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Brand Color</label>
                      <div className="flex items-center gap-4">
                        <input type="color" value={wlConfig.primaryColor}
                          onChange={e => setWlConfig(p => ({ ...p, primaryColor: e.target.value }))}
                          className="w-12 h-12 rounded-xl border border-[#e5e7eb] cursor-pointer" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Primary Accent Color</p>
                          <p className="text-xs text-gray-400">{wlConfig.primaryColor} — used in PDF headers, covers & portal</p>
                        </div>
                      </div>
                    </div>

                    <div className={`${cardCls} p-4 flex items-center justify-between`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Hide FlacronAI Branding</p>
                        <p className="text-xs text-gray-400 mt-0.5">Remove "Generated by FlacronAI" from all PDFs and exports</p>
                      </div>
                      <button onClick={() => setWlConfig(p => ({ ...p, hideFlacronBranding: !p.hideFlacronBranding }))}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${wlConfig.hideFlacronBranding ? 'bg-orange-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${wlConfig.hideFlacronBranding ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleSaveWl} disabled={wlSaving}
                        className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                        {wlSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {wlSaving ? 'Saving…' : 'Save White-Label Settings'}
                      </button>
                      <button onClick={handlePreviewPdf} disabled={pdfLoading}
                        className="px-5 py-3 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 text-sm text-gray-700 font-semibold transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview PDF
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══ TEAM ══════════════════════════════════════════════════════════ */}
            {activeView === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-6">

                {/* Role guide */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ROLE_PERMS).map(([role, perms]) => (
                    <div key={role} className={`${cardCls} p-4`}>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[role]}`}>{role}</span>
                      <ul className="mt-3 space-y-1.5">
                        {perms.map(p => (
                          <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Invite form */}
                <div className={`${cardCls} p-5`}>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-orange-500" /> Invite Team Member
                  </h3>
                  <div className="flex gap-3">
                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      placeholder="colleague@yourcompany.com"
                      className={inputCls} />
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className={selectCls}>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={handleInvite} disabled={inviting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap">
                      {inviting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Invite
                    </button>
                  </div>

                  {inviteLink && (
                    <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-xs text-green-700 flex-1 truncate">Invite link: <span className="font-mono">{inviteLink}</span></p>
                      <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!'); }}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors">
                        <Copy className="w-3.5 h-3.5 text-green-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Members list */}
                <div className={`${cardCls} overflow-hidden`}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
                    <p className="text-sm font-bold text-gray-900">Team Members ({members.length + 1})</p>
                    <button onClick={fetchMembers} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${membersLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Owner row */}
                  <div className="flex items-center gap-4 px-5 py-4 border-b border-[#e5e7eb] bg-orange-50/30">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm font-black text-white shrink-0">
                      {(user?.displayName || user?.email || 'E')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS.owner}`}>Owner</span>
                    <span className="text-[10px] text-gray-400">You</span>
                  </div>

                  {membersLoading ? (
                    <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-orange-500 animate-spin" /></div>
                  ) : members.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">No team members yet. Invite someone above.</p>
                  ) : members.map(m => (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#e5e7eb] hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 border border-[#e5e7eb] flex items-center justify-center text-sm font-black text-gray-600 shrink-0">
                        {m.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{m.email}</p>
                        <p className="text-xs text-gray-400">Invited {new Date(m.invitedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {m.status}
                      </span>
                      {editingRole === m.id ? (
                        <div className="flex items-center gap-2">
                          <select defaultValue={m.role} onChange={e => handleUpdateRole(m.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-[#e5e7eb] bg-white text-xs text-gray-700 focus:outline-none">
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button onClick={() => setEditingRole(null)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-500'}`}>{m.role}</span>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => setEditingRole(editingRole === m.id ? null : m.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Change role">
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => handleRemoveMember(m.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                          <UserX className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ API & KEYS ═════════════════════════════════════════════════════ */}
            {activeView === 'api' && (
              <motion.div key="api" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-5">
                <div className={`${cardCls} p-5`}>
                  <h2 className="text-sm font-bold text-gray-900 mb-1">Create API Key</h2>
                  <p className="text-xs text-gray-400 mb-4">Keys grant full REST API access. Store them securely — only shown once.</p>
                  <div className="flex gap-3">
                    <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                      placeholder="Key name (e.g. Production Server)"
                      className={inputCls} />
                    <button onClick={handleCreateKey} disabled={creatingKey}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap">
                      {creatingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Key
                    </button>
                  </div>
                </div>

                <div className={`${cardCls} overflow-hidden`}>
                  <div className="px-5 py-4 border-b border-[#e5e7eb] bg-gray-50">
                    <p className="text-sm font-bold text-gray-900">Your API Keys ({apiKeys.length})</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {apiKeysLoading ? (
                      <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-orange-500 animate-spin" /></div>
                    ) : apiKeys.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">No API keys yet.</p>
                    ) : apiKeys.map(k => (
                      <div key={k.id} className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] bg-gray-50">
                        <Key className="w-4 h-4 text-orange-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{k.name || 'API Key'}</p>
                          <p className="text-xs text-gray-400 font-mono">{k.keyPrefix ? `${k.keyPrefix}••••••••` : '••••••••••••••••'}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {k.active !== false ? 'Active' : 'Revoked'}
                        </span>
                        <button onClick={async () => { await usersAPI.revokeApiKey(k.id); toast.success('Key revoked'); fetchApiKeys(); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${cardCls} p-5`}>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Start</h3>
                  <pre className="text-xs text-gray-600 bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto leading-relaxed font-mono">{`curl -X POST https://api.flacronai.com/api/reports/generate \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "claimNumber": "CLM-001", "insuredName": "John Smith",
        "propertyAddress": "123 Main St", "lossDate": "2024-01-15",
        "lossType": "Water Damage" }'`}</pre>
                  <a href="/docs/api" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    Full API docs <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}

            {/* ══ SETTINGS ══════════════════════════════════════════════════════ */}
            {activeView === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl space-y-3">
                {[
                  { icon: Shield, label: 'Security & Password', desc: 'Change password, manage 2FA', href: '/settings' },
                  { icon: CreditCard, label: 'Billing & Invoices', desc: 'View invoices, cancel or change plan', href: '/settings' },
                  { icon: Globe, label: 'White-Label Config', desc: 'Custom domain, logo & branding', action: () => setActiveView('whitelabel') },
                  { icon: Code2, label: 'API Keys', desc: 'Manage integration keys', action: () => setActiveView('api') },
                  { icon: Users, label: 'Team Management', desc: 'Invite & manage team members', action: () => setActiveView('team') },
                ].map(item => {
                  const cls = `w-full flex items-center gap-4 p-5 ${cardCls} hover:shadow-md hover:border-orange-200 transition-all text-left`;
                  const inner = (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </>
                  );
                  return item.href
                    ? <a key={item.label} href={item.href} className={cls}>{inner}</a>
                    : <button key={item.label} onClick={item.action} className={cls}>{inner}</button>;
                })}

                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Dedicated Success Manager</p>
                      <p className="text-xs text-gray-500 mt-0.5 mb-3 leading-relaxed">As an Enterprise customer, you have a dedicated account manager available 24/7 for onboarding, custom integrations and escalations.</p>
                      <a href="mailto:support@flacronenterprises.com"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors">
                        Contact Your Manager <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
