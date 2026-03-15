import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQS = [
  // General
  {
    category: 'General',
    q: 'What is FlacronAI?',
    a: 'FlacronAI is an AI-powered insurance claim report generation platform. It uses GPT-4 Vision and IBM WatsonX to analyze damage photos and generate professional, carrier-compliant claim reports in minutes rather than hours.',
  },
  {
    category: 'General',
    q: 'What types of claims does FlacronAI support?',
    a: 'FlacronAI supports all major property claim types: Water Damage, Fire, Wind, Hail, Mold, Vandalism, and Other. For each type, the AI applies appropriate documentation and language standards specific to that loss type.',
  },
  {
    category: 'General',
    q: 'What report types can I generate?',
    a: 'You can generate Initial, Supplemental, Final, and Re-Inspection reports. Each report type is formatted to meet industry standards for that specific document type.',
  },
  {
    category: 'General',
    q: 'Do reports include a watermark on the Starter plan?',
    a: 'Yes. Reports generated on the free Starter plan include a "FlacronAI" watermark. Upgrading to Professional, Agency, or Enterprise removes the watermark. Enterprise users can also set custom watermarks with their company name.',
  },
  {
    category: 'General',
    q: 'Is FlacronAI suitable for independent adjusters and large agencies?',
    a: 'Yes, FlacronAI is designed to scale. Individual adjusters use the Starter or Professional plans for personal productivity. Agencies use Agency or Enterprise plans for team-wide deployment, CRM integration, and branded portals.',
  },

  // Billing
  {
    category: 'Billing',
    q: 'What are the plan differences?',
    a: 'Starter: 5 free reports/month with watermark. Professional ($39.99/mo): 50 reports, no watermark, all export formats, API access. Agency ($99.99/mo): 200 reports, full CRM suite, API access. Enterprise ($499/mo): Unlimited reports, white-label portal, dedicated support, custom AI training.',
  },
  {
    category: 'Billing',
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes. You can cancel at any time from Settings > Billing > Cancel Subscription. Your plan remains active until the end of the current billing period. You will not be charged again after cancellation, and your account reverts to the free Starter plan.',
  },
  {
    category: 'Billing',
    q: 'Do unused reports roll over to the next month?',
    a: 'No. Monthly report allocations reset at the start of each billing cycle. Unused reports do not carry forward.',
  },
  {
    category: 'Billing',
    q: 'How does annual billing work?',
    a: 'Annual billing charges you for 12 months upfront at a 20% discount compared to monthly billing. For example, Professional is $31.99/month when billed annually instead of $39.99/month. You can switch between monthly and annual from the pricing page.',
  },
  {
    category: 'Billing',
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express, Discover) through Stripe. We do not accept PayPal or cryptocurrency at this time.',
  },

  // Technical
  {
    category: 'Technical',
    q: 'What AI models does FlacronAI use?',
    a: 'FlacronAI uses OpenAI GPT-4 Vision for image analysis and narrative generation, and IBM WatsonX for compliance structuring and industry-standard formatting. The combination ensures visually accurate and professionally compliant output.',
  },
  {
    category: 'Technical',
    q: 'How many photos can I upload per report?',
    a: 'You can upload up to 100 photos per report. Supported formats are JPEG and PNG. Individual files must be under 10MB. We recommend using a mixture of overview shots and detailed damage photos for best AI analysis results.',
  },
  {
    category: 'Technical',
    q: 'How long does report generation take?',
    a: 'Report generation typically takes 15–60 seconds depending on the number of photos uploaded and current AI service load. Reports with 50+ photos may take up to 2 minutes. You will receive an email notification when your report is ready.',
  },
  {
    category: 'Technical',
    q: 'What export formats are available?',
    a: 'Professional, Agency, and Enterprise plans can export in PDF, DOCX (Word), and HTML formats. The Starter plan supports PDF export only.',
  },
  {
    category: 'Technical',
    q: 'Is my data stored securely?',
    a: 'Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We use Google Firebase infrastructure for authentication and MongoDB Atlas for data storage. Both platforms are SOC 2 Type II certified. Your report content and photos are never used to train AI models.',
  },

  // API
  {
    category: 'API',
    q: 'Which plans include API access?',
    a: 'API access is available on Professional, Agency, and Enterprise plans. Starter users can access the web interface only.',
  },
  {
    category: 'API',
    q: 'What can I do with the API?',
    a: 'The FlacronAI API supports programmatic report generation, report management (list, get, delete, export), CRM operations, user profile management, white-label configuration, and payment/subscription management.',
  },
  {
    category: 'API',
    q: 'Are there rate limits on the API?',
    a: 'Yes. Agency plans are limited to 60 requests/minute and 2,000 requests/day. Enterprise plans allow 200 requests/minute with unlimited daily requests. Custom limits are negotiable for Enterprise customers with very high volume needs.',
  },
  {
    category: 'API',
    q: 'Is there a white-label option for the platform?',
    a: 'Yes. Enterprise plan customers can configure full white-labeling: custom subdomain, company logo and colors, branded report headers and footers, custom email sender name and address, watermark configuration, and the option to remove FlacronAI branding entirely. Custom domain (your own domain) setup with SSL is also supported.',
  },
  {
    category: 'API',
    q: 'Does FlacronAI comply with GDPR and CCPA?',
    a: 'Yes. FlacronAI is designed with privacy regulations in mind. You can request deletion of all your data at any time by contacting support@flacronenterprises.com. We process data only as described in our Privacy Policy and do not sell personal data to third parties. For enterprise customers with GDPR DPA requirements, please contact our sales team.',
  },
];

const CATEGORIES = ['All', 'General', 'Billing', 'Technical', 'API'];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-gray-100 transition-colors">
        <span className="text-gray-900 text-sm font-medium leading-snug flex-1">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#e5e7eb]">
            <p className="px-5 py-4 text-gray-600 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQs() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return FAQS.filter(f => {
      const matchCat = category === 'All' || f.category === category;
      const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-orange-500/20 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
          <p className="text-gray-600">Find answers about FlacronAI, billing, features, and the API.</p>
        </motion.div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input pl-10" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                category === cat ? 'bg-orange-500 text-gray-900' : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600">No matching questions found. Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {CATEGORIES.filter(c => c !== 'All').map(cat => {
              const items = filtered.filter(f => f.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  {category === 'All' && (
                    <h2 className="text-xs font-semibold text-gray-500 uppercase px-1 mb-2 mt-6 first:mt-0">{cat}</h2>
                  )}
                  <div className="space-y-2">
                    {items.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 card p-6 text-center">
          <p className="text-gray-900 font-semibold mb-2">Still have questions?</p>
          <p className="text-gray-600 text-sm mb-4">Our support team is here to help with anything not covered above.</p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-6">Contact Support</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
