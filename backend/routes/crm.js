// CRM Routes for FlacronAI
const express = require('express');
const router = express.Router();
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  createClaim,
  getAllClaims,
  updateClaimStatus,
  getDashboardAnalytics,
  createAppointment,
  getAppointments
} = require('../services/crmService');

/**
 * CLIENT ROUTES
 */

// Create new client
router.post('/clients', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await createClient(userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const filters = {
      type: req.query.type,
      status: req.query.status
    };

    const result = await getAllClients(userId, filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get client by ID
router.get('/clients/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await getClientById(req.params.id, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update client
router.put('/clients/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await updateClient(req.params.id, userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete client
router.delete('/clients/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await deleteClient(req.params.id, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * CLAIMS ROUTES
 */

// Create new claim
router.post('/claims', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await createClaim(userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all claims
router.get('/claims', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const filters = {
      status: req.query.status,
      clientId: req.query.clientId,
      priority: req.query.priority
    };

    const result = await getAllClaims(userId, filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update claim status
router.patch('/claims/:id/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const { status, note } = req.body;

    const result = await updateClaimStatus(req.params.id, userId, status, note);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ANALYTICS ROUTES
 */

// Get dashboard analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await getDashboardAnalytics(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * SCHEDULING ROUTES
 */

// Create appointment
router.post('/appointments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const result = await createAppointment(userId, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await getAppointments(userId, filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
