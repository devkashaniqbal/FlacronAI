const TIERS = {
  starter: {
    name: 'Starter',
    reportsPerMonth: 5,
    apiAccess: false,
    whiteLabel: false,
    watermark: true,
    customLogo: false,
    price: 0,
    crmAccess: false,
    exportFormats: ['pdf'],
    prioritySupport: false,
    reportHistory: false,
  },
  professional: {
    name: 'Professional',
    reportsPerMonth: 50,
    apiAccess: true,
    whiteLabel: false,
    watermark: false,
    customLogo: false,
    price: 39.99,
    crmAccess: false,
    exportFormats: ['pdf', 'docx', 'html'],
    prioritySupport: true,
    reportHistory: true,
  },
  agency: {
    name: 'Agency',
    reportsPerMonth: 200,
    apiAccess: true,
    whiteLabel: false,
    watermark: false,
    customLogo: true,
    price: 99.99,
    crmAccess: true,
    exportFormats: ['pdf', 'docx', 'html'],
    prioritySupport: true,
    reportHistory: true,
  },
  enterprise: {
    name: 'Enterprise',
    reportsPerMonth: -1, // unlimited
    apiAccess: true,
    whiteLabel: true,
    watermark: false,
    customLogo: true,
    price: 499,
    crmAccess: true,
    exportFormats: ['pdf', 'docx', 'html'],
    prioritySupport: true,
    reportHistory: true,
    dedicatedSupport: true,
    customSubdomain: true,
  },
};

const TIER_ORDER = ['starter', 'professional', 'agency', 'enterprise'];

const getTier = (tierName) => TIERS[tierName] || TIERS.starter;

const isAtLeastTier = (userTier, requiredTier) => {
  const userIdx = TIER_ORDER.indexOf(userTier || 'starter');
  const reqIdx = TIER_ORDER.indexOf(requiredTier);
  return userIdx >= reqIdx;
};

const canGenerate = (userTier, reportsThisMonth) => {
  const tier = getTier(userTier);
  if (tier.reportsPerMonth === -1) return true;
  return reportsThisMonth < tier.reportsPerMonth;
};

const getStripePriceId = (tierName) => {
  const map = {
    professional:        process.env.STRIPE_PRICE_PROFESSIONAL,
    professional_annual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
    agency:              process.env.STRIPE_PRICE_AGENCY,
    agency_annual:       process.env.STRIPE_PRICE_AGENCY_ANNUAL,
    enterprise:          process.env.STRIPE_PRICE_ENTERPRISE,
    enterprise_annual:   process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  };
  return map[tierName] || null;
};

// Resolve the base tier name from a tier key (strips _annual suffix)
const getBaseTier = (tierName) => (tierName || '').replace('_annual', '') || 'starter';

module.exports = { TIERS, TIER_ORDER, getTier, isAtLeastTier, canGenerate, getStripePriceId, getBaseTier };
