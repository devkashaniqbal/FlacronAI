// Subscription Tiers Configuration for FlacronAI

const TIERS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceId: null, // No Stripe price ID for free tier
    reportsPerMonth: 1,
    features: {
      allReportTypes: true,
      pdfExport: true,
      docxExport: false,
      htmlExport: true,
      noWatermark: false,
      customLogo: false,
      prioritySupport: false,
      photoUpload: false,
      photoAnalysis: false,
      maxPhotosPerReport: 0
    },
    description: '1 report per month - Perfect for trying out the service'
  },

  professional: {
    name: 'Professional',
    price: 39.99,
    priceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: 20,
    features: {
      allReportTypes: true,
      pdfExport: true,
      docxExport: true,
      htmlExport: true,
      noWatermark: true,
      customLogo: true,
      prioritySupport: false,
      emailSupport: true,
      photoUpload: true,
      photoAnalysis: true,
      maxPhotosPerReport: 5
    },
    description: '20 reports per month - Great for individual professionals'
  },

  agency: {
    name: 'Agency',
    price: 99.99,
    priceId: 'price_agency_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: 100,
    maxUsers: 5,
    features: {
      allReportTypes: true,
      pdfExport: true,
      docxExport: true,
      htmlExport: true,
      noWatermark: true,
      customLogo: true,
      agencyDashboard: true,
      customBranding: true,
      prioritySupport: false,
      emailSupport: true,
      photoUpload: true,
      photoAnalysis: true,
      maxPhotosPerReport: 10
    },
    description: '100 reports per month - Perfect for small agencies'
  },

  enterprise: {
    name: 'Enterprise',
    price: 499,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: -1, // Unlimited
    maxUsers: -1, // Unlimited
    features: {
      allReportTypes: true,
      pdfExport: true,
      docxExport: true,
      htmlExport: true,
      noWatermark: true,
      customLogo: true,
      agencyDashboard: true,
      customBranding: true,
      whiteLabelPortal: true,
      apiAccess: true,
      customIntegration: true,
      dedicatedSupport: true,
      prioritySupport: true,
      photoUpload: true,
      photoAnalysis: true,
      maxPhotosPerReport: -1 // Unlimited
    },
    description: 'Unlimited reports and users - Enterprise solution'
  }
};

/**
 * Get tier configuration
 */
function getTier(tierName) {
  const tier = TIERS[tierName.toLowerCase()];
  if (!tier) {
    return TIERS.starter; // Default to starter if tier not found
  }
  return tier;
}

/**
 * Check if user can perform action based on tier
 */
function canPerformAction(tierName, action) {
  const tier = getTier(tierName);
  return tier.features[action] === true;
}

/**
 * Get reports limit for tier
 */
function getReportsLimit(tierName) {
  const tier = getTier(tierName);
  return tier.reportsPerMonth;
}

/**
 * Check if tier has unlimited reports
 */
function hasUnlimitedReports(tierName) {
  const tier = getTier(tierName);
  return tier.reportsPerMonth === -1;
}

/**
 * Get all available tiers
 */
function getAllTiers() {
  return Object.keys(TIERS).map(key => ({
    id: key,
    ...TIERS[key]
  }));
}

/**
 * Calculate usage percentage
 */
function getUsagePercentage(reportsUsed, tierName) {
  const tier = getTier(tierName);
  if (tier.reportsPerMonth === -1) {
    return 0; // Unlimited
  }
  return Math.round((reportsUsed / tier.reportsPerMonth) * 100);
}

/**
 * Check if user is approaching limit
 */
function isApproachingLimit(reportsUsed, tierName) {
  const percentage = getUsagePercentage(reportsUsed, tierName);
  return percentage >= 80;
}

/**
 * Check if user has exceeded limit
 */
function hasExceededLimit(reportsUsed, tierName) {
  const tier = getTier(tierName);
  if (tier.reportsPerMonth === -1) {
    return false; // Unlimited
  }
  return reportsUsed >= tier.reportsPerMonth;
}

module.exports = {
  TIERS,
  getTier,
  canPerformAction,
  getReportsLimit,
  hasUnlimitedReports,
  getAllTiers,
  getUsagePercentage,
  isApproachingLimit,
  hasExceededLimit
};
