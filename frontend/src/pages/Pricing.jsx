import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, Star, Zap, Building2, Crown, ChevronDown, ChevronUp, Phone, Mail, Globe, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { paymentAPI, salesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'starter', name: 'Starter', icon: Zap,
    monthly: 0, annual: 0,
    description: 'Perfect for independent adjusters getting started',
    color: 'gray',
    features: [
      { label: '5 reports/month', included: true },
      { label: 'Basic AI report generation', included: true },
      { label: 'PDF export', included: true },
      { label: 'Email support', included: true },
      { label: 'FlacronAI watermark on reports', included: false },
      { label: 'DOCX/HTML export', included: false },
      { label: 'API access', included: false },
      { label: 'CRM features', included: false },
      { label: 'White-label portal', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional', name: 'Professional', icon: Star,
    monthly: 39.99, annual: 31.99,
    description: 'For active adjusters who need more power',
    color: 'blue', popular: true,
    features: [
      { label: '50 reports/month', included: true },
      { label: 'Advanced AI generation (GPT-4 Vision)', included: true },
      { label: 'PDF, DOCX, HTML export', included: true },
      { label: 'No watermarks', included: true },
      { label: 'Priority email support', included: true },
      { label: 'Report history & search', included: true },
      { label: 'API access', included: true },
      { label: 'CRM features', included: false },
      { label: 'White-label portal', included: false },
      { label: 'Dedicated support', included: false },
    ],
  },
  {
    id: 'agency', name: 'Agency', icon: Users,
    monthly: 99.99, annual: 79.99,
    description: 'For agencies managing multiple adjusters',
    color: 'purple',
    features: [
      { label: '200 reports/month', included: true },
      { label: 'Advanced AI generation (GPT-4 Vision)', included: true },
      { label: 'All export formats', included: true },
      { label: 'No watermarks', included: true },
      { label: 'Full CRM suite', included: true },
      { label: 'API access', included: true },
      { label: 'Client management', included: true },
      { label: 'Priority support', included: true },
      { label: 'White-label portal', included: false },
      { label: 'Custom AI training', included: false },
    ],
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: Crown,
    monthly: 499, annual: 399,
    description: 'Custom solutions for large organizations',
    color: 'amber',
    features: [
      { label: 'Unlimited reports', included: true },
      { label: 'IBM WatsonX + GPT-4 Vision', included: true },
      { label: 'All export formats', included: true },
      { label: 'No watermarks', included: true },
      { label: 'Full CRM suite', included: true },
      { label: 'Full API access', included: true },
      { label: 'White-label portal', included: true },
      { label: 'Custom subdomain', included: true },
      { label: 'Dedicated success manager', included: true },
      { label: 'Custom AI training', included: true },
    ],
  },
];

const COMPARISON_FEATURES = [
  { label: 'Reports per month', starter: '5', professional: '50', agency: '200', enterprise: 'Unlimited' },
  { label: 'AI Model', starter: 'Basic', professional: 'GPT-4 Vision', agency: 'GPT-4 Vision', enterprise: 'WatsonX + GPT-4' },
  { label: 'Export formats', starter: 'PDF', professional: 'PDF, DOCX, HTML', agency: 'All', enterprise: 'All' },
  { label: 'Watermarks', starter: 'Yes', professional: 'No', agency: 'No', enterprise: 'No' },
  { label: 'CRM', starter: false, professional: false, agency: true, enterprise: true },
  { label: 'API Access', starter: false, professional: true, agency: true, enterprise: true },
  { label: 'White-label', starter: false, professional: false, agency: false, enterprise: true },
  { label: 'Support', starter: 'Email', professional: 'Priority email', agency: 'Priority', enterprise: 'Dedicated' },
];

const FAQS = [
  { q: 'Can I cancel my subscription at any time?', a: 'Yes, you can cancel at any time. Your plan remains active until the end of the billing period, and you will not be charged again.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment processing.' },
  { q: 'Do unused reports roll over to the next month?', a: 'No, monthly reports reset at the beginning of each billing cycle. Unused reports do not roll over.' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from the Subscription settings page. Changes take effect immediately.' },
  { q: 'Is there a free trial for paid plans?', a: 'We offer a Starter plan free forever so you can test the platform. Paid plans do not have a trial period, but you can cancel within 7 days for a full refund.' },
  { q: 'How does annual billing work?', a: 'Annual billing charges you for 12 months upfront at a 20% discount compared to monthly billing. You save significantly on the yearly commitment.' },
];

const COLOR_MAP = {
  gray: { border: 'border-gray-500/30', bg: 'bg-gray-500/10', text: 'text-gray-600', btn: 'bg-gray-500 hover:bg-gray-600' },
  blue: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', btn: 'bg-orange-500 hover:bg-orange-600' },
  purple: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600' },
  amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600' },
};

function ContactSalesModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', companyType: '', monthlyVolume: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await salesAPI.contact({ ...form, subject: 'Enterprise Plan Inquiry' });
      setSuccess(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 text-sm">Our enterprise team will contact you within 24 hours.</p>
            <button onClick={onClose} className="btn-primary mt-6 text-sm py-2 px-6">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contact Sales</h2>
                <p className="text-gray-600 text-sm mt-1">Tell us about your enterprise needs</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" required placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Work Email</label>
                  <input type="email" className="input" required placeholder="john@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company</label>
                  <input className="input" required placeholder="Company name" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Company Type</label>
                <select className="input" value={form.companyType} onChange={e => setForm(p => ({ ...p, companyType: e.target.value }))}>
                  <option value="">Select type...</option>
                  {['Independent Adjuster Firm', 'Insurance Carrier', 'TPA', 'IA Network', 'Consulting Firm', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Monthly Claim Volume</label>
                <select className="input" value={form.monthlyVolume} onChange={e => setForm(p => ({ ...p, monthlyVolume: e.target.value }))}>
                  <option value="">Estimated reports/month...</option>
                  {['1-50', '51-200', '201-500', '501-1000', '1000+'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input min-h-[100px] resize-none" placeholder="Tell us about your requirements, integrations needed, or any questions..."
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(p => !p)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-gray-900 font-medium">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [loadingTier, setLoadingTier] = useState(null);
  const { isAuthenticated, tier: currentTier } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async (planId) => {
    if (!isAuthenticated) { navigate(`/auth?mode=signup&plan=${planId}${annual ? '_annual' : ''}`); return; }
    if (planId === 'enterprise') { setShowSalesModal(true); return; }
    if (planId === 'starter') return;
    setLoadingTier(planId);
    try {
      const res = await paymentAPI.createCheckout(planId + (annual ? '_annual' : ''));
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your workflow. Upgrade or cancel at any time.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <button onClick={() => setAnnual(p => !p)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual <span className="text-green-400 font-semibold">(save 20%)</span>
              </span>
            </div>
          </motion.div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {PLANS.map((plan, i) => {
              const c = COLOR_MAP[plan.color];
              const price = annual ? plan.annual : plan.monthly;
              const savings = plan.monthly > 0 ? Math.round((plan.monthly - plan.annual) * 12) : 0;
              const Icon = plan.icon;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card p-6 flex flex-col relative ${plan.popular ? 'border-orange-500/50 ring-1 ring-orange-500/30' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-gray-900 text-xs font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">${price === 0 ? '0' : price.toFixed(2)}</span>
                    {price > 0 && <span className="text-gray-600 text-sm">/mo</span>}
                    {annual && savings > 0 && (
                      <p className="text-green-400 text-xs mt-1 font-medium">Save ${savings}/year</p>
                    )}
                  </div>
                  <div className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        {f.included
                          ? <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          : <X className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />}
                        <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-600'}`}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingTier === plan.id || (currentTier === plan.id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm text-gray-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.id === 'starter' ? 'bg-gray-100 hover:bg-gray-100' :
                      plan.popular ? 'btn-primary' : `${c.btn} text-gray-900 shadow-lg`
                    }`}>
                    {loadingTier === plan.id ? 'Loading...' :
                     currentTier === plan.id ? 'Current Plan' :
                     plan.id === 'starter' ? 'Get Started Free' :
                     plan.id === 'enterprise' ? 'Contact Sales' :
                     'Get Started'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <motion.div className="mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Full Feature Comparison</h2>
            <div className="card overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="px-6 py-4 text-left text-gray-600 text-sm font-medium">Feature</th>
                    {PLANS.map(p => (
                      <th key={p.id} className="px-4 py-4 text-center text-gray-900 text-sm font-semibold">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row, i) => (
                    <tr key={i} className="border-b border-[#e5e7eb] hover:bg-gray-100">
                      <td className="px-6 py-3 text-gray-700 text-sm">{row.label}</td>
                      {(['starter', 'professional', 'agency', 'enterprise']).map(tier => (
                        <td key={tier} className="px-4 py-3 text-center text-sm">
                          {typeof row[tier] === 'boolean'
                            ? (row[tier] ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-gray-600 mx-auto" />)
                            : <span className="text-gray-700">{row[tier]}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Billing FAQ</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showSalesModal && <ContactSalesModal onClose={() => setShowSalesModal(false)} />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
