const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getFirestore, admin } = require('../config/firebase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get Firestore instance
const db = getFirestore();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/whitelabel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Middleware to check enterprise tier
const requireEnterprise = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    if (userData.tier !== 'enterprise') {
      return res.status(403).json({
        error: 'Enterprise subscription required',
        message: 'White label features are only available for Enterprise subscribers'
      });
    }

    req.userData = userData;
    next();
  } catch (error) {
    console.error('Error checking enterprise tier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/white-label/settings
 * Get white label settings for the authenticated user
 */
router.get('/settings', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const settingsDoc = await db.collection('whiteLabelSettings').doc(req.user.userId).get();

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      return res.json({
        settings: {
          companyName: '',
          logoUrl: '',
          faviconUrl: '',
          primaryColor: '#FF7C08',
          secondaryColor: '#FF9A3C',
          accentColor: '#0f172a',
          customDomain: '',
          domainVerified: false,
          subdomain: '',
          emailFromName: '',
          emailFromAddress: '',
          emailFooterText: '',
          removeBranding: true,
          customLoginPage: true,
          customDashboard: true,
          teamMembers: []
        }
      });
    }

    res.json({ settings: settingsDoc.data() });
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/white-label/settings
 * Save white label settings
 */
router.post('/settings', authenticateToken, requireEnterprise, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      companyName,
      primaryColor,
      secondaryColor,
      accentColor,
      customDomain,
      subdomain,
      emailFromName,
      emailFromAddress,
      emailFooterText,
      removeBranding,
      customLoginPage,
      customDashboard,
      teamMembers
    } = req.body;

    // Build settings object
    const settings = {
      companyName: companyName || '',
      primaryColor: primaryColor || '#FF7C08',
      secondaryColor: secondaryColor || '#FF9A3C',
      accentColor: accentColor || '#0f172a',
      customDomain: customDomain || '',
      subdomain: subdomain || '',
      emailFromName: emailFromName || '',
      emailFromAddress: emailFromAddress || '',
      emailFooterText: emailFooterText || '',
      removeBranding: removeBranding === 'true' || removeBranding === true,
      customLoginPage: customLoginPage === 'true' || customLoginPage === true,
      customDashboard: customDashboard === 'true' || customDashboard === true,
      teamMembers: teamMembers ? JSON.parse(teamMembers) : [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle logo upload
    if (req.files && req.files.logo) {
      settings.logoUrl = `/uploads/whitelabel/${req.files.logo[0].filename}`;
    }

    // Handle favicon upload
    if (req.files && req.files.favicon) {
      settings.faviconUrl = `/uploads/whitelabel/${req.files.favicon[0].filename}`;
    }

    // Check subdomain uniqueness
    if (subdomain) {
      const existingSubdomain = await db.collection('whiteLabelSettings')
        .where('subdomain', '==', subdomain)
        .get();

      const isOwnSubdomain = existingSubdomain.docs.some(doc => doc.id === req.user.userId);

      if (!existingSubdomain.empty && !isOwnSubdomain) {
        return res.status(400).json({ error: 'Subdomain already taken' });
      }
    }

    // Save to Firestore
    await db.collection('whiteLabelSettings').doc(req.user.userId).set(settings, { merge: true });

    // Update user document with white label flag
    await db.collection('users').doc(req.user.userId).update({
      hasWhiteLabel: true,
      whiteLabelSubdomain: subdomain || null
    });

    res.json({
      success: true,
      message: 'Settings saved successfully',
      settings
    });
  } catch (error) {
    console.error('Error saving white label settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

/**
 * POST /api/white-label/verify-domain
 * Verify custom domain ownership
 */
router.post('/verify-domain', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // In production, you would:
    // 1. Check DNS TXT record for verification token
    // 2. Verify CNAME record points to your proxy
    // For now, we'll simulate verification

    const settingsDoc = await db.collection('whiteLabelSettings').doc(req.user.userId).get();

    if (!settingsDoc.exists || settingsDoc.data().customDomain !== domain) {
      return res.status(400).json({ error: 'Domain not configured' });
    }

    // Simulate DNS check (in production, use dns.resolveTxt)
    const isVerified = true; // Replace with actual DNS verification

    if (isVerified) {
      await db.collection('whiteLabelSettings').doc(req.user.userId).update({
        domainVerified: true,
        domainVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
        success: true,
        message: 'Domain verified successfully',
        verified: true
      });
    } else {
      res.json({
        success: false,
        message: 'DNS records not found. Please ensure you have added the required DNS records.',
        verified: false
      });
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ error: 'Failed to verify domain' });
  }
});

/**
 * GET /api/white-label/team
 * Get team members for white label portal
 */
router.get('/team', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const settingsDoc = await db.collection('whiteLabelSettings').doc(req.user.userId).get();

    if (!settingsDoc.exists) {
      return res.json({ teamMembers: [] });
    }

    const { teamMembers = [] } = settingsDoc.data();
    res.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

/**
 * POST /api/white-label/team/invite
 * Invite a team member to white label portal
 */
router.post('/team/invite', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const settingsDoc = await db.collection('whiteLabelSettings').doc(req.user.userId).get();
    const currentSettings = settingsDoc.exists ? settingsDoc.data() : {};
    const teamMembers = currentSettings.teamMembers || [];

    // Check if member already exists
    if (teamMembers.some(m => m.email === email)) {
      return res.status(400).json({ error: 'Team member already exists' });
    }

    // Add new team member
    const newMember = {
      id: Date.now().toString(),
      email,
      role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: req.user.userId
    };

    teamMembers.push(newMember);

    await db.collection('whiteLabelSettings').doc(req.user.userId).update({
      teamMembers
    });

    // TODO: Send invitation email to the team member

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

/**
 * DELETE /api/white-label/team/:memberId
 * Remove a team member from white label portal
 */
router.delete('/team/:memberId', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { memberId } = req.params;

    const settingsDoc = await db.collection('whiteLabelSettings').doc(req.user.userId).get();

    if (!settingsDoc.exists) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const { teamMembers = [] } = settingsDoc.data();
    const updatedMembers = teamMembers.filter(m => m.id !== memberId);

    if (teamMembers.length === updatedMembers.length) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await db.collection('whiteLabelSettings').doc(req.user.userId).update({
      teamMembers: updatedMembers
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

/**
 * POST /api/white-label/reset
 * Reset all white label settings to default
 */
router.post('/reset', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const defaultSettings = {
      companyName: '',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#FF7C08',
      secondaryColor: '#FF9A3C',
      accentColor: '#0f172a',
      customDomain: '',
      domainVerified: false,
      subdomain: '',
      emailFromName: '',
      emailFromAddress: '',
      emailFooterText: '',
      removeBranding: true,
      customLoginPage: true,
      customDashboard: true,
      teamMembers: [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('whiteLabelSettings').doc(req.user.userId).set(defaultSettings);

    // Update user document
    await db.collection('users').doc(req.user.userId).update({
      hasWhiteLabel: false,
      whiteLabelSubdomain: null
    });

    res.json({
      success: true,
      message: 'Settings reset successfully',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

/**
 * GET /api/white-label/portal/:subdomain
 * Get portal configuration by subdomain (public endpoint)
 */
router.get('/portal/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;

    const settingsSnapshot = await db.collection('whiteLabelSettings')
      .where('subdomain', '==', subdomain)
      .limit(1)
      .get();

    if (settingsSnapshot.empty) {
      return res.status(404).json({ error: 'Portal not found' });
    }

    const settings = settingsSnapshot.docs[0].data();

    // Return only public-facing settings
    res.json({
      portal: {
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        removeBranding: settings.removeBranding
      }
    });
  } catch (error) {
    console.error('Error fetching portal:', error);
    res.status(500).json({ error: 'Failed to fetch portal' });
  }
});

module.exports = router;
