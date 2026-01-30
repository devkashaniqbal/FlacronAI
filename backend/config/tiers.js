// Subscription Tiers Configuration for FlacronAI

const TIERS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceId: null, // No Stripe price ID for free tier
    reportsPerMonth: 1,
    maxUsers: 1,
    // API Configuration
    apiAccess: false,
    apiCallsPerHour: 0,
    apiCallsPerMonth: 0,
    maxApiKeys: 0,
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
      maxPhotosPerReport: 0,
      apiAccess: false,
      webhooks: false
    },
    description: '1 report per month - Perfect for trying out the service'
  },

  professional: {
    name: 'Professional',
    price: 39.99,
    priceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: 20,
    maxUsers: 1,
    // API Configuration
    apiAccess: true,
    apiCallsPerHour: 100,
    apiCallsPerMonth: 1000,
    maxApiKeys: 2,
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
      maxPhotosPerReport: 5,
      apiAccess: true,
      webhooks: false
    },
    description: '20 reports per month - Great for individual professionals'
  },

  agency: {
    name: 'Agency',
    price: 99.99,
    priceId: 'price_agency_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: 100,
    maxUsers: 5,
    // API Configuration
    apiAccess: true,
    apiCallsPerHour: 500,
    apiCallsPerMonth: 5000,
    maxApiKeys: 5,
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
      maxPhotosPerReport: 10,
      apiAccess: true,
      webhooks: true
    },
    description: '100 reports per month - Perfect for small agencies'
  },

  enterprise: {
    name: 'Enterprise',
    price: 499,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    reportsPerMonth: -1, // Unlimited
    maxUsers: -1, // Unlimited
    // API Configuration
    apiAccess: true,
    apiCallsPerHour: 10000,
    apiCallsPerMonth: -1, // Unlimited
    maxApiKeys: -1, // Unlimited
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
      maxPhotosPerReport: -1, // Unlimited
      webhooks: true
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

// ============================================
// API Access Helper Functions
// ============================================

/**
 * Check if tier has API access
 */
function hasApiAccess(tierName) {
  const tier = getTier(tierName);
  return tier.apiAccess === true;
}

/**
 * Get API calls per hour limit for tier
 */
function getApiCallsPerHour(tierName) {
  const tier = getTier(tierName);
  return tier.apiCallsPerHour || 0;
}

/**
 * Get API calls per month limit for tier
 */
function getApiCallsPerMonth(tierName) {
  const tier = getTier(tierName);
  return tier.apiCallsPerMonth || 0;
}

/**
 * Get max API keys allowed for tier
 */
function getMaxApiKeys(tierName) {
  const tier = getTier(tierName);
  return tier.maxApiKeys || 0;
}

/**
 * Check if tier has unlimited API calls
 */
function hasUnlimitedApiCalls(tierName) {
  const tier = getTier(tierName);
  return tier.apiCallsPerMonth === -1;
}

/**
 * Check if API calls exceeded hourly limit
 */
function hasExceededHourlyApiLimit(callsThisHour, tierName) {
  const tier = getTier(tierName);
  if (tier.apiCallsPerHour === -1 || tier.apiCallsPerHour === 0) {
    return false;
  }
  return callsThisHour >= tier.apiCallsPerHour;
}

/**
 * Check if API calls exceeded monthly limit
 */
function hasExceededMonthlyApiLimit(callsThisMonth, tierName) {
  const tier = getTier(tierName);
  if (tier.apiCallsPerMonth === -1) {
    return false; // Unlimited
  }
  return callsThisMonth >= tier.apiCallsPerMonth;
}

/**
 * Get rate limit info for response headers
 */
function getRateLimitInfo(tierName, currentUsage) {
  const tier = getTier(tierName);
  return {
    limit: tier.apiCallsPerHour === -1 ? 'unlimited' : tier.apiCallsPerHour,
    remaining: tier.apiCallsPerHour === -1 ? 'unlimited' : Math.max(0, tier.apiCallsPerHour - currentUsage),
    resetTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  };
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
  hasExceededLimit,
  // API Access Functions
  hasApiAccess,
  getApiCallsPerHour,
  getApiCallsPerMonth,
  getMaxApiKeys,
  hasUnlimitedApiCalls,
  hasExceededHourlyApiLimit,
  hasExceededMonthlyApiLimit,
  getRateLimitInfo
};
