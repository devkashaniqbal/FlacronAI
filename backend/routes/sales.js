const express = require('express');
const router = express.Router();
const { getFirestore } = require('../config/firebase');
const { sendSalesNotificationEmail } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Stripe — instantiated once at module level
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

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

    // Fetch all leads then filter/sort in memory to avoid Firestore composite index requirement
    const snapshot = await db.collection('salesLeads').get();
    let leads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    leads.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (status) leads = leads.filter(l => l.status === status);

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

// GET /api/sales/admin/user?email= — single user lookup (for AdminTierUpdate page)
router.get('/admin/user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { getAuth } = require('../config/firebase');
    const db = getFirestore();
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'email query param required' });

    const userRecord = await getAuth().getUserByEmail(email.toLowerCase().trim());
    const doc = await db.collection('users').doc(userRecord.uid).get();
    const data = doc.data() || {};
    return res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || data.displayName || '',
        tier: data.tier || 'starter',
        reportsGenerated: data.reportsGenerated || 0,
        reportsThisMonth: data.reportsThisMonth || 0,
        createdAt: data.createdAt || null,
      },
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

// GET /api/sales/admin/users — all platform users
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const { search = '', tier = '', page = 1, limit = 50 } = req.query;
    const lim = Math.min(parseInt(limit), 200);

    const snapshot = await db.collection('users').get();
    let users = snapshot.docs.map(d => {
      const u = d.data();
      return {
        uid: d.id,
        email: u.email || '',
        displayName: u.displayName || '',
        tier: u.tier || 'starter',
        reportsGenerated: u.reportsGenerated || 0,
        reportsThisMonth: u.reportsThisMonth || 0,
        stripeCustomerId: u.stripeCustomerId || null,
        createdAt: u.createdAt || null,
        updatedAt: u.updatedAt || null,
        adminUpdated: u.adminUpdated || false,
      };
    });

    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (tier) users = users.filter(u => u.tier === tier);
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q)
      );
    }

    const total = users.length;
    const offset = (parseInt(page) - 1) * lim;
    return res.json({ success: true, data: users.slice(offset, offset + lim), total, page: parseInt(page), limit: lim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

// GET /api/sales/admin/stats — platform-wide stats
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();

    const [usersSnap, reportsSnap, leadsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('reports').get(),
      db.collection('salesLeads').get(),
    ]);

    const users = usersSnap.docs.map(d => d.data());
    const tierCounts = { starter: 0, professional: 0, agency: 0, enterprise: 0 };
    users.forEach(u => { const t = u.tier || 'starter'; if (tierCounts[t] !== undefined) tierCounts[t]++; });

    const TIER_PRICE = { starter: 0, professional: 39.99, agency: 99.99, enterprise: 499 };
    const mrr = Object.entries(tierCounts).reduce((sum, [t, count]) => sum + (TIER_PRICE[t] || 0) * count, 0);

    // Total reports generated
    const totalReports = reportsSnap.size;

    // Reports this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const reportsThisMonth = reportsSnap.docs.filter(d => (d.data().createdAt || '') >= monthStart).length;

    // Stripe revenue — last 30 days
    let stripeRevenue = null;
    if (stripe) {
      try {
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
        const charges = await stripe.charges.list({ limit: 100, created: { gte: thirtyDaysAgo } });
        stripeRevenue = charges.data
          .filter(c => c.status === 'succeeded')
          .reduce((sum, c) => sum + c.amount, 0) / 100;
      } catch { /* Stripe not configured */ }
    }

    const newLeadsThisMonth = leadsSnap.docs.filter(d => (d.data().createdAt || '') >= monthStart).length;

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        tierCounts,
        mrr: Math.round(mrr * 100) / 100,
        totalReports,
        reportsThisMonth,
        stripeRevenue30d: stripeRevenue,
        totalLeads: leadsSnap.size,
        newLeadsThisMonth,
        paidUsers: tierCounts.professional + tierCounts.agency + tierCounts.enterprise,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
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

// DELETE /api/sales/admin/user/:uid — delete user from Firebase Auth + Firestore
router.delete('/admin/user/:uid', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { getAuth } = require('../config/firebase');
    const db = getFirestore();
    const { uid } = req.params;

    // Delete all their reports
    const reportsSnap = await db.collection('reports').where('userId', '==', uid).get();
    const batch = db.batch();
    reportsSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // Delete Firestore user doc
    await db.collection('users').doc(uid).delete();

    // Delete Firebase Auth account
    await getAuth().deleteUser(uid);

    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

// GET /api/sales/admin/user/:uid/reports — all reports for a user
router.get('/admin/user/:uid/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('reports').where('userId', '==', req.params.uid).get();
    const reports = snap.docs
      .map(d => { const data = d.data(); return { id: d.id, ...data, content: undefined }; })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

// GET /api/sales/admin/user/:uid/billing — Stripe subscription for a user
router.get('/admin/user/:uid/billing', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'User not found' });

    const { stripeCustomerId } = doc.data() || {};
    if (!stripeCustomerId || !stripe) {
      return res.json({ success: true, billing: null });
    }

    const [subscriptions, invoices] = await Promise.all([
      stripe.subscriptions.list({ customer: stripeCustomerId, limit: 5, status: 'all' }),
      stripe.invoices.list({ customer: stripeCustomerId, limit: 5 }),
    ]);

    const activeSub = subscriptions.data[0] || null;
    return res.json({
      success: true,
      billing: {
        customerId: stripeCustomerId,
        subscription: activeSub ? {
          status: activeSub.status,
          plan: activeSub.items.data[0]?.price?.nickname || null,
          amount: activeSub.items.data[0]?.price?.unit_amount / 100,
          interval: activeSub.items.data[0]?.price?.recurring?.interval,
          currentPeriodEnd: new Date(activeSub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: activeSub.cancel_at_period_end,
        } : null,
        invoices: invoices.data.map(inv => ({
          id: inv.id,
          amount: inv.amount_paid / 100,
          status: inv.status,
          date: new Date(inv.created * 1000).toISOString(),
          pdf: inv.invoice_pdf,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'ADMIN_ERROR' });
  }
});

// POST /api/sales/admin/email — send direct email to a user
router.post('/admin/email', authenticateToken, requireAdmin, [
  body('to').isEmail().normalizeEmail(),
  body('subject').trim().notEmpty(),
  body('message').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.mapped() });

  try {
    const { sendEmail } = require('../services/emailService');
    const { to, subject, message } = req.body;

    await sendEmail({
      to,
      subject: `[FlacronAI] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#f97316;height:4px;border-radius:2px;margin-bottom:24px;"></div>
          <p style="font-size:15px;color:#111827;line-height:1.6;">${message.replace(/\n/g, '<br/>')}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="font-size:12px;color:#6b7280;">This message was sent by the FlacronAI team.</p>
        </div>`,
      text: message,
    });

    return res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'EMAIL_ERROR' });
  }
});

module.exports = router;
