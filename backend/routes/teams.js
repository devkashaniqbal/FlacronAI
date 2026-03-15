const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getFirestore, getAuth } = require('../config/firebase');
const { authenticateToken, requireTier } = require('../middleware/auth');
const { sendTeamInviteEmail } = require('../services/emailService');

const enterpriseOnly = requireTier('enterprise');

// Role hierarchy
const ROLES = {
  owner:  { label: 'Owner',  canGenerate: true,  canExport: true,  canManageTeam: true,  canBilling: true,  canWhiteLabel: true  },
  admin:  { label: 'Admin',  canGenerate: true,  canExport: true,  canManageTeam: true,  canBilling: false, canWhiteLabel: true  },
  editor: { label: 'Editor', canGenerate: true,  canExport: true,  canManageTeam: false, canBilling: false, canWhiteLabel: false },
  viewer: { label: 'Viewer', canGenerate: false, canExport: false, canManageTeam: false, canBilling: false, canWhiteLabel: false },
};

// GET /api/teams/members — list all team members
router.get('/members', authenticateToken, enterpriseOnly, async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('enterpriseTeams')
      .where('ownerId', '==', req.user.uid)
      .orderBy('invitedAt', 'desc')
      .get();

    const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, members });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/teams/invite — invite a team member by email
router.post('/invite', authenticateToken, enterpriseOnly, async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }
    if (!ROLES[role]) {
      return res.status(400).json({ success: false, error: `Invalid role. Use: ${Object.keys(ROLES).filter(r => r !== 'owner').join(', ')}` });
    }

    const db = getFirestore();

    // Check not already invited
    const existing = await db.collection('enterpriseTeams')
      .where('ownerId', '==', req.user.uid)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ success: false, error: 'This email is already on your team' });
    }

    // Get owner info for invite context
    const ownerSnap = await db.collection('users').doc(req.user.uid).get();
    const ownerData = ownerSnap.data() || {};

    const token = uuidv4();
    const memberId = uuidv4();

    const memberData = {
      id: memberId,
      ownerId: req.user.uid,
      ownerName: ownerData.displayName || req.user.email,
      email: email.toLowerCase(),
      role,
      permissions: ROLES[role],
      status: 'pending',
      inviteToken: token,
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
      userId: null,
    };

    await db.collection('enterpriseTeams').doc(memberId).set(memberData);

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;

    // Send invite email (non-blocking — don't fail if email is misconfigured)
    sendTeamInviteEmail(email, ownerData.displayName || req.user.email, role, inviteLink).catch(() => {});

    return res.json({
      success: true,
      member: memberData,
      inviteLink,
      message: `Invitation sent to ${email}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/teams/members/:memberId/role — update role
router.put('/members/:memberId/role', authenticateToken, enterpriseOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!ROLES[role] || role === 'owner') {
      return res.status(400).json({ success: false, error: `Invalid role. Use: ${Object.keys(ROLES).filter(r => r !== 'owner').join(', ')}` });
    }

    const db = getFirestore();
    const doc = await db.collection('enterpriseTeams').doc(req.params.memberId).get();
    if (!doc.exists || doc.data().ownerId !== req.user.uid) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    await doc.ref.update({ role, permissions: ROLES[role], updatedAt: new Date().toISOString() });
    return res.json({ success: true, role, permissions: ROLES[role] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/teams/members/:memberId — remove member
router.delete('/members/:memberId', authenticateToken, enterpriseOnly, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('enterpriseTeams').doc(req.params.memberId).get();
    if (!doc.exists || doc.data().ownerId !== req.user.uid) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    await doc.ref.delete();
    return res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/teams/roles — get available roles and their permissions
router.get('/roles', authenticateToken, enterpriseOnly, async (req, res) => {
  return res.json({ success: true, roles: ROLES });
});

// POST /api/teams/accept/:token — accept an invite (called from auth flow)
router.post('/accept/:token', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('enterpriseTeams')
      .where('inviteToken', '==', req.params.token)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invite token' });
    }

    const doc = snap.docs[0];
    const data = doc.data();

    if (data.email !== req.user.email) {
      return res.status(403).json({ success: false, error: 'This invite was sent to a different email address' });
    }

    await doc.ref.update({
      status: 'active',
      userId: req.user.uid,
      acceptedAt: new Date().toISOString(),
      inviteToken: null,
    });

    // Give the user enterprise tier access (linked to owner)
    await db.collection('users').doc(req.user.uid).update({
      teamOwnerId: data.ownerId,
      teamRole: data.role,
      teamPermissions: data.permissions,
      tier: 'enterprise',
    });

    return res.json({ success: true, message: 'Team invite accepted', role: data.role, permissions: data.permissions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
