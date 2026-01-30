// User Routes for FlacronAI
const express = require('express');
const router = express.Router();
const { getFirestore, getAuth } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const { getUserUsage } = require('../services/reportService');
const { getTier, getAllTiers, hasApiAccess, getMaxApiKeys } = require('../config/tiers');
const {
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  getApiKeyUsage,
  getApiUsageAnalytics
} = require('../services/apiKeyService');

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

// ============================================
// API Key Management Endpoints
// ============================================

/**
 * POST /api/users/api-keys
 * Generate a new API key (Protected - requires auth)
 */
router.post('/api-keys', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const keyName = name || `API Key ${new Date().toLocaleDateString()}`;

    const result = await createApiKey(userId, keyName);

    if (!result.success) {
      const statusCode = result.code === 'NO_API_ACCESS' ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);

  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/api-keys
 * Get all API keys for the authenticated user (Protected)
 */
router.get('/api-keys', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's tier info
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userTier = userData.tier || 'starter';

    // Check if user has API access
    if (!hasApiAccess(userTier)) {
      return res.status(403).json({
        success: false,
        error: 'API access is not available on your current plan',
        code: 'NO_API_ACCESS',
        currentTier: userTier,
        hint: 'Upgrade to Professional or higher to access API keys'
      });
    }

    const result = await getUserApiKeys(userId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Add tier limits info
    const maxKeys = getMaxApiKeys(userTier);
    result.limits = {
      maxKeys: maxKeys === -1 ? 'Unlimited' : maxKeys,
      currentCount: result.count,
      canCreateMore: maxKeys === -1 || result.count < maxKeys
    };

    res.json(result);

  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/users/api-keys/:keyId
 * Revoke an API key (Protected)
 */
router.delete('/api-keys/:keyId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { keyId } = req.params;

    if (!keyId) {
      return res.status(400).json({
        success: false,
        error: 'Key ID is required'
      });
    }

    const result = await revokeApiKey(keyId, userId);

    if (!result.success) {
      const statusCode = result.error === 'Unauthorized - this key does not belong to you' ? 403 : 400;
      return res.status(statusCode).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/api-keys/:keyId/usage
 * Get usage stats for a specific API key (Protected)
 */
router.get('/api-keys/:keyId/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { keyId } = req.params;

    const result = await getApiKeyUsage(keyId, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Get API key usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/api-usage
 * Get overall API usage analytics for the user (Protected)
 */
router.get('/api-usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 30;

    const result = await getApiUsageAnalytics(userId, days);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Get API usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/api-access
 * Check if user has API access and get limits (Protected)
 */
router.get('/api-access', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    const userTier = userData.tier || 'starter';
    const tierConfig = getTier(userTier);

    res.json({
      success: true,
      apiAccess: {
        hasAccess: tierConfig.apiAccess || false,
        tier: userTier,
        tierName: tierConfig.name,
        limits: {
          callsPerHour: tierConfig.apiCallsPerHour || 0,
          callsPerMonth: tierConfig.apiCallsPerMonth === -1 ? 'Unlimited' : tierConfig.apiCallsPerMonth || 0,
          maxApiKeys: tierConfig.maxApiKeys === -1 ? 'Unlimited' : tierConfig.maxApiKeys || 0
        },
        features: {
          webhooks: tierConfig.features?.webhooks || false,
          customIntegration: tierConfig.features?.customIntegration || false
        }
      }
    });

  } catch (error) {
    console.error('Get API access error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/change-password
 * Change user password (Protected)
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Update password in Firebase Auth
    const auth = getAuth();
    await auth.updateUser(userId, {
      password: newPassword
    });

    // Update user document
    const db = getFirestore();
    await db.collection('users').doc(userId).update({
      passwordChangedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Password changed for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/update-name
 * Update user display name (Protected)
 */
router.put('/update-name', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { displayName } = req.body;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Display name must be at least 2 characters'
      });
    }

    // Update in Firebase Auth
    const auth = getAuth();
    await auth.updateUser(userId, {
      displayName: displayName.trim()
    });

    // Update in Firestore
    const db = getFirestore();
    await db.collection('users').doc(userId).update({
      displayName: displayName.trim(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Display name updated for user ${userId}: ${displayName}`);

    res.json({
      success: true,
      message: 'Display name updated successfully',
      displayName: displayName.trim()
    });

  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
