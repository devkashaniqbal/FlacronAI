// Authentication Routes for FlacronAI
const express = require('express');
const router = express.Router();
const { getAuth, getFirestore } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Secret for mobile app JWT tokens (same as middleware)
const JWT_SECRET = process.env.JWT_SECRET || 'flacronai-mobile-secret-2024';

/**
 * POST /api/auth/register
 * Register a new user (for mobile app)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Create user with Firebase Admin SDK
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    // Create user document in Firestore
    const db = getFirestore();
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      tier: 'starter',
      reportsGenerated: 0,
      currentPeriod: currentPeriod,
      periodUsage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate email verification link
    const verificationLink = await getAuth().generateEmailVerificationLink(email);

    console.log(`✅ User registered: ${email}`);
    console.log(`📧 Email verification link: ${verificationLink}`);

    res.json({
      success: true,
      message: 'Account created successfully! Please verify your email before logging in.',
      userId: userRecord.uid,
      verificationLink: verificationLink // In production, send this via email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and create JWT token (for mobile app)
 * Uses Firebase Auth REST API to verify password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, skipEmailVerification } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Firebase Auth REST API endpoint for password verification
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAEtWQZaTf8czc8tLdMatYSnAUhIOyCOis';
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    // Verify password using Firebase Auth REST API
    let firebaseResponse;
    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      });

      firebaseResponse = await response.json();

      // Check for Firebase Auth errors
      if (firebaseResponse.error) {
        const errorCode = firebaseResponse.error.message;
        console.log(`❌ Firebase Auth error: ${errorCode}`);

        let errorMessage = 'Invalid email or password';

        if (errorCode === 'EMAIL_NOT_FOUND') {
          errorMessage = 'No account found with this email';
        } else if (errorCode === 'INVALID_PASSWORD' || errorCode === 'INVALID_LOGIN_CREDENTIALS') {
          errorMessage = 'Incorrect password';
        } else if (errorCode === 'USER_DISABLED') {
          errorMessage = 'This account has been disabled';
        } else if (errorCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
          errorMessage = 'Too many failed login attempts. Please try again later.';
        }

        return res.status(401).json({
          success: false,
          error: errorMessage
        });
      }
    } catch (fetchError) {
      console.error('Firebase Auth API error:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Authentication service unavailable'
      });
    }

    // Password verified! Now get user record
    const userRecord = await getAuth().getUserByEmail(email);

    // Check email verification (skip for development/testing)
    if (!skipEmailVerification && !userRecord.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in',
        emailVerified: false
      });
    }

    // Get user data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    let userData = null;
    if (userDoc.exists) {
      userData = userDoc.data();
    }

    // Create JWT token for mobile app
    const token = jwt.sign(
      {
        userId: userRecord.uid,
        email: userRecord.email
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Token valid for 30 days
    );

    console.log(`✅ User logged in (password verified): ${email}`);

    res.json({
      success: true,
      token: token,
      user: {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || email.split('@')[0],
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime,
        tier: userData?.tier || 'starter',
        reportsGenerated: userData?.reportsGenerated || 0
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(401).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userRecord = await getAuth().getUser(userId);
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    let userData = null;
    if (userDoc.exists) {
      userData = userDoc.data();
    }

    res.json({
      success: true,
      user: {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || userRecord.email.split('@')[0],
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.metadata.creationTime,
        tier: userData?.tier || 'starter',
        reportsGenerated: userData?.reportsGenerated || 0
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Get user by email
    let userRecord;
    try {
      userRecord = await getAuth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email'
        });
      }
      throw error;
    }

    // Check if already verified
    if (userRecord.emailVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified. You can login now.',
        alreadyVerified: true
      });
    }

    // Generate new verification link
    const verificationLink = await getAuth().generateEmailVerificationLink(email);

    console.log(`📧 Resent verification email to: ${email}`);
    console.log(`📧 Verification link: ${verificationLink}`);

    // In production, send this via email service (SendGrid, etc.)
    // For now, we'll log it

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox and spam folder.',
      verificationLink: verificationLink // Remove in production
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification email'
    });
  }
});

/**
 * POST /api/auth/check-verification
 * Check if user's email is verified
 */
router.post('/check-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Get user by email
    let userRecord;
    try {
      userRecord = await getAuth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email'
        });
      }
      throw error;
    }

    console.log(`🔍 Checking verification for: ${email} - Verified: ${userRecord.emailVerified}`);

    res.json({
      success: true,
      emailVerified: userRecord.emailVerified,
      message: userRecord.emailVerified
        ? 'Email is verified. You can login now.'
        : 'Email not verified yet. Please check your inbox.'
    });

  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check verification status'
    });
  }
});

module.exports = router;
