const express = require('express');
const router = express.Router();
const { getAuth, getFirestore } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.mapped() });
  }

  const { email, password, displayName } = req.body;

  try {
    const auth = getAuth();
    const db = getFirestore();

    // Create Firebase user
    const userRecord = await auth.createUser({ email, password, displayName });

    // Create Firestore user doc
    const userProfile = {
      uid: userRecord.uid,
      email,
      displayName,
      tier: 'starter',
      reportsGenerated: 0,
      reportsThisMonth: 0,
      monthResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: '',
      company: '',
      address: '',
      logoUrl: null,
      notificationsEnabled: true,
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);

    // Create custom JWT
    const token = jwt.sign({ uid: userRecord.uid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userProfile,
    });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed', code: 'REGISTER_ERROR' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.mapped() });
  }

  const { email, password } = req.body;

  try {
    // Firebase Admin doesn't support password verification directly — use REST API
    const axios = require('axios');
    const firebaseApiKey = process.env.FIREBASE_API_KEY;

    if (!firebaseApiKey) {
      return res.status(500).json({ success: false, error: 'Firebase API key not configured', code: 'CONFIG_ERROR' });
    }

    const loginRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      { email, password, returnSecureToken: true }
    );

    const { localId: uid, idToken } = loginRes.data;
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userProfile = userDoc.exists ? userDoc.data() : { uid, email, tier: 'starter' };

    return res.json({
      success: true,
      token: idToken,
      user: userProfile,
    });
  } catch (err) {
    const firebaseError = err.response?.data?.error?.message;
    if (firebaseError === 'INVALID_PASSWORD' || firebaseError === 'EMAIL_NOT_FOUND' || firebaseError === 'INVALID_LOGIN_CREDENTIALS') {
      return res.status(401).json({ success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, error: 'Login failed', code: 'LOGIN_ERROR' });
  }
});

// POST /api/auth/verify
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userProfile = userDoc.exists ? userDoc.data() : req.user;
    return res.json({ success: true, user: userProfile });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Verification failed', code: 'VERIFY_ERROR' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await getAuth().revokeRefreshTokens(req.user.uid);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.json({ success: true, message: 'Logged out' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token required', code: 'NO_TOKEN' });
  }
  try {
    const axios = require('axios');
    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
      { grant_type: 'refresh_token', refresh_token: refreshToken }
    );
    return res.json({ success: true, token: response.data.id_token, refreshToken: response.data.refresh_token });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token refresh failed', code: 'REFRESH_ERROR' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.mapped() });
  }
  try {
    const link = await getAuth().generatePasswordResetLink(req.body.email);
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(req.body.email, link);
    return res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    // Don't reveal if email exists
    return res.json({ success: true, message: 'If that email exists, a reset link was sent' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, [
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.mapped() });
  }
  try {
    await getAuth().updateUser(req.user.uid, { password: req.body.newPassword });
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password', code: 'PASSWORD_ERROR' });
  }
});

module.exports = router;
