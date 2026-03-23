import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText, Upload, ChevronRight, ChevronLeft, X, Download, RefreshCw,
  Search, Trash2, Eye, Lock, ExternalLink, BarChart3, Users,
  Zap, Clock, AlertCircle, CheckCircle, Settings,
  Star, Image as ImageIcon, CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TierBadge from '../components/TierBadge';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, paymentAPI } from '../services/api';
import api from '../services/api';

const LOSS_TYPES = ['Water Damage', 'Fire', 'Wind', 'Hail', 'Mold', 'Vandalism', 'Other'];
const REPORT_TYPES = ['Initial', 'Supplemental', 'Final', 'Re-Inspection'];
const STATUSES = ['All', 'completed', 'processing', 'failed', 'archived'];

const GENERATION_STEPS = [
  'Uploading photos...',
  'Analyzing images with GPT-4 Vision...',
  'Generating report with IBM WatsonX AI...',
  'Finalizing...',
];

const FORM_INITIAL = {
  claimNumber: '', insuredName: '', propertyAddress: '', lossDate: '',
  lossType: 'Water Damage', reportType: 'Initial', additionalNotes: '',
  propertyDetails: '', lossDescription: '', damagesObserved: '', recommendations: '',
};

const QUICK_DEMOS = [
  {
    label: 'Water Damage',
    icon: '💧',
    color: 'blue',
    data: {
      claimNumber: 'CLM-2024-WD-001',
      insuredName: 'John & Mary Smith',
      propertyAddress: '1425 Maple Street, Austin, TX 78701',
      lossDate: '2024-01-15',
      lossType: 'Water Damage',
      reportType: 'Initial',
      propertyDetails: '2-story single-family home, built in 1998, approximately 2,200 sq ft. Brick veneer exterior, wood frame construction. Features 3 bedrooms, 2.5 bathrooms. Recently renovated kitchen (2021). Attached 2-car garage.',
      lossDescription: 'Upstairs master bathroom supply line to toilet failed catastrophically overnight. Water flowed for an estimated 6–8 hours before discovered by homeowner in the morning. Water migrated through floor/ceiling assembly into the kitchen directly below and into the adjacent hallway.',
      damagesObserved: 'Master Bathroom: Saturated subfloor, buckled tile, damaged vanity base cabinet. Kitchen Ceiling: Complete collapse of 40 sq ft drywall section, water-stained remaining drywall. Kitchen Cabinets: Upper and lower cabinet faces warped. Hallway: Hardwood flooring cupped and warped approximately 85 sq ft. Garage Ceiling: Water staining visible on 20 sq ft of drywall.',
      recommendations: 'Immediate water extraction and drying required. Deploy industrial dehumidifiers and air movers for minimum 3-day drying period. Remove and replace all saturated drywall, subfloor, and flooring materials. Test for mold growth in wall cavities before closure. Replace failed supply line and inspect all other supply lines for similar wear.',
      additionalNotes: 'Homeowner has temporary housing covered under ALE. Mold assessment recommended given extended water exposure duration.',
    },
  },
  {
    label: 'Fire Damage',
    icon: '🔥',
    color: 'red',
    data: {
      claimNumber: 'CLM-2024-FD-042',
      insuredName: 'Robert & Lisa Chen',
      propertyAddress: '892 Oakwood Drive, Dallas, TX 75201',
      lossDate: '2024-02-03',
      lossType: 'Fire',
      reportType: 'Initial',
      propertyDetails: 'Single-story ranch-style home, built in 1985, approximately 1,850 sq ft. Brick exterior, wood frame. 3 bedrooms, 2 bathrooms. Original kitchen appliances. Asphalt shingle roof approximately 12 years old.',
      lossDescription: 'Fire originated in the kitchen due to unattended cooking on the stovetop. Fire spread to adjacent cabinetry and ceiling before being extinguished by local fire department. Significant smoke and soot damage throughout the home. Fire department responded within 8 minutes. Water used in suppression caused additional damage.',
      damagesObserved: 'Kitchen: Total loss — all cabinetry, appliances, ceiling, and walls. Dining Room: Heavy smoke/soot on all surfaces, ceiling damaged. Living Room: Moderate smoke damage, ceiling soot. Master Bedroom: Light smoke odor, soot on surfaces. HVAC System: Smoke infiltrated ductwork throughout home. Exterior Soffit: Charring on approx 15 linear feet adjacent to kitchen vent.',
      recommendations: 'Full contents pack-out recommended. HVAC system cleaning and inspection required. Structural assessment of kitchen ceiling joists before reconstruction. Soot and smoke remediation for all affected rooms. Kitchen requires complete gut and rebuild. Odor treatment with ozone or hydroxyl generator for entire structure.',
      additionalNotes: 'Fire marshal report obtained. Cause determined accidental. Family displaced — ALE applicable. Smoke damage to contents throughout home.',
    },
  },
  {
    label: 'Wind / Hail',
    icon: '🌪️',
    color: 'gray',
    data: {
      claimNumber: 'CLM-2024-WH-118',
      insuredName: 'Patricia Johnson',
      propertyAddress: '3301 Elm Creek Blvd, San Antonio, TX 78230',
      lossDate: '2024-03-22',
      lossType: 'Hail',
      reportType: 'Initial',
      propertyDetails: 'Two-story colonial-style home, built in 2005, approximately 3,100 sq ft. Stucco exterior, wood frame construction. 4 bedrooms, 3 bathrooms. Composition shingle roof — original, approximately 19 years old. Attached 3-car garage. Covered back patio.',
      lossDescription: 'Severe hailstorm with golf-ball sized hail (1.75 inch diameter per NOAA report) impacted the property on March 22, 2024. Storm lasted approximately 25 minutes. Wind gusts recorded at 58 mph. Storm resulted in damage to roofing, gutters, siding, and exterior fixtures.',
      damagesObserved: 'Roof: Functional total loss — hail impact damage to 100% of shingles, granule loss, bruising visible on all slopes. Gutters and Downspouts: Dented and separated from fascia on all 4 elevations. Front Elevation Stucco: Impact cracking visible in 12 locations. HVAC Condenser: Fins flattened on condenser coil — efficiency impaired. Skylights: 2 of 3 skylights cracked. Garage Door: Significant denting on all 3 panels.',
      recommendations: 'Full roof replacement — 4,200 sq ft including ice/water shield and synthetic underlayment. Replace all gutters and downspouts. Stucco repair and paint to match. HVAC condenser coil replacement. Replace all 3 skylight units. Replace 3 garage door panels. Supplement for permits and code upgrades as required.',
      additionalNotes: 'NOAA storm report obtained confirming hail size. Photos document hail hits on soft metals. Recommend 8-point test for shingle bruising confirmation.',
    },
  },
  {
    label: 'Vandalism',
    icon: '🔨',
    color: 'purple',
    data: {
      claimNumber: 'CLM-2024-VN-007',
      insuredName: 'Marcus & Elena Rodriguez',
      propertyAddress: '5520 Pine Ridge Lane, Houston, TX 77056',
      lossDate: '2024-04-10',
      lossType: 'Vandalism',
      reportType: 'Initial',
      propertyDetails: 'Single-story residential home, built in 2010, approximately 2,000 sq ft. Stucco and stone exterior. 3 bedrooms, 2 bathrooms. Attached 2-car garage. Property was unoccupied for 2 weeks while owners were traveling.',
      lossDescription: 'Property was broken into while owners were on vacation. Unknown perpetrators forced entry through rear sliding glass door and side garage door. Extensive vandalism and malicious destruction throughout the interior. Police report filed — case number HPD-2024-04-10-5520. No arrests made at time of inspection.',
      damagesObserved: 'Rear Sliding Door: Shattered — frame bent and glass destroyed. Garage Side Door: Forced entry — frame split, door damaged beyond repair. Living Room: Spray paint graffiti on 3 walls, ceiling fan destroyed. Kitchen: Cabinetry doors ripped from hinges, countertop cracked. Master Bedroom: Mirrored closet doors shattered, carpet stained. All Bathrooms: Fixtures damaged, mirrors broken. Interior Paint: Graffiti on walls throughout — all rooms affected.',
      recommendations: 'Board up and secure all entry points immediately. Document all damage with photographs before any cleanup. Replace sliding glass door assembly. Replace garage side door and reinforce frame. Full interior repaint after graffiti remediation. Replace damaged cabinetry hardware and doors. Professional carpet cleaning or replacement. Replace all broken fixtures and mirrors.',
      additionalNotes: 'Police report obtained and attached. Coordinate with insurer on coverage for malicious mischief endorsement. Owners request expedited processing due to security concerns.',
    },
  },
];

