import React from 'react';

const TierBadge = ({ tier, className = '' }) => {
  const tiers = {
    starter: { label: 'Starter', class: 'tier-badge-starter' },
    professional: { label: 'Professional', class: 'tier-badge-professional' },
    agency: { label: 'Agency', class: 'tier-badge-agency' },
    enterprise: { label: 'Enterprise', class: 'tier-badge-enterprise' },
  };

  const t = tiers[tier] || tiers.starter;
  return <span className={`${t.class} ${className}`}>{t.label}</span>;
};

export default TierBadge;
