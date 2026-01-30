// Authentication Middleware for FlacronAI
const { getAuth, getFirestore } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const { validateApiKey, trackApiKeyUsage, logApiCall } = require('../services/apiKeyService');
const { getTier, hasExceededHourlyApiLimit, hasExceededMonthlyApiLimit, getRateLimitInfo } = require('../config/tiers');

// Secret for mobile app JWT tokens (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'flacronai-mobile-secret-2024';

/**
 * Middleware to verify Firebase ID token OR mobile app JWT token
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    // Try to verify as JWT token first (for mobile app)
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // JWT token verified successfully (mobile app)
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
      return next();
    } catch (jwtError) {
      // Not a JWT token or invalid, try Firebase token (for web app)
    }

    // Try to verify as Firebase ID token (for web app)
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } catch (firebaseError) {
      // Check if token is expired
      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw firebaseError;
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

/**
 * Optional authentication - doesn't block if no token, but verifies if present
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email
      };
    }

    next();

  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
}

/**
 * Middleware to authenticate via API Key (X-API-Key header)
 * For external API access by paid tier customers
 */
async function authenticateApiKey(req, res, next) {
  const startTime = Date.now();

  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        code: 'MISSING_API_KEY',
        hint: 'Include your API key in the X-API-Key header'
      });
    }

    // Validate the API key
    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error,
        code: 'INVALID_API_KEY'
      });
    }

    // Get current usage from the key
    const db = getFirestore();
    const keyDoc = await db.collection('apiKeys').doc(validation.keyId).get();
    const keyData = keyDoc.data();

    // Check rate limits
    const tier = validation.tier;
    const usageThisHour = keyData.usageThisHour || 0;
    const usageThisMonth = keyData.usageThisMonth || 0;

    // Check hourly limit
    if (hasExceededHourlyApiLimit(usageThisHour, tier)) {
      const rateLimitInfo = getRateLimitInfo(tier, usageThisHour);
      res.set({
        'X-RateLimit-Limit': rateLimitInfo.limit,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': rateLimitInfo.resetTime
      });

      return res.status(429).json({
        success: false,
        error: 'Hourly API rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: rateLimitInfo.limit,
        resetAt: rateLimitInfo.resetTime
      });
    }

    // Check monthly limit
    if (hasExceededMonthlyApiLimit(usageThisMonth, tier)) {
      return res.status(429).json({
        success: false,
        error: 'Monthly API limit exceeded. Please upgrade your plan for more API calls.',
        code: 'MONTHLY_LIMIT_EXCEEDED',
        currentUsage: usageThisMonth,
        limit: getTier(tier).apiCallsPerMonth
      });
    }

    // Track usage
    const usageResult = await trackApiKeyUsage(validation.keyId);

    // Set rate limit headers
    const rateLimitInfo = getRateLimitInfo(tier, usageResult.usageThisHour || usageThisHour + 1);
    res.set({
      'X-RateLimit-Limit': rateLimitInfo.limit,
      'X-RateLimit-Remaining': rateLimitInfo.remaining,
      'X-RateLimit-Reset': rateLimitInfo.resetTime
    });

    // Attach user info to request
    req.user = {
      userId: validation.userId,
      email: validation.userEmail,
      tier: validation.tier,
      authMethod: 'api_key',
      keyId: validation.keyId,
      keyName: validation.keyName
    };

    // Log the API call (async, don't wait)
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      logApiCall(
        validation.keyId,
        validation.userId,
        req.originalUrl,
        req.method,
        res.statusCode,
        responseTime
      );
    });

    next();

  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Middleware that accepts EITHER Bearer token OR API key
 * Useful for endpoints that should work with both web app and API access
 */
async function authenticateAny(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];

  // If API key is provided, use API key auth
  if (apiKey) {
    return authenticateApiKey(req, res, next);
  }

  // If Bearer token is provided, use token auth
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }

  // No authentication provided
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    code: 'AUTH_REQUIRED',
    hint: 'Provide either X-API-Key header or Authorization: Bearer <token>'
  });
}

/**
 * Middleware to check if user has API access based on tier
 * Use after authenticateToken to verify tier permissions
 */
async function requireApiAccess(req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // If authenticated via API key, access is already verified
    if (req.user.authMethod === 'api_key') {
      return next();
    }

    // For token auth, check user's tier
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    const tier = getTier(userData.tier || 'starter');

    if (!tier.apiAccess) {
      return res.status(403).json({
        success: false,
        error: 'API access is not available on your current plan',
        code: 'NO_API_ACCESS',
        currentTier: userData.tier || 'starter',
        hint: 'Upgrade to Professional or higher to access the API'
      });
    }

    // Add tier info to request
    req.user.tier = userData.tier;
    next();

  } catch (error) {
    console.error('API access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking API access'
    });
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateApiKey,
  authenticateAny,
  requireApiAccess
};
