// API Key Service for FlacronAI
// Handles API key generation, validation, and management

const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');
const { getTier, hasApiAccess, getMaxApiKeys } = require('../config/tiers');

// API Key prefix for identification
const API_KEY_PREFIX = 'flac_live_';
const API_KEY_LENGTH = 32; // Length of random part

/**
 * Generate a new API key
 * Format: flac_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
function generateApiKeyString() {
  const randomPart = crypto.randomBytes(API_KEY_LENGTH).toString('hex').slice(0, API_KEY_LENGTH);
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Hash an API key for secure storage
 * We store hash, not plain text
 */
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Get visible prefix for display (first 12 chars + last 4 chars)
 * Example: flac_live_abc1...xyz9
 */
function getKeyPreview(apiKey) {
  if (apiKey.length < 20) return apiKey;
  return `${apiKey.slice(0, 16)}...${apiKey.slice(-4)}`;
}

/**
 * Create a new API key for a user
 */
async function createApiKey(userId, keyName = 'Default Key') {
  try {
    const db = getFirestore();

    // Get user data to check tier and existing keys
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const userData = userDoc.data();
    const userTier = userData.tier || 'starter';

    // Check if tier has API access
    if (!hasApiAccess(userTier)) {
      return {
        success: false,
        error: 'API access is not available on your current plan. Please upgrade to Professional or higher.',
        code: 'NO_API_ACCESS'
      };
    }

    // Check max API keys limit
    const maxKeys = getMaxApiKeys(userTier);
    const existingKeysSnapshot = await db.collection('apiKeys')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const existingKeysCount = existingKeysSnapshot.size;

    if (maxKeys !== -1 && existingKeysCount >= maxKeys) {
      return {
        success: false,
        error: `You have reached the maximum number of API keys (${maxKeys}) for your plan.`,
        code: 'MAX_KEYS_REACHED'
      };
    }

    // Generate new key
    const plainApiKey = generateApiKeyString();
    const hashedKey = hashApiKey(plainApiKey);
    const keyPreview = getKeyPreview(plainApiKey);

    // Create key document
    const keyId = crypto.randomUUID();
    const keyData = {
      keyId: keyId,
      userId: userId,
      keyHash: hashedKey,
      keyPreview: keyPreview,
      name: keyName,
      tier: userTier,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      usageCount: 0,
      usageThisHour: 0,
      usageThisMonth: 0,
      currentHour: new Date().toISOString().slice(0, 13), // YYYY-MM-DDTHH
      currentMonth: new Date().toISOString().slice(0, 7) // YYYY-MM
    };

    await db.collection('apiKeys').doc(keyId).set(keyData);

    // Update user document to indicate API keys exist
    await db.collection('users').doc(userId).update({
      hasApiKeys: true,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ API key created for user ${userId}: ${keyPreview}`);

    return {
      success: true,
      apiKey: plainApiKey, // Return plain key ONCE - user must save it
      keyId: keyId,
      keyPreview: keyPreview,
      name: keyName,
      message: 'API key created successfully. Please save this key - it will not be shown again.'
    };

  } catch (error) {
    console.error('Error creating API key:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all API keys for a user (without revealing full key)
 */
async function getUserApiKeys(userId) {
  try {
    const db = getFirestore();

    const keysSnapshot = await db.collection('apiKeys')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const keys = [];
    keysSnapshot.forEach(doc => {
      const data = doc.data();
      keys.push({
        keyId: data.keyId,
        name: data.name,
        keyPreview: data.keyPreview,
        isActive: data.isActive,
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt,
        usageCount: data.usageCount,
        usageThisMonth: data.usageThisMonth
      });
    });

    return {
      success: true,
      keys: keys,
      count: keys.length
    };

  } catch (error) {
    console.error('Error getting user API keys:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revoke (deactivate) an API key
 */
async function revokeApiKey(keyId, userId) {
  try {
    const db = getFirestore();

    // Get the key document
    const keyDoc = await db.collection('apiKeys').doc(keyId).get();

    if (!keyDoc.exists) {
      return {
        success: false,
        error: 'API key not found'
      };
    }

    const keyData = keyDoc.data();

    // Verify ownership
    if (keyData.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized - this key does not belong to you'
      };
    }

    // Check if already revoked
    if (!keyData.isActive) {
      return {
        success: false,
        error: 'This API key has already been revoked'
      };
    }

    // Revoke the key
    await db.collection('apiKeys').doc(keyId).update({
      isActive: false,
      revokedAt: new Date().toISOString()
    });

    console.log(`🔴 API key revoked: ${keyData.keyPreview}`);

    return {
      success: true,
      message: 'API key revoked successfully'
    };

  } catch (error) {
    console.error('Error revoking API key:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate an API key and return user info
 */
async function validateApiKey(apiKey) {
  try {
    // Check format
    if (!apiKey || !apiKey.startsWith(API_KEY_PREFIX)) {
      return {
        valid: false,
        error: 'Invalid API key format'
      };
    }

    const db = getFirestore();
    const hashedKey = hashApiKey(apiKey);

    // Find key by hash
    const keysSnapshot = await db.collection('apiKeys')
      .where('keyHash', '==', hashedKey)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (keysSnapshot.empty) {
      return {
        valid: false,
        error: 'Invalid or revoked API key'
      };
    }

    const keyDoc = keysSnapshot.docs[0];
    const keyData = keyDoc.data();

    // Get user data
    const userDoc = await db.collection('users').doc(keyData.userId).get();

    if (!userDoc.exists) {
      return {
        valid: false,
        error: 'User account not found'
      };
    }

    const userData = userDoc.data();

    // Check if user still has API access (tier may have changed)
    if (!hasApiAccess(userData.tier || 'starter')) {
      return {
        valid: false,
        error: 'API access has been disabled for this account'
      };
    }

    return {
      valid: true,
      keyId: keyData.keyId,
      userId: keyData.userId,
      userEmail: userData.email,
      tier: userData.tier || 'starter',
      keyName: keyData.name
    };

  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: 'Error validating API key'
    };
  }
}

/**
 * Track API key usage
 */
async function trackApiKeyUsage(keyId) {
  try {
    const db = getFirestore();
    const keyRef = db.collection('apiKeys').doc(keyId);
    const keyDoc = await keyRef.get();

    if (!keyDoc.exists) {
      return { success: false };
    }

    const keyData = keyDoc.data();
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13);
    const currentMonth = now.toISOString().slice(0, 7);

    // Prepare update
    const updates = {
      lastUsedAt: now.toISOString(),
      usageCount: (keyData.usageCount || 0) + 1
    };

    // Reset hourly counter if new hour
    if (keyData.currentHour !== currentHour) {
      updates.usageThisHour = 1;
      updates.currentHour = currentHour;
    } else {
      updates.usageThisHour = (keyData.usageThisHour || 0) + 1;
    }

    // Reset monthly counter if new month
    if (keyData.currentMonth !== currentMonth) {
      updates.usageThisMonth = 1;
      updates.currentMonth = currentMonth;
    } else {
      updates.usageThisMonth = (keyData.usageThisMonth || 0) + 1;
    }

    await keyRef.update(updates);

    return {
      success: true,
      usageThisHour: updates.usageThisHour,
      usageThisMonth: updates.usageThisMonth
    };

  } catch (error) {
    console.error('Error tracking API usage:', error);
    return { success: false };
  }
}

/**
 * Get API key usage stats
 */
async function getApiKeyUsage(keyId, userId) {
  try {
    const db = getFirestore();
    const keyDoc = await db.collection('apiKeys').doc(keyId).get();

    if (!keyDoc.exists) {
      return {
        success: false,
        error: 'API key not found'
      };
    }

    const keyData = keyDoc.data();

    // Verify ownership
    if (keyData.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Get tier limits
    const tierConfig = getTier(keyData.tier);

    return {
      success: true,
      usage: {
        totalCalls: keyData.usageCount || 0,
        callsThisHour: keyData.usageThisHour || 0,
        callsThisMonth: keyData.usageThisMonth || 0,
        limits: {
          perHour: tierConfig.apiCallsPerHour,
          perMonth: tierConfig.apiCallsPerMonth
        },
        lastUsedAt: keyData.lastUsedAt,
        createdAt: keyData.createdAt
      }
    };

  } catch (error) {
    console.error('Error getting API key usage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Log API call to apiUsage collection for analytics
 */
async function logApiCall(keyId, userId, endpoint, method, statusCode, responseTime) {
  try {
    const db = getFirestore();

    const logEntry = {
      keyId: keyId,
      userId: userId,
      endpoint: endpoint,
      method: method,
      statusCode: statusCode,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    };

    // Use auto-generated ID
    await db.collection('apiUsage').add(logEntry);

    return { success: true };

  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Error logging API call:', error);
    return { success: false };
  }
}

/**
 * Get API usage analytics for a user
 */
async function getApiUsageAnalytics(userId, days = 30) {
  try {
    const db = getFirestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageSnapshot = await db.collection('apiUsage')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate.toISOString())
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const usageLogs = [];
    const dailyStats = {};
    const endpointStats = {};
    let totalCalls = 0;
    let totalErrors = 0;
    let totalResponseTime = 0;

    usageSnapshot.forEach(doc => {
      const data = doc.data();
      usageLogs.push(data);
      totalCalls++;

      // Track errors
      if (data.statusCode >= 400) {
        totalErrors++;
      }

      // Track response time
      totalResponseTime += data.responseTime || 0;

      // Daily stats
      const day = data.timestamp.slice(0, 10);
      dailyStats[day] = (dailyStats[day] || 0) + 1;

      // Endpoint stats
      endpointStats[data.endpoint] = (endpointStats[data.endpoint] || 0) + 1;
    });

    return {
      success: true,
      analytics: {
        totalCalls: totalCalls,
        totalErrors: totalErrors,
        errorRate: totalCalls > 0 ? ((totalErrors / totalCalls) * 100).toFixed(2) : 0,
        avgResponseTime: totalCalls > 0 ? Math.round(totalResponseTime / totalCalls) : 0,
        dailyStats: dailyStats,
        endpointStats: endpointStats,
        period: `${days} days`
      }
    };

  } catch (error) {
    console.error('Error getting API usage analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateApiKeyString,
  hashApiKey,
  getKeyPreview,
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  validateApiKey,
  trackApiKeyUsage,
  getApiKeyUsage,
  logApiCall,
  getApiUsageAnalytics
};
