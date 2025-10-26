// Report Management Service for FlacronAI
const { getFirestore } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const { getTier, hasExceededLimit, getReportsLimit } = require('../config/tiers');

/**
 * Create new report record in database
 */
async function createReport(userId, reportData, aiContent) {
  try {
    const db = getFirestore();
    const reportId = uuidv4();

    const reportRecord = {
      reportId: reportId,
      userId: userId,
      claimNumber: reportData.claimNumber,
      insuredName: reportData.insuredName,
      propertyAddress: reportData.propertyAddress,
      lossDate: reportData.lossDate,
      lossType: reportData.lossType,
      reportType: reportData.reportType,
      status: 'draft',
      content: aiContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        wordCount: aiContent.split(' ').length,
        generatedBy: 'gemini-2.5-pro'
      }
    };

    await db.collection('reports').doc(reportId).set(reportRecord);

    console.log(`✅ Report ${reportId} created successfully`);
    return {
      success: true,
      reportId: reportId,
      report: reportRecord
    };
  } catch (error) {
    console.error('Create report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get report by ID
 */
async function getReportById(reportId, userId) {
  try {
    const db = getFirestore();
    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return {
        success: false,
        error: 'Report not found'
      };
    }

    const report = reportDoc.data();

    // Check if user has access to this report
    if (report.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    return {
      success: true,
      report: report
    };
  } catch (error) {
    console.error('Get report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all reports for a user
 */
async function getUserReports(userId, limit = 50, offset = 0) {
  try {
    const db = getFirestore();
    const reportsSnapshot = await db.collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      reports: reports,
      count: reports.length
    };
  } catch (error) {
    console.error('Get user reports error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update report
 */
async function updateReport(reportId, userId, updates) {
  try {
    const db = getFirestore();
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return {
        success: false,
        error: 'Report not found'
      };
    }

    const report = reportDoc.data();
    if (report.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    await reportRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Report updated successfully'
    };
  } catch (error) {
    console.error('Update report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete report
 */
async function deleteReport(reportId, userId) {
  try {
    const db = getFirestore();
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return {
        success: false,
        error: 'Report not found'
      };
    }

    const report = reportDoc.data();
    if (report.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized access'
      };
    }

    await reportRef.delete();

    return {
      success: true,
      message: 'Report deleted successfully'
    };
  } catch (error) {
    console.error('Delete report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Track user report usage
 */
async function trackReportUsage(userId) {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    // Get current month/year for tracking
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (!userDoc.exists) {
      // Create user record if doesn't exist
      await userRef.set({
        userId: userId,
        reportsGenerated: 1,
        currentPeriod: currentPeriod,
        periodUsage: 1,
        createdAt: new Date().toISOString(),
        tier: 'starter'
      });
    } else {
      const userData = userDoc.data();

      // Check if we're in a new billing period
      if (userData.currentPeriod !== currentPeriod) {
        // Reset monthly usage for new period
        await userRef.update({
          reportsGenerated: (userData.reportsGenerated || 0) + 1,
          currentPeriod: currentPeriod,
          periodUsage: 1,
          lastReportDate: new Date().toISOString()
        });
      } else {
        // Increment report count for current period
        await userRef.update({
          reportsGenerated: (userData.reportsGenerated || 0) + 1,
          periodUsage: (userData.periodUsage || 0) + 1,
          lastReportDate: new Date().toISOString()
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Track usage error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check user tier limits
 */
async function checkUserLimits(userId) {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    let userDoc;
    let userData = null;

    // Get current period
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Try to get the document, but handle NOT_FOUND errors gracefully
    try {
      userDoc = await userRef.get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } catch (getError) {
      // If get fails (e.g., NOT_FOUND), treat as non-existent document
      console.log(`Document get failed for ${userId}, will create new:`, getError.message);
      userData = null;
    }

    if (!userData) {
      // Auto-create user document with starter tier
      const newUserData = {
        userId: userId,
        tier: 'starter',
        reportsGenerated: 0,
        currentPeriod: currentPeriod,
        periodUsage: 0,
        createdAt: new Date().toISOString()
      };

      try {
        await userRef.set(newUserData);
        console.log(`✅ Auto-created user document for ${userId}`);
      } catch (setError) {
        console.error(`Failed to create user document for ${userId}:`, setError.message);
        // Continue anyway with default values
      }

      const tierConfig = getTier('starter');
      return {
        success: true,
        canGenerate: true,
        tier: 'starter',
        tierName: tierConfig.name,
        reportsUsed: 0,
        reportsLimit: tierConfig.reportsPerMonth,
        periodUsage: 0,
        features: tierConfig.features
      };
    }

    const tier = userData.tier || 'starter';
    const tierConfig = getTier(tier);

    // Check if we're in a new period (auto-reset)
    let periodUsage = userData.periodUsage || 0;
    if (userData.currentPeriod !== currentPeriod) {
      periodUsage = 0; // Reset for new period
    }

    const reportsLimit = getReportsLimit(tier);
    const canGenerate = !hasExceededLimit(periodUsage, tier);

    return {
      success: true,
      canGenerate: canGenerate,
      tier: tier,
      tierName: tierConfig.name,
      reportsUsed: periodUsage,
      reportsLimit: reportsLimit === -1 ? 'Unlimited' : reportsLimit,
      totalReportsGenerated: userData.reportsGenerated || 0,
      features: tierConfig.features,
      currentPeriod: currentPeriod
    };
  } catch (error) {
    console.error('Check limits error:', error);

    // Return default values to allow user to continue
    const tierConfig = getTier('starter');
    return {
      success: true,
      canGenerate: true,
      tier: 'starter',
      tierName: tierConfig.name,
      reportsUsed: 0,
      reportsLimit: tierConfig.reportsPerMonth,
      periodUsage: 0,
      features: tierConfig.features
    };
  }
}

/**
 * Get user usage stats
 */
async function getUserUsage(userId) {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    let userDoc;
    let userData = null;

    // Try to get the document, but handle NOT_FOUND errors gracefully
    try {
      userDoc = await userRef.get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } catch (getError) {
      // If get fails (e.g., NOT_FOUND), treat as non-existent document
      console.log(`Document get failed for ${userId}, will create new:`, getError.message);
      userData = null;
    }

    if (!userData) {
      // Auto-create user document with starter tier
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const newUserData = {
        userId: userId,
        tier: 'starter',
        reportsGenerated: 0,
        currentPeriod: currentPeriod,
        periodUsage: 0,
        createdAt: new Date().toISOString()
      };

      try {
        await userRef.set(newUserData);
        console.log(`✅ Auto-created user document for ${userId}`);
      } catch (setError) {
        console.error(`Failed to create user document for ${userId}:`, setError.message);
        // Continue anyway with default values
      }

      const tierConfig = getTier('starter');
      return {
        success: true,
        tier: 'starter',
        tierName: tierConfig.name,
        periodUsage: 0,
        totalReports: 0,
        limit: tierConfig.reportsPerMonth,
        features: tierConfig.features
      };
    }

    const tier = userData.tier || 'starter';
    const tierConfig = getTier(tier);

    return {
      success: true,
      tier: tier,
      tierName: tierConfig.name,
      periodUsage: userData.periodUsage || 0,
      totalReports: userData.reportsGenerated || 0,
      limit: tierConfig.reportsPerMonth,
      features: tierConfig.features
    };
  } catch (error) {
    console.error('Get usage error:', error);

    // Return default values even on error to prevent frontend crashes
    const tierConfig = getTier('starter');
    return {
      success: true,
      tier: 'starter',
      tierName: tierConfig.name,
      periodUsage: 0,
      totalReports: 0,
      limit: tierConfig.reportsPerMonth,
      features: tierConfig.features
    };
  }
}

module.exports = {
  createReport,
  getReportById,
  getUserReports,
  updateReport,
  deleteReport,
  trackReportUsage,
  checkUserLimits,
  getUserUsage
};
