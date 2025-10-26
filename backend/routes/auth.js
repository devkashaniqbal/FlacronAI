// Authentication Routes for FlacronAI
const express = require('express');
const router = express.Router();
const { getAuth, getFirestore } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/sync-user
 * Sync user profile to Firestore (called after client-side registration/login)
 */
router.post('/sync-user', authenticateToken, async (req, res) => {
  try {
    const { userId, email, displayName } = req.body;

    // Verify the userId from token matches the request
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'User ID mismatch'
      });
    }

    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    // Get current period for new users
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check if user document exists
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        userId: userId,
        email: email,
        displayName: displayName || email.split('@')[0],
        tier: 'starter',
        reportsGenerated: 0,
        currentPeriod: currentPeriod,
        periodUsage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing user document
      await userRef.update({
        email: email,
        displayName: displayName || email.split('@')[0],
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`✅ User ${userId} synced successfully`);

    res.json({
      success: true,
      message: 'User profile synced successfully'
    });

  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify ID token
 */
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);

    res.json({
      success: true,
      userId: decodedToken.uid,
      email: decodedToken.email
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout (Revoke tokens)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Revoke refresh tokens
    await getAuth().revokeRefreshTokens(userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
