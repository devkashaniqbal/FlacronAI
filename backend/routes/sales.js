const express = require('express');
const router = express.Router();
const { getFirestore } = require('../config/firebase');
const { sendSalesNotificationEmail } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// POST /api/sales/contact — no auth required
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.mapped() });
  }

  try {
    const db = getFirestore();
    const { name, email, subject, message, company, phone, companyType, monthlyVolume } = req.body;

    const lead = {
      id: uuidv4(),
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      company: company || '',
      phone: phone || '',
      companyType: companyType || '',
      monthlyVolume: monthlyVolume || '',
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: req.body.source || 'contact-form',
      ip: req.ip,
    };

    await db.collection('salesLeads').doc(lead.id).set(lead);

    // Send notification email to admin (non-blocking)
    sendSalesNotificationEmail(lead).catch(err => console.warn('Sales notification email failed:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. Our team will contact you within 24 hours.',
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit contact form', code: 'CONTACT_ERROR' });
  }
});

// Middleware: check admin access
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ success: false, error: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  return next();
};

// GET /api/sales/leads — admin only
router.get('/leads', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const { status, limit = 50, page = 1 } = req.query;

    let query = db.collection('salesLeads').orderBy('createdAt', 'desc');
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.get();
    const leads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const total = leads.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    return res.json({
      success: true,
      data: leads.slice(offset, offset + parseInt(limit)),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: offset + parseInt(limit) < total,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'LEADS_ERROR' });
  }
});

// PUT /api/sales/leads/:id — admin only
router.put('/leads/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const ref = db.collection('salesLeads').doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Lead not found', code: 'NOT_FOUND' });
    }

    const { status, notes } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await ref.update(updates);
    return res.json({ success: true, lead: { id: doc.id, ...doc.data(), ...updates } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'UPDATE_ERROR' });
  }
});

// Admin endpoint: update user tier (accessed via /admin-tier-update page)
router.put('/admin/update-tier', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('tier').isIn(['starter', 'professional', 'agency', 'enterprise']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.mapped() });

  try {
    const { getAuth } = require('../config/firebase');
    const db = getFirestore();

    const userRecord = await getAuth().getUserByEmail(req.body.email);
    await db.collection('users').doc(userRecord.uid).update({
      tier: req.body.tier,
      updatedAt: new Date().toISOString(),
      adminUpdated: true,
      adminUpdatedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: `User ${req.body.email} updated to ${req.body.tier} tier` });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

module.exports = router;
