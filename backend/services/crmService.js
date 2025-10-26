// CRM Service for FlacronAI
const { getFirestore } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

/**
 * CLIENT MANAGEMENT
 */

/**
 * Create new client/customer
 */
async function createClient(userId, clientData) {
  try {
    const db = getFirestore();
    const clientId = uuidv4();

    const clientRecord = {
      clientId: clientId,
      createdBy: userId,

      // Basic Information
      companyName: clientData.companyName,
      contactName: clientData.contactName,
      email: clientData.email,
      phone: clientData.phone,

      // Client Type
      type: clientData.type || 'insurance_company', // insurance_company, adjuster, property_owner

      // Address
      address: {
        street: clientData.address?.street || '',
        city: clientData.address?.city || '',
        state: clientData.address?.state || '',
        zip: clientData.address?.zip || ''
      },

      // Additional Info
      notes: clientData.notes || '',
      tags: clientData.tags || [],
      status: 'active', // active, inactive, archived

      // Metadata
      totalClaims: 0,
      totalRevenue: 0,
      lastContactDate: null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('clients').doc(clientId).set(clientRecord);

    console.log(`✅ Client ${clientId} created successfully`);
    return {
      success: true,
      clientId: clientId,
      client: clientRecord
    };
  } catch (error) {
    console.error('Create client error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all clients
 */
async function getAllClients(userId, filters = {}) {
  try {
    const db = getFirestore();

    // Simplified query to avoid index requirements
    const snapshot = await db.collection('clients')
      .where('createdBy', '==', userId)
      .get();

    const clients = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      // Apply filters in memory
      let include = true;
      if (filters.type && data.type !== filters.type) {
        include = false;
      }
      if (filters.status && data.status !== filters.status) {
        include = false;
      }

      if (include) {
        clients.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by createdAt descending
    clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      clients: clients,
      count: clients.length
    };
  } catch (error) {
    console.error('Get clients error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get client by ID
 */
async function getClientById(clientId, userId) {
  try {
    const db = getFirestore();
    const clientDoc = await db.collection('clients').doc(clientId).get();

    if (!clientDoc.exists) {
      return {
        success: false,
        error: 'Client not found'
      };
    }

    const client = clientDoc.data();

    // Check access
    if (client.createdBy !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    return {
      success: true,
      client: { id: clientDoc.id, ...client }
    };
  } catch (error) {
    console.error('Get client error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update client
 */
async function updateClient(clientId, userId, updates) {
  try {
    const db = getFirestore();
    const clientRef = db.collection('clients').doc(clientId);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists) {
      return {
        success: false,
        error: 'Client not found'
      };
    }

    const client = clientDoc.data();
    if (client.createdBy !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    await clientRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Client updated successfully'
    };
  } catch (error) {
    console.error('Update client error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete client
 */
async function deleteClient(clientId, userId) {
  try {
    const db = getFirestore();
    const clientRef = db.collection('clients').doc(clientId);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists) {
      return {
        success: false,
        error: 'Client not found'
      };
    }

    const client = clientDoc.data();
    if (client.createdBy !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    await clientRef.delete();

    return {
      success: true,
      message: 'Client deleted successfully'
    };
  } catch (error) {
    console.error('Delete client error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * CLAIMS MANAGEMENT
 */

/**
 * Create new claim
 */
async function createClaim(userId, claimData) {
  try {
    const db = getFirestore();
    const claimId = uuidv4();

    const claimRecord = {
      claimId: claimId,
      userId: userId,

      // Client Reference
      clientId: claimData.clientId,
      clientName: claimData.clientName,

      // Claim Details
      claimNumber: claimData.claimNumber,
      insuredName: claimData.insuredName,
      propertyAddress: claimData.propertyAddress,
      lossDate: claimData.lossDate,
      lossType: claimData.lossType,

      // Status & Stage
      status: 'new', // new, assigned, in_progress, under_review, completed, closed
      priority: claimData.priority || 'medium', // low, medium, high, urgent

      // Assignment
      assignedTo: claimData.assignedTo || null,
      inspectionDate: claimData.inspectionDate || null,

      // Financial
      estimatedValue: claimData.estimatedValue || 0,
      invoiceAmount: claimData.invoiceAmount || 0,
      paidAmount: claimData.paidAmount || 0,
      paymentStatus: 'pending', // pending, invoiced, paid, overdue

      // Documents
      reportId: null,
      documents: [],
      photos: [],

      // Notes & Activity
      notes: claimData.notes || '',
      activityLog: [
        {
          action: 'created',
          by: userId,
          timestamp: new Date().toISOString(),
          note: 'Claim created'
        }
      ],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('claims').doc(claimId).set(claimRecord);

    // Update client's total claims
    if (claimData.clientId) {
      const clientRef = db.collection('clients').doc(claimData.clientId);
      const clientDoc = await clientRef.get();
      if (clientDoc.exists) {
        const client = clientDoc.data();
        await clientRef.update({
          totalClaims: (client.totalClaims || 0) + 1,
          lastContactDate: new Date().toISOString()
        });
      }
    }

    console.log(`✅ Claim ${claimId} created successfully`);
    return {
      success: true,
      claimId: claimId,
      claim: claimRecord
    };
  } catch (error) {
    console.error('Create claim error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all claims
 */
async function getAllClaims(userId, filters = {}) {
  try {
    const db = getFirestore();
    let query = db.collection('claims').where('userId', '==', userId);

    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.clientId) {
      query = query.where('clientId', '==', filters.clientId);
    }
    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const claims = [];

    snapshot.forEach(doc => {
      claims.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      claims: claims,
      count: claims.length
    };
  } catch (error) {
    console.error('Get claims error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update claim status
 */
async function updateClaimStatus(claimId, userId, newStatus, note = '') {
  try {
    const db = getFirestore();
    const claimRef = db.collection('claims').doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      return {
        success: false,
        error: 'Claim not found'
      };
    }

    const claim = claimDoc.data();
    if (claim.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    const activityEntry = {
      action: 'status_change',
      by: userId,
      timestamp: new Date().toISOString(),
      note: `Status changed from ${claim.status} to ${newStatus}${note ? ': ' + note : ''}`
    };

    await claimRef.update({
      status: newStatus,
      activityLog: [...(claim.activityLog || []), activityEntry],
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Claim status updated successfully'
    };
  } catch (error) {
    console.error('Update claim status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ANALYTICS & REPORTING
 */

/**
 * Get dashboard analytics
 */
async function getDashboardAnalytics(userId) {
  try {
    const db = getFirestore();

    // Get clients count (filter in memory to avoid index requirement)
    const clientsSnapshot = await db.collection('clients')
      .where('createdBy', '==', userId)
      .get();

    let totalClients = 0;
    clientsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active') {
        totalClients++;
      }
    });

    // Get claims
    const claimsSnapshot = await db.collection('claims')
      .where('userId', '==', userId)
      .get();

    let totalClaims = 0;
    let activeClaims = 0;
    let completedClaims = 0;
    let totalRevenue = 0;
    let pendingRevenue = 0;
    const claimsByType = {};
    const claimsByStatus = {};
    const recentActivity = [];

    claimsSnapshot.forEach(doc => {
      const claim = doc.data();
      totalClaims++;

      // Count by status
      if (claim.status === 'completed' || claim.status === 'closed') {
        completedClaims++;
      } else {
        activeClaims++;
      }

      claimsByStatus[claim.status] = (claimsByStatus[claim.status] || 0) + 1;

      // Count by type
      claimsByType[claim.lossType] = (claimsByType[claim.lossType] || 0) + 1;

      // Revenue
      if (claim.paymentStatus === 'paid') {
        totalRevenue += claim.paidAmount || 0;
      } else {
        pendingRevenue += claim.invoiceAmount || 0;
      }

      // Recent activity
      if (claim.activityLog && claim.activityLog.length > 0) {
        const latestActivity = claim.activityLog[claim.activityLog.length - 1];
        recentActivity.push({
          claimId: claim.claimId,
          claimNumber: claim.claimNumber,
          ...latestActivity
        });
      }
    });

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      analytics: {
        overview: {
          totalClients: totalClients,
          totalClaims: totalClaims,
          activeClaims: activeClaims,
          completedClaims: completedClaims
        },
        revenue: {
          total: totalRevenue,
          pending: pendingRevenue,
          collected: totalRevenue
        },
        claimsByType: claimsByType,
        claimsByStatus: claimsByStatus,
        recentActivity: recentActivity.slice(0, 10) // Last 10 activities
      }
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * SCHEDULING
 */

/**
 * Create inspection appointment
 */
async function createAppointment(userId, appointmentData) {
  try {
    const db = getFirestore();
    const appointmentId = uuidv4();

    const appointmentRecord = {
      appointmentId: appointmentId,
      userId: userId,

      // Related Entities
      claimId: appointmentData.claimId,
      clientId: appointmentData.clientId,

      // Appointment Details
      title: appointmentData.title,
      description: appointmentData.description || '',
      location: appointmentData.location,

      // Date & Time
      scheduledDate: appointmentData.scheduledDate,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,

      // Assignment
      assignedTo: appointmentData.assignedTo || userId,

      // Status
      status: 'scheduled', // scheduled, confirmed, completed, cancelled

      // Reminders
      reminderSent: false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('appointments').doc(appointmentId).set(appointmentRecord);

    // Update claim with inspection date
    if (appointmentData.claimId) {
      await db.collection('claims').doc(appointmentData.claimId).update({
        inspectionDate: appointmentData.scheduledDate,
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`✅ Appointment ${appointmentId} created successfully`);
    return {
      success: true,
      appointmentId: appointmentId,
      appointment: appointmentRecord
    };
  } catch (error) {
    console.error('Create appointment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get appointments
 */
async function getAppointments(userId, filters = {}) {
  try {
    const db = getFirestore();
    let query = db.collection('appointments').where('userId', '==', userId);

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.startDate && filters.endDate) {
      query = query.where('scheduledDate', '>=', filters.startDate)
                   .where('scheduledDate', '<=', filters.endDate);
    }

    query = query.orderBy('scheduledDate', 'asc');

    const snapshot = await query.get();
    const appointments = [];

    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };
  } catch (error) {
    console.error('Get appointments error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  // Client Management
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,

  // Claims Management
  createClaim,
  getAllClaims,
  updateClaimStatus,

  // Analytics
  getDashboardAnalytics,

  // Scheduling
  createAppointment,
  getAppointments
};
