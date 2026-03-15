const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireTier } = require('../middleware/auth');
const crm = require('../services/crmService');
const { body, validationResult } = require('express-validator');

const agencyPlus = requireTier('agency');

// ── CLIENTS ──────────────────────────────────────────────────────────────────

router.get('/clients', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await crm.getClients(req.user.uid, { page: parseInt(page), limit: parseInt(limit), search });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.post('/clients', authenticateToken, agencyPlus, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.mapped() });
  try {
    const client = await crm.createClient(req.user.uid, req.body);
    return res.status(201).json({ success: true, client });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.get('/clients/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const client = await crm.getClient(req.user.uid, req.params.id);
    return res.json({ success: true, client });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.put('/clients/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const client = await crm.updateClient(req.user.uid, req.params.id, req.body);
    return res.json({ success: true, client });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.delete('/clients/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    await crm.deleteClient(req.user.uid, req.params.id);
    return res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.get('/clients/:id/reports', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const reports = await crm.getClientReports(req.user.uid, req.params.id);
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

// ── APPOINTMENTS ─────────────────────────────────────────────────────────────

router.get('/appointments', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const appts = await crm.getAppointments(req.user.uid, { startDate, endDate, status });
    return res.json({ success: true, appointments: appts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.post('/appointments', authenticateToken, agencyPlus, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').notEmpty().withMessage('Date is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.mapped() });
  try {
    const appt = await crm.createAppointment(req.user.uid, req.body);
    return res.status(201).json({ success: true, appointment: appt });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.put('/appointments/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const appt = await crm.updateAppointment(req.user.uid, req.params.id, req.body);
    return res.json({ success: true, appointment: appt });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.delete('/appointments/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    await crm.deleteAppointment(req.user.uid, req.params.id);
    return res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

// ── CLAIMS ────────────────────────────────────────────────────────────────────

router.get('/claims', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await crm.getClaims(req.user.uid, { page: parseInt(page), limit: parseInt(limit), status });
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.post('/claims', authenticateToken, agencyPlus, [
  body('lossType').notEmpty().withMessage('Loss type required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.mapped() });
  try {
    const claim = await crm.createClaim(req.user.uid, req.body);
    return res.status(201).json({ success: true, claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CRM_ERROR' });
  }
});

router.get('/claims/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const claim = await crm.getClaim(req.user.uid, req.params.id);
    return res.json({ success: true, claim });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.put('/claims/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    const claim = await crm.updateClaim(req.user.uid, req.params.id, req.body);
    return res.json({ success: true, claim });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

router.delete('/claims/:id', authenticateToken, agencyPlus, async (req, res) => {
  try {
    await crm.deleteClaim(req.user.uid, req.params.id);
    return res.json({ success: true, message: 'Claim deleted' });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message, code: 'NOT_FOUND' });
  }
});

module.exports = router;