const LS_KEY = 'flacron_dashboard_form';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-500/20 text-gray-600 border-gray-500/30'}`}>
      {status}
    </span>
  );
}

function ReportDetailModal({ report, onClose }) {
  if (!report) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}>
        <motion.div className="card w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Claim Number', report.claimNumber],
              ['Insured', report.insuredName],
              ['Property', report.propertyAddress],
              ['Loss Date', report.lossDate],
              ['Loss Type', report.lossType],
              ['Report Type', report.reportType],
              ['Status', report.status],
              ['Created', new Date(report.createdAt).toLocaleString()],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-600 w-32 shrink-0">{label}:</span>
                <span className="text-gray-900">{val}</span>
              </div>
            ))}
            {report.qualityScore && (
              <div className="flex gap-3">
                <span className="text-gray-600 w-32 shrink-0">Quality Score:</span>
                <span className="text-orange-400 font-semibold">{report.qualityScore}/100</span>
              </div>
            )}
          </div>
          {report.content && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Report Content</h3>
              <div className="bg-black/30 rounded-xl p-4 text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {report.content}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              onClick={async () => {
                try {
                  const exportRes = await reportsAPI.export(report.id, { format: 'pdf' });
                  const { filename } = exportRes.data;
                  const fileRes = await api.get(
                    `/reports/${report.id}/download?file=${filename}`,
                    { responseType: 'blob' }
                  );
                  const url = window.URL.createObjectURL(new Blob([fileRes.data]));
                  const a = document.createElement('a');
                  a.href = url; a.download = filename; a.click();
                  window.URL.revokeObjectURL(url);
                } catch { toast.error('Export failed'); }
              }}>
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="btn-secondary text-sm py-2 px-4" onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const { user, userProfile, tier, canGenerate, reportsRemaining, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect post-payment redirect from Stripe and show confirmation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upgrade') === 'success') {
      const upgradedTier = params.get('tier');
      // Clean the query string immediately so a page refresh doesn't re-toast
      navigate('/dashboard', { replace: true });

      // Poll until Firestore reflects the new tier (Stripe webhook may lag a few seconds)
      let attempts = 0;
      const maxAttempts = 6;
      const poll = async () => {
        attempts++;
        const profile = await refreshProfile();
        const currentTier = profile?.tier || 'starter';
        if (!upgradedTier || currentTier === upgradedTier || attempts >= maxAttempts) {
          toast.success(
            upgradedTier
              ? `Plan upgraded to ${upgradedTier.charAt(0).toUpperCase() + upgradedTier.slice(1)}! Welcome aboard.`
              : 'Plan upgraded successfully!'
          );
        } else {
          setTimeout(poll, 2000);
        }
      };
      setTimeout(poll, 1500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeView, setActiveView] = useState('generate');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(FORM_INITIAL);
  const [photos, setPhotos] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailReport, setDetailReport] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const fileInputRef = useRef();
  const autoSaveRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) { try { setForm(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [form]);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await reportsAPI.getAll(params);
      setReports(res.data.data || res.data.reports || res.data || []);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / 10) || 1);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (activeView === 'reports') fetchReports();
    if (activeView === 'billing') fetchBilling();
  }, [activeView, fetchReports]);

  const handlePhotoAdd = (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (photos.length + arr.length > 100) {
      toast.error('Maximum 100 photos allowed');
      return;
    }
    const previews = arr.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setPhotos(prev => [...prev, ...previews]);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handlePhotoAdd(e.dataTransfer.files);
  };

  const removePhoto = (idx) => {
    setPhotos(prev => { const next = [...prev]; URL.revokeObjectURL(next[idx].url); next.splice(idx, 1); return next; });
  };

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error('You have reached your monthly report limit'); return; }
    setGenerating(true);
    setGenStep(0);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(p => fd.append('images', p.file));

      const stepInterval = setInterval(() => {
        setGenStep(prev => Math.min(prev + 1, GENERATION_STEPS.length - 1));
      }, 4000);

      const res = await reportsAPI.generate(fd);
      clearInterval(stepInterval);
      setGenStep(GENERATION_STEPS.length - 1);
      const report = res.data.report || res.data;
      setGeneratedReport(report);
      setForm(FORM_INITIAL);
      setPhotos([]);
      setStep(1);
      localStorage.removeItem(LS_KEY);
      toast.success('Report generated successfully!');
      // Refresh usage count in sidebar immediately
      refreshProfile();
      // Prepend to reports list so My Reports shows it right away
      setReports(prev => [report, ...prev]);
      // Auto-load PDF preview
      autoPreviewPDF(report);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!generatedReport) return;
    try {
      const exportRes = await reportsAPI.export(generatedReport.id, { format });
      const { filename } = exportRes.data;
      const fileRes = await api.get(
        `/reports/${generatedReport.id}/download?file=${filename}`,
        { responseType: 'blob' }
      );
      const mimeTypes = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', html: 'text/html' };
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: mimeTypes[format] || 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  const autoPreviewPDF = async (report) => {
    if (!report?.id) return;
    setPreviewing(true);
    try {
      const exportRes = await reportsAPI.export(report.id, { format: 'pdf' });
      const { filename } = exportRes.data;
      const fileRes = await api.get(
        `/reports/${report.id}/download?file=${filename}&inline=true`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: 'application/pdf' }));
      setPdfPreviewUrl(url);
    } catch (err) {
      console.warn('Auto PDF preview failed:', err.message);
    } finally { setPreviewing(false); }
  };

  const handlePreviewPDF = async () => {
    if (!generatedReport) return;
    setPreviewing(true);
    try {
      const exportRes = await reportsAPI.export(generatedReport.id, { format: 'pdf' });
      const { filename } = exportRes.data;
      const fileRes = await api.get(
        `/reports/${generatedReport.id}/download?file=${filename}&inline=true`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([fileRes.data], { type: 'application/pdf' }));
      if (pdfPreviewUrl) window.URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(url);
    } catch { toast.error('Preview failed'); }
    finally { setPreviewing(false); }
  };

  const handleDeleteReport = async (id) => {
    try {
      await reportsAPI.delete(id, true);
      toast.success('Report deleted');
      fetchReports();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map(id => reportsAPI.delete(id, true)));
      toast.success(`Deleted ${selectedIds.length} reports`);
      setSelectedIds([]);
      fetchReports();
    } catch { toast.error('Bulk delete failed'); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const TIER_LIMITS = { starter: 5, professional: 50, agency: 200, enterprise: -1 };
  const TIER_EXPORTS = { starter: ['pdf'], professional: ['pdf', 'docx', 'html'], agency: ['pdf', 'docx', 'html'], enterprise: ['pdf', 'docx', 'html'] };
  const allowedExports = TIER_EXPORTS[tier] || ['pdf'];
  const tierLimit = TIER_LIMITS[tier] ?? 1;
  const usedThisMonth = userProfile?.reportsThisMonth || 0;
  const usagePercent = tierLimit === -1 ? 0 : Math.min(100, Math.round((usedThisMonth / tierLimit) * 100));

  const fetchBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await paymentAPI.getSubscription();
      setBillingInfo(res.data?.subscription || res.data || null);
    } catch { /* billing optional */ }
    finally { setBillingLoading(false); }
  };

  const navLinks = [
    { id: 'generate', label: 'Generate Report', icon: Zap },
    { id: 'reports', label: 'My Reports', icon: FileText },
    ...(tier === 'agency' || tier === 'enterprise' ? [{ id: 'crm', label: 'CRM', icon: Users, href: '/crm' }] : []),
    { id: 'billing', label: 'Usage & Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    ...(tier === 'enterprise' ? [{ id: 'enterprise', label: 'Enterprise Portal', icon: ExternalLink, href: '/enterprise-dashboard' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-[#e5e7eb] bg-[#f8f8f8] px-3 py-5 gap-4">

          {/* Profile Card */}
          <div className="rounded-2xl overflow-hidden border border-[#e5e7eb] bg-white">
            {/* Banner */}
            <div className="h-16 relative" style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,.15) 8px, rgba(255,255,255,.15) 16px)' }} />
              {/* Avatar */}
              <div className="absolute -bottom-5 left-4">
                {userProfile?.logoUrl
                  ? <img src={userProfile.logoUrl} alt="avatar"
                      className="w-11 h-11 rounded-xl border-2 border-white object-cover shadow-sm" />
                  : (
                    <div className="w-11 h-11 rounded-xl border-2 border-white shadow-sm bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                      {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )
                }
              </div>
              {/* Tier pill */}
              <div className="absolute top-2.5 right-2.5">
                <TierBadge tier={tier} />
              </div>
            </div>

            {/* Info */}
            <div className="pt-7 px-4 pb-4">
              <p className="text-gray-900 font-bold text-sm leading-tight">
                {userProfile?.displayName || 'Welcome Back'}
              </p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{user?.email}</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-2 text-center">
                  <p className="text-orange-500 font-bold text-base leading-none">{usedThisMonth}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5 leading-none">This month</p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2 text-center">
                  <p className="text-gray-700 font-bold text-base leading-none">
                    {(userProfile?.reportsGenerated || 0)}
                  </p>
                  <p className="text-gray-400 text-[10px] mt-0.5 leading-none">Total reports</p>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Monthly limit</span>
                  <span className="font-semibold text-gray-500">
                    {usedThisMonth} / {tierLimit === -1 ? '∞' : tierLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-orange-500'
                  }`} style={{ width: `${tierLimit === -1 ? 0 : usagePercent}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {reportsRemaining === -1 ? 'Unlimited' : `${reportsRemaining} remaining`}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {navLinks.map(link => (
              <button key={link.id}
                onClick={() => link.href ? navigate(link.href) : setActiveView(link.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeView === link.id
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
                }`}>
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
              </button>
            ))}
          </nav>

          {/* Upgrade CTA */}
          {tier === 'starter' && (
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
              <p className="text-xs font-bold text-gray-800 mb-0.5">Unlock More Reports</p>
              <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                Starter plan: {tierLimit} report/mo with watermark. Upgrade for more.
              </p>
              <button onClick={() => navigate('/pricing')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <Star className="w-3 h-3" /> Upgrade Plan
              </button>
            </div>
          )}
          {tier === 'professional' && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-[10px] font-semibold text-blue-700 mb-2">Professional Plan</p>
              <button onClick={() => navigate('/pricing')}
                className="w-full border border-blue-200 text-blue-600 hover:bg-blue-100 text-xs font-medium py-1.5 rounded-lg transition-colors">
                View Agency Plan
              </button>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">

          {/* Mobile usage bar — visible only below md (sidebar is hidden there) */}
          <div className="md:hidden border-b border-[#e5e7eb] bg-[#f8f8f8] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                  {userProfile?.displayName || 'Dashboard'}
                </span>
                <TierBadge tier={tier} />
              </div>
              <span className="text-xs font-semibold text-gray-600 shrink-0">
                {reportsRemaining === -1 ? '∞ remaining' : `${reportsRemaining} / ${tierLimit} left`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-orange-500'
                }`}
                style={{ width: `${tierLimit === -1 ? 0 : usagePercent}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'generate' && (
              <motion.div key="generate" className="p-6 max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

                {tier === 'starter' && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">Starter plan reports include a FlacronAI watermark. <button onClick={() => navigate('/pricing')} className="underline font-semibold text-orange-600 hover:text-orange-700">Upgrade</button> to remove.</p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
                    <p className="text-gray-600 text-sm mt-1">AI-powered insurance claim report generation</p>
                  </div>
                  {generatedReport && (
                    <button onClick={() => setGeneratedReport(null)} className="btn-secondary text-sm py-2 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> New Report
                    </button>
                  )}
                </div>

                {!generatedReport ? (
                  <div className="grid grid-cols-1 gap-6">
                    {/* Step Progress */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className="flex items-center gap-1">
                          <button onClick={() => setStep(s)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              step >= s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}>{s}</button>
                          {s < 5 && <div className={`h-0.5 w-8 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                        </div>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {['Claim Info', 'Property', 'Loss Details', 'Photos', 'Review'][step - 1]}
                      </span>
                    </div>

                    <div className="card p-6">
                      <AnimatePresence mode="wait">
                        {/* ── STEP 1: Claim Info ── */}
                        {step === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-5">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-gray-900">Claim Information</h2>
                              <span className="text-xs text-gray-500">Step 1 of 5</span>
                            </div>

                            {/* Quick Demo Buttons */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Demo Templates</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {QUICK_DEMOS.map(demo => (
                                  <button key={demo.label}
                                    onClick={() => { setForm(prev => ({ ...prev, ...demo.data })); toast.success(`${demo.label} template loaded!`); }}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-500/5 transition-all text-center group">
                                    <span className="text-2xl">{demo.icon}</span>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-orange-500">{demo.label}</span>
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1.5">Click a template to auto-fill all fields for a demo report</p>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="label">Claim Number *</label>
                                  <input className="input" placeholder="e.g. CLM-2024-001"
                                    value={form.claimNumber} onChange={e => setForm(p => ({ ...p, claimNumber: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="label">Insured Name *</label>
                                  <input className="input" placeholder="Full name of insured"
                                    value={form.insuredName} onChange={e => setForm(p => ({ ...p, insuredName: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="label">Loss Date *</label>
                                  <input type="date" className="input" value={form.lossDate}
                                    onChange={e => setForm(p => ({ ...p, lossDate: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="label">Loss Type *</label>
                                  <select className="input" value={form.lossType}
                                    onChange={e => setForm(p => ({ ...p, lossType: e.target.value }))}>
                                    {LOSS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="label">Report Type</label>
                                  <select className="input" value={form.reportType}
                                    onChange={e => setForm(p => ({ ...p, reportType: e.target.value }))}>
                                    {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ── STEP 2: Property Details ── */}
                        {step === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
                              <span className="text-xs text-gray-500">Step 2 of 5</span>
                            </div>
                            <div>
                              <label className="label">Property Address *</label>
                              <input className="input" placeholder="Full street address, city, state, zip"
                                value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label">Property Description</label>
                              <textarea className="input min-h-[160px] resize-y"
                                placeholder="Describe the property — e.g.: 2-story single-family home, built in 1998, approx 2,200 sq ft. Brick veneer exterior, wood frame. 3 bedrooms, 2.5 bathrooms. Recently renovated kitchen..."
                                value={form.propertyDetails} onChange={e => setForm(p => ({ ...p, propertyDetails: e.target.value }))} />
                              <p className="text-xs text-gray-400 mt-1">Include construction type, age, size, number of rooms, and any relevant features</p>
                            </div>
                          </motion.div>
                        )}

                        {/* ── STEP 3: Loss Details ── */}
                        {step === 3 && (
                          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-gray-900">Loss Details</h2>
                              <span className="text-xs text-gray-500">Step 3 of 5</span>
                            </div>
                            <div>
                              <label className="label">Description of Loss</label>
                              <textarea className="input min-h-[130px] resize-y"
                                placeholder="Describe how and when the loss occurred — e.g.: Upstairs bathroom supply line failed overnight, water flowed approximately 6–8 hours before discovered. Water migrated through floor into kitchen below..."
                                value={form.lossDescription} onChange={e => setForm(p => ({ ...p, lossDescription: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label">Damages Observed</label>
                              <textarea className="input min-h-[130px] resize-y"
                                placeholder="List damages room by room — e.g.: Master Bath: saturated subfloor, buckled tile, damaged vanity. Kitchen ceiling: 40 sq ft collapse. Hallway: hardwood flooring cupped, 85 sq ft..."
                                value={form.damagesObserved} onChange={e => setForm(p => ({ ...p, damagesObserved: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label">Recommendations</label>
                              <textarea className="input min-h-[110px] resize-y"
                                placeholder="Enter your repair recommendations — e.g.: Immediate water extraction required. Deploy dehumidifiers for 3-day drying period. Remove all saturated drywall. Test for mold growth before closing wall cavities..."
                                value={form.recommendations} onChange={e => setForm(p => ({ ...p, recommendations: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label">Additional Notes</label>
                              <textarea className="input min-h-[80px] resize-y"
                                placeholder="Any other notes, policy information, or special circumstances..."
                                value={form.additionalNotes} onChange={e => setForm(p => ({ ...p, additionalNotes: e.target.value }))} />
                            </div>
                          </motion.div>
                        )}

                        {/* ── STEP 4: Photos ── */}
                        {step === 4 && (
                          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h2 className="text-lg font-semibold text-gray-900">Upload Photos</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Optional — AI will analyze damage photos</p>
                              </div>
                              <span className="text-sm text-gray-500">{photos.length} / 100</span>
                            </div>
                            <div
                              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                                dragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-500/5'
                              }`}
                              onDragOver={e => { e.preventDefault(); setDragging(true); }}
                              onDragLeave={() => setDragging(false)}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}>
                              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-700 font-medium">Drag & drop damage photos here</p>
                              <p className="text-gray-500 text-sm mt-1">or click to browse — up to 100 photos, 10MB each</p>
                              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                                onChange={e => handlePhotoAdd(e.target.files)} />
                            </div>
                            {photos.length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                                {photos.map((p, i) => (
                                  <div key={i} className="relative group aspect-square">
                                    <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                                    <button onClick={() => removePhoto(i)}
                                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* ── STEP 5: Review & Generate ── */}
                        {step === 5 && (
                          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">Review & Generate</h2>
                              <span className="text-xs text-gray-500">Step 5 of 5</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                              {[
                                ['Claim Number', form.claimNumber],
                                ['Insured Name', form.insuredName],
                                ['Property Address', form.propertyAddress],
                                ['Loss Date', form.lossDate],
                                ['Loss Type', form.lossType],
                                ['Report Type', form.reportType],
                                ['Photos', `${photos.length} uploaded`],
                                ['Property Description', form.propertyDetails ? '✓ Provided' : 'Not provided'],
                                ['Loss Description', form.lossDescription ? '✓ Provided' : 'Not provided'],
                                ['Damages Observed', form.damagesObserved ? '✓ Provided' : 'Not provided'],
                                ['Recommendations', form.recommendations ? '✓ Provided' : 'Not provided'],
                              ].map(([label, val]) => (
                                <div key={label} className="flex gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                  <span className="text-gray-500 text-xs w-36 shrink-0 pt-0.5">{label}</span>
                                  <span className={`text-sm font-medium ${val?.startsWith('✓') ? 'text-green-600' : 'text-gray-900'}`}>{val || '—'}</span>
                                </div>
                              ))}
                            </div>
                            {!canGenerate && (
                              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex gap-2 items-center mb-4">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                You have used all your monthly reports. <button onClick={() => navigate('/pricing')} className="underline font-semibold ml-1">Upgrade to continue</button>
                              </div>
                            )}
                            {tier === 'starter' && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex gap-2 items-center mb-3">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                Starter plan: PDF only with FlacronAI watermark. <button onClick={() => navigate('/pricing')} className="underline font-semibold ml-1">Upgrade to remove</button>
                              </div>
                            )}
                            <button onClick={handleGenerate} disabled={!canGenerate || generating || !form.claimNumber || !form.insuredName}
                              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base">
                              <Zap className="w-5 h-5" /> Generate Report with AI
                            </button>
                            {(!form.claimNumber || !form.insuredName) && (
                              <p className="text-xs text-red-400 mt-2 text-center">Claim Number and Insured Name are required</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
                          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-30">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        {step < 5 && (
                          <button onClick={() => setStep(s => Math.min(5, s + 1))}
                            className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                            Next <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Generating State */}
                <AnimatePresence>
                  {generating && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="card p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-orange-400 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Your Report</h2>
                        <p className="text-gray-600 text-sm mb-6">Please wait while our AI processes your claim...</p>
                        <div className="space-y-3">
                          {GENERATION_STEPS.map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              i < genStep ? 'bg-green-500/10 text-green-400' :
                              i === genStep ? 'bg-orange-500/10 text-orange-400' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {i < genStep ? <CheckCircle className="w-4 h-4 shrink-0" /> :
                               i === genStep ? <RefreshCw className="w-4 h-4 shrink-0 animate-spin" /> :
                               <Clock className="w-4 h-4 shrink-0" />}
                              <span className="text-sm font-medium">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generated Report Preview */}
                {generatedReport && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">

                      {/* PDF View — shown first, auto-loaded */}
                      <div className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" />
                            <h2 className="text-sm font-semibold text-gray-900">PDF Preview</h2>
                          </div>
                          <div className="flex items-center gap-2">
                            {generatedReport.qualityScore && (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                Quality {generatedReport.qualityScore}/100
                              </span>
                            )}
                            <button onClick={handlePreviewPDF} disabled={previewing}
                              className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50">
                              {previewing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                              Refresh
                            </button>
                            {pdfPreviewUrl && (
                              <button onClick={() => { window.URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </div>

                        {previewing && !pdfPreviewUrl && (
                          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50 rounded-xl border border-gray-200">
                            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Rendering PDF...</p>
                          </div>
                        )}

                        {pdfPreviewUrl && (
                          <iframe
                            src={pdfPreviewUrl}
                            className="w-full rounded-xl border border-gray-200"
                            style={{ height: '780px' }}
                            title="PDF Preview"
                          />
                        )}

                        {!previewing && !pdfPreviewUrl && (
                          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <FileText className="w-10 h-10 text-gray-300" />
                            <p className="text-sm text-gray-400">PDF preview failed to load</p>
                            <button onClick={handlePreviewPDF}
                              className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> Load PDF Preview
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Raw content collapsible */}
                      <details className="card p-4">
                        <summary className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                          Raw Report Content
                        </summary>
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap font-mono">
                          {generatedReport.content || 'Report content generated successfully.'}
                        </div>
                      </details>
                    </div>

                    <div className="space-y-4">
                      <div className="card p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Options</h3>
                        <div className="space-y-2">
                          {['pdf', 'docx', 'html'].map(fmt => {
                            const allowed = allowedExports.includes(fmt);
                            return allowed ? (
                              <button key={fmt} onClick={() => handleExport(fmt)}
                                className="w-full btn-secondary text-sm py-2 flex items-center gap-2 justify-center">
                                <Download className="w-4 h-4" /> Download {fmt.toUpperCase()}
                              </button>
                            ) : (
                              <button key={fmt} onClick={() => navigate('/pricing')}
                                className="w-full text-sm py-2 flex items-center gap-2 justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors">
                                <Lock className="w-3.5 h-3.5" /> {fmt.toUpperCase()} — Upgrade
                              </button>
                            );
                          })}
                        </div>
                        {tier === 'starter' && (
                          <p className="text-[10px] text-gray-400 mt-2 text-center">DOCX & HTML require Professional+</p>
                        )}
                      </div>
                      {generatedReport.aiModel && (
                        <div className="card p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Model Used</h3>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">
                            {generatedReport.aiModel}
                          </span>
                        </div>
                      )}
                      <div className="card p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                        <button onClick={() => { setGeneratedReport(null); setPdfPreviewUrl(null); setStep(1); }}
                          className="w-full btn-primary text-sm py-2 flex items-center gap-2 justify-center">
                          <Zap className="w-4 h-4" /> Generate New Report
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeView === 'reports' && (
              <motion.div key="reports" className="p-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                    <p className="text-gray-600 text-sm mt-1">View and manage all generated reports</p>
                  </div>
                  {selectedIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="btn-danger text-sm py-2 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input className="input pl-10" placeholder="Search by claim number or insured name..."
                      value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                  </div>
                  <select className="input w-auto" value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e5e7eb]">
                          <th className="px-4 py-3 text-left w-10">
                            <input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? reports.map(r => r.id) : [])}
                              checked={selectedIds.length === reports.length && reports.length > 0} />
                          </th>
                          {['Claim #', 'Insured', 'Date', 'Loss Type', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportsLoading ? (
                          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                        ) : reports.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-16 text-center">
                              <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                              <p className="text-gray-600 font-medium">No reports found</p>
                              <p className="text-gray-600 text-sm mt-1">Generate your first report to get started</p>
                              <button onClick={() => setActiveView('generate')} className="btn-primary text-sm py-2 px-4 mt-4 inline-flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Generate Report
                              </button>
                            </td>
                          </tr>
                        ) : reports.map(r => (
                          <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="border-b border-[#e5e7eb] hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => setDetailReport(r)}>
                            <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(r.id); }}>
                              <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-orange-400">{r.claimNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{r.insuredName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{r.lossDate ? new Date(r.lossDate).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{r.lossType}</td>
                            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <button onClick={() => setDetailReport(r)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => handleDeleteReport(r.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e7eb]">
                      <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                          className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                          className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-30">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── BILLING VIEW ── */}
            {activeView === 'billing' && (
              <motion.div key="billing" className="p-6 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Usage & Billing</h1>
                  <p className="text-gray-500 text-sm mt-1">Track your report usage and manage your plan</p>
                </div>

                {/* Usage Card */}
                <div className="card p-6 mb-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">This Month's Usage</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'Reports Used', value: usedThisMonth, color: 'text-orange-500' },
                      { label: 'Reports Limit', value: tierLimit === -1 ? '∞' : tierLimit, color: 'text-gray-900' },
                      { label: 'Remaining', value: reportsRemaining === -1 ? '∞' : reportsRemaining, color: 'text-green-600' },
                      { label: 'Current Plan', value: tier.charAt(0).toUpperCase() + tier.slice(1), color: 'text-blue-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>Usage</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                      style={{ width: `${usagePercent}%` }} />
                  </div>
                  {usagePercent >= 80 && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ You are approaching your monthly limit</p>
                  )}
                </div>

                {/* Current Plan */}
                <div className="card p-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Current Plan</h2>
                      <p className="text-2xl font-bold text-orange-500 mt-1">{tier.charAt(0).toUpperCase() + tier.slice(1)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {tierLimit === -1 ? 'Unlimited reports per month' : `${tierLimit} report${tierLimit !== 1 ? 's' : ''} per month`}
                      </p>
                    </div>
                    {billingLoading ? (
                      <div className="skeleton h-8 w-32" />
                    ) : billingInfo ? (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${
                          billingInfo.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{billingInfo.status || 'Active'}</span>
                        {billingInfo.currentPeriodEnd && (
                          <p className="text-xs text-gray-400 mt-1">Renews {new Date(billingInfo.currentPeriodEnd * 1000).toLocaleDateString()}</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {tier !== 'enterprise' && (
                    <button onClick={() => navigate('/pricing')}
                      className="mt-4 btn-primary text-sm py-2 px-4 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Upgrade Plan
                    </button>
                  )}
                </div>

                {/* Billing History placeholder */}
                <div className="card p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Billing History</h2>
                  {billingLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No billing history yet</p>
                      <p className="text-gray-400 text-xs mt-1">Invoices will appear here once you subscribe to a paid plan</p>
                      <button onClick={() => navigate('/pricing')} className="mt-4 btn-secondary text-sm py-2 px-4">
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ReportDetailModal report={detailReport} onClose={() => setDetailReport(null)} />
    </div>
  );
}
