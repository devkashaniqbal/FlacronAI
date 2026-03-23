import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, MapPin, Clock, CheckCircle, MessageSquare, Phone, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { salesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Billing Question',
  'Enterprise Sales',
  'Partnership Inquiry',
  'Bug Report',
  'Feature Request',
  'Press / Media',
];

const FAQ_LINKS = [
  { label: 'How do I upgrade my plan?', href: '/faqs#billing' },
  { label: 'What AI models does FlacronAI use?', href: '/faqs#technical' },
  { label: 'Can I white-label the reports?', href: '/faqs#general' },
  { label: 'How is my data protected?', href: '/faqs#technical' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject) { toast.error('Please select a subject'); return; }
    setLoading(true);
    try {
      await salesAPI.contact(form);
      setSuccess(true);
    } catch {
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-gray-600 max-w-xl mx-auto">Have a question, need help, or want to discuss enterprise options? We respond to all inquiries within one business day.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {success ? (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Received!</h2>
                <p className="text-gray-600 max-w-sm">Thank you for reaching out. Our team reviews all inquiries and will respond to your message at <span className="text-gray-900">{form.email}</span> within one business day.</p>
                <p className="text-gray-500 text-sm mt-4">For urgent technical issues, please email <a href="mailto:support@flacronenterprises.com" className="text-orange-400 underline">support@flacronenterprises.com</a> directly.</p>
                <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="btn-secondary mt-6 text-sm py-2 px-6">Send Another Message</button>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-400" /> Send a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input className="input" required placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input type="email" className="input" required placeholder="john@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <select className="input" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea className="input min-h-[180px] resize-y" required placeholder="Tell us how we can help you. The more detail you provide, the faster we can assist."
                      value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">We typically respond within 1 business day. For urgent support, use the live chat widget.</p>
                </form>
              </div>
            )}
          </motion.div>

          {/* Sidebar Info */}
          <motion.div className="space-y-5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="card p-5 space-y-4">
              {[
                {
                  icon: Mail, title: 'Email Support',
                  lines: ['support@flacronenterprises.com'],
                  color: 'text-orange-400 bg-orange-500/10',
                },
                {
                  icon: MapPin, title: 'Office Location',
                  lines: ['410 E 95th St, Brooklyn, NY 11212', 'United States'],
                  color: 'text-amber-400 bg-amber-500/10',
                },
                {
                  icon: Clock, title: 'Response Time',
                  lines: ['Standard: 1 business day', 'Enterprise: Same-day'],
                  color: 'text-green-400 bg-green-500/10',
                },
              ].map(info => {
                const Icon = info.icon;
                return (
                  <div key={info.title} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${info.color.split(' ')[1]} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${info.color.split(' ')[0]}`} />
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{info.title}</p>
                      {info.lines.map((l, i) => <p key={i} className="text-gray-600 text-xs mt-0.5">{l}</p>)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick FAQ Links</h3>
              <div className="space-y-2">
                {FAQ_LINKS.map(l => (
                  <button key={l.label} onClick={() => navigate('/faqs')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-100 transition-colors text-left group">
                    <span className="text-gray-700 text-xs">{l.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-900 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Enterprise Inquiries</h3>
              <p className="text-gray-600 text-xs mb-4">Need unlimited reports, white-label, and dedicated support? Let's talk.</p>
              <button onClick={() => navigate('/pricing')} className="btn-primary w-full text-sm py-2">View Enterprise Plan</button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
