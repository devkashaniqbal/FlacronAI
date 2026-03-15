import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Building, Phone, Mail, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api.js';

const ContactSalesModal = ({ open, onClose }) => {
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', companyType: '', monthlyVolume: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      await salesAPI.contact({ ...form, source: 'enterprise-cta' });
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSubmitted(false); setForm({ name: '', email: '', company: '', phone: '', companyType: '', monthlyVolume: '', message: '' }); }, 300); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-300 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                <p className="text-gray-600 mb-6">Our enterprise team will contact you within 24 hours.</p>
                <button onClick={handleClose} className="btn-primary">Close</button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Talk to Enterprise Sales</h3>
                <p className="text-gray-600 text-sm mb-6">Tell us about your needs and we'll set up a personalized demo.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input name="name" value={form.name} onChange={handleChange} placeholder="John Smith" className="input pl-9" required />
                      </div>
                    </div>
                    <div>
                      <label className="label">Work Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="input pl-9" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Company Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Insurance" className="input pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input pl-9" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Company Type</label>
                      <select name="companyType" value={form.companyType} onChange={handleChange} className="input">
                        <option value="">Select type</option>
                        <option>Insurance Carrier</option>
                        <option>TPA</option>
                        <option>Adjusting Firm</option>
                        <option>Independent Adjuster</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Monthly Report Volume</label>
                      <select name="monthlyVolume" value={form.monthlyVolume} onChange={handleChange} className="input">
                        <option value="">Estimate</option>
                        <option>1–10</option>
                        <option>11–50</option>
                        <option>51–200</option>
                        <option>200–500</option>
                        <option>500+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Message</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your use case, team size, or any questions..."
                        rows={4}
                        className="input pl-9 resize-none"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" /> : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactSalesModal;
