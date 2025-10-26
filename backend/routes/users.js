// User Routes for FlacronAI
const express = require('express');
const router = express.Router();
const { getFirestore } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const { getUserUsage } = require('../services/reportService');
const { getTier, getAllTiers } = require('../config/tiers');

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: userDoc.data()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Remove userId from updates to prevent overwrite
    delete updates.userId;
    delete updates.reportsGenerated; // Prevent manual modification
    delete updates.createdAt; // Prevent modification

    const db = getFirestore();
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/usage
 * Get user usage statistics (PROTECTED)
 */
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const usageData = await getUserUsage(userId);

    if (!usageData.success) {
      return res.status(500).json(usageData);
    }

    const tierConfig = getTier(usageData.tier);
    const remaining = tierConfig.reportsPerMonth === -1
      ? 'Unlimited'
      : Math.max(0, tierConfig.reportsPerMonth - usageData.periodUsage);

    const usagePercentage = tierConfig.reportsPerMonth === -1
      ? 0
      : Math.round((usageData.periodUsage / tierConfig.reportsPerMonth) * 100);

    res.json({
      success: true,
      usage: {
        tier: usageData.tier,
        tierName: usageData.tierName,
        periodUsage: usageData.periodUsage,
        totalReports: usageData.totalReports,
        limit: tierConfig.reportsPerMonth === -1 ? 'Unlimited' : tierConfig.reportsPerMonth,
        remaining: remaining,
        percentage: usagePercentage,
        price: tierConfig.price,
        features: usageData.features
      }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/tiers
 * Get all available tiers
 */
router.get('/tiers', (req, res) => {
  try {
    const tiers = getAllTiers();
    res.json({
      success: true,
      tiers: tiers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/users/upgrade
 * Upgrade user tier
 */
router.post('/upgrade', async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { newTier } = req.body;

    if (!userId || !newTier) {
      return res.status(400).json({
        success: false,
        error: 'User ID and new tier are required'
      });
    }

    const validTiers = ['starter', 'professional', 'agency', 'enterprise'];
    if (!validTiers.includes(newTier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tier'
      });
    }

    const db = getFirestore();
    const updateData = {
      tier: newTier,
      upgradedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If upgrading to a paid tier and subscriptionId is not set, set it to 'manual'
    // This allows manual upgrades to show in subscriptions list
    if (newTier !== 'starter') {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData.subscriptionId) {
        updateData.subscriptionId = `manual_${Date.now()}`;
        updateData.subscriptionStatus = 'active';
        updateData.stripeCustomerId = 'manual';
      }
    }

    await db.collection('users').doc(userId).update(updateData);

    console.log(`✅ User ${userId} upgraded to ${newTier} tier (${updateData.subscriptionId ? 'with subscription data' : 'tier only'})`);

    res.json({
      success: true,
      message: `Upgraded to ${newTier} tier successfully`
    });

  } catch (error) {
    console.error('Upgrade tier error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
