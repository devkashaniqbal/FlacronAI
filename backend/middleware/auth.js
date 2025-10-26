// Authentication Middleware for FlacronAI
const { getAuth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
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

    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(token);

    // Attach user info to request
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email
    };

    next();

  } catch (error) {
    // Check if token is expired (this is normal, frontend will refresh)
    if (error.code === 'auth/id-token-expired') {
      console.log('Token expired for request, client will refresh and retry');
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Log actual authentication errors
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

module.exports = {
  authenticateToken,
  optionalAuth
};
