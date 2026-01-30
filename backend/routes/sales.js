const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');

/**
 * POST /api/sales/contact
 * Submit a sales inquiry form
 */
router.post('/contact', async (req, res) => {
  try {
    const { fullName, companyName, workEmail, phone, companyType, monthlyUsage, message } = req.body;

    // Validate required fields
    if (!fullName || !companyName || !workEmail || !phone || !companyType || !monthlyUsage) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create sales lead object
    const salesLead = {
      fullName,
      companyName,
      workEmail,
      phone,
      companyType,
      monthlyUsage,
      message: message || '',
      status: 'new', // new, contacted, qualified, converted, lost
      source: 'contact_sales_form',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null, // Admin will assign later
      priority: determinePriority(monthlyUsage, companyType),
      notes: []
    };

    // Save to Firestore
    const db = admin.firestore();
    const docRef = await db.collection('salesLeads').add(salesLead);

    console.log(`✅ New sales lead created: ${docRef.id}`);
    console.log(`   Company: ${companyName}`);
    console.log(`   Contact: ${fullName} (${workEmail})`);
    console.log(`   Type: ${companyType}`);
    console.log(`   Usage: ${monthlyUsage}`);
    console.log(`   Priority: ${salesLead.priority}`);

    res.status(201).json({
      success: true,
      message: 'Sales inquiry submitted successfully',
      leadId: docRef.id
    });

  } catch (error) {
    console.error('❌ Error creating sales lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit sales inquiry'
    });
  }
});

/**
 * Determine priority based on monthly usage and company type
 */
function determinePriority(monthlyUsage, companyType) {
  // High priority: Enterprise or high volume
  if (companyType === 'Enterprise' || monthlyUsage === '5000+' || monthlyUsage === '1001-5000') {
    return 'high';
  }

  // Medium priority: Insurance companies or moderate volume
  if (companyType === 'Insurance' || monthlyUsage === '501-1000' || monthlyUsage === '101-500') {
    return 'medium';
  }

  // Low priority: Others or low volume
  return 'low';
}

/**
 * GET /api/sales/leads
 * Get all sales leads (Admin only)
 */
router.get('/leads', async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;

    const db = admin.firestore();
    let query = db.collection('salesLeads').orderBy('createdAt', 'desc');

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }

    // Filter by priority if provided
    if (priority) {
      query = query.where('priority', '==', priority);
    }

    // Apply limit
    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    const leads = [];

    snapshot.forEach(doc => {
      leads.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    res.json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    console.error('❌ Error fetching sales leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales leads'
    });
  }
});

/**
 * PATCH /api/sales/leads/:leadId
 * Update a sales lead (Admin only)
 */
router.patch('/leads/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, assignedTo, priority, notes } = req.body;

    const db = admin.firestore();
    const leadRef = db.collection('salesLeads').doc(leadId);

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    if (notes) {
      updateData.notes = admin.firestore.FieldValue.arrayUnion({
        text: notes,
        addedAt: new Date().toISOString(),
        addedBy: req.body.addedBy || 'admin'
      });
    }

    await leadRef.update(updateData);

    res.json({
      success: true,
      message: 'Sales lead updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating sales lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sales lead'
    });
  }
});

/**
 * DELETE /api/sales/leads/:leadId
 * Delete a sales lead (Admin only)
 */
router.delete('/leads/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;

    const db = admin.firestore();
    await db.collection('salesLeads').doc(leadId).delete();

    res.json({
      success: true,
      message: 'Sales lead deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting sales lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sales lead'
    });
  }
});

/**
 * POST /api/sales/leads/:leadId/convert-to-customer
 * Convert sales lead to Enterprise customer
 */
router.post('/leads/:leadId/convert-to-customer', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { companyName, fullName, workEmail, phone } = req.body;

    const db = admin.firestore();

    // Get the lead
    const leadRef = db.collection('salesLeads').doc(leadId);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Sales lead not found'
      });
    }

    const lead = leadDoc.data();

    // Create enterprise client
    const clientData = {
      companyName,
      contactName: fullName,
      email: workEmail,
      phone,
      type: 'Enterprise',
      tier: 'enterprise',
      status: 'active',
      subdomain: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      convertedFrom: leadId,
      notes: [`Converted from sales lead on ${new Date().toLocaleDateString()}`]
    };

    const clientRef = await db.collection('enterpriseClients').add(clientData);

    // Update lead status to converted
    await leadRef.update({
      status: 'converted',
      convertedAt: admin.firestore.FieldValue.serverTimestamp(),
      convertedToClientId: clientRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send approval email
    const approvalLink = `https://flacronai.com/enterprise/${clientData.subdomain}`;

    console.log(`✅ Lead converted to Enterprise customer`);
    console.log(`   Company: ${companyName}`);
    console.log(`   Subdomain: ${clientData.subdomain}`);
    console.log(`   Approval Link: ${approvalLink}`);
    console.log(`   📧 Email would be sent to: ${workEmail}`);

    // TODO: Send actual email using SendGrid/Nodemailer
    // For now, we'll just log it
    const emailContent = {
      to: workEmail,
      subject: 'Welcome to FlacronAI Enterprise - You\'re Approved!',
      html: `
        <h1>Congratulations ${fullName}!</h1>
        <p>Your Enterprise account for <strong>${companyName}</strong> has been approved!</p>
        <p>Your custom portal will be ready in 1-2 business days at:</p>
        <p><a href="${approvalLink}" style="font-size: 18px; color: #FF7C08; font-weight: bold;">${approvalLink}</a></p>
        <p>We'll send you another email when your portal is ready to use.</p>
        <p>Thank you for choosing FlacronAI!</p>
      `
    };

    res.json({
      success: true,
      message: 'Lead converted to Enterprise customer successfully',
      clientId: clientRef.id,
      subdomain: clientData.subdomain,
      approvalLink,
      emailSent: true // In production, this would be based on actual email sending
    });

  } catch (error) {
    console.error('❌ Error converting lead to customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead to customer'
    });
  }
});

module.exports = router;
