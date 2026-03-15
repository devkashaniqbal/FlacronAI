const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getAuth, getFirestore } = require('../config/firebase');
const { isAtLeastTier, getTier } = require('../config/tiers');

// Verify Firebase ID token or custom JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];

    // Try Firebase ID token first
    try {
      const decoded = await getAuth().verifyIdToken(token);
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        tier: userData.tier || 'starter',
        displayName: userData.displayName || decoded.name || '',
        ...userData,
      };
      return next();
    } catch (firebaseErr) {
      // Try custom JWT fallback
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          tier: userData.tier || 'starter',
          displayName: userData.displayName || '',
          ...userData,
        };
        return next();
      } catch (jwtErr) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
      }
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, error: 'Authentication error', code: 'AUTH_ERROR' });
  }
};

// Verify API Key from X-API-Key header
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ success: false, error: 'No API key provided', code: 'NO_API_KEY' });
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const db = getFirestore();
    const keySnapshot = await db.collection('apiKeys')
      .where('keyHash', '==', hashedKey)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (keySnapshot.empty) {
      return res.status(401).json({ success: false, error: 'Invalid API key', code: 'INVALID_API_KEY' });
    }

    const keyDoc = keySnapshot.docs[0];
    const keyData = keyDoc.data();

    const userDoc = await db.collection('users').doc(keyData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    req.user = {
      uid: keyData.userId,
      email: userData.email || '',
      tier: userData.tier || 'starter',
      displayName: userData.displayName || '',
      ...userData,
    };
    req.apiKey = { id: keyDoc.id, ...keyData };

    // Update last used
    keyDoc.ref.update({ lastUsedAt: new Date().toISOString() }).catch(() => {});
    return next();
  } catch (err) {
    console.error('API key auth error:', err);
    return res.status(500).json({ success: false, error: 'API key authentication error', code: 'AUTH_ERROR' });
  }
};

// Try token first, then API key
const authenticateAny = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  } else if (apiKey) {
    return authenticateApiKey(req, res, next);
  } else {
    return res.status(401).json({ success: false, error: 'Authentication required', code: 'NO_AUTH' });
  }
};

// Optional auth — continues even without token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    req.user = { uid: decoded.uid, email: decoded.email, tier: userData.tier || 'starter', ...userData };
  } catch {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      req.user = { uid: decoded.uid, email: decoded.email, tier: userData.tier || 'starter', ...userData };
    } catch {
      req.user = null;
    }
  }
  return next();
};

// Require minimum tier
const requireTier = (tierName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required', code: 'NO_AUTH' });
    }
    if (!isAtLeastTier(req.user.tier, tierName)) {
      return res.status(403).json({
        success: false,
        error: `This feature requires ${getTier(tierName).name} tier or higher`,
        code: 'INSUFFICIENT_TIER',
        requiredTier: tierName,
        currentTier: req.user.tier,
      });
    }
    return next();
  };
};

// Require API access (agency+)
const requireApiAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required', code: 'NO_AUTH' });
  }
  const tier = getTier(req.user.tier);
  if (!tier.apiAccess) {
    return res.status(403).json({
      success: false,
      error: 'API access requires Agency or Enterprise tier',
      code: 'API_ACCESS_DENIED',
    });
  }
  return next();
};

// Track API key usage after response
const trackApiUsage = (req, res, next) => {
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    if (req.apiKey) {
      const db = getFirestore();
      db.collection('apiUsage').add({
        keyId: req.apiKey.id,
        userId: req.user?.uid,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      }).catch(() => {});
    }
    return originalEnd(...args);
  };
  next();
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  authenticateAny,
  optionalAuth,
  requireTier,
  requireApiAccess,
  trackApiUsage,
};
