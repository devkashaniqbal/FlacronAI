const axios = require('axios');
require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL    = process.env.BREVO_FROM_EMAIL || 'marketing@flacronenterprises.com';
const FROM_NAME     = process.env.BREVO_FROM_NAME  || 'FlacronAI';
const FRONTEND_URL  = process.env.FRONTEND_URL     || 'http://localhost:5173';

// Brevo stored template IDs (created via scripts/createBrevoTemplates.js)
const TEMPLATE_IDS = {
  WELCOME:        10,
  PASSWORD_RESET: 11,
  PAYMENT_FAILED: 12,
  TEAM_INVITE:    13,
  SALES_LEAD:     14,
};

const brevo = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
});

// ── Core sender — uses stored template ID + dynamic params ────────────────────
const sendEmail = async ({ to, templateId, params, subject, html, text }) => {
  if (!BREVO_API_KEY) {
    console.warn('[Email] Brevo API key not configured — skipping send');
    return { skipped: true };
  }

  // Prefer template ID if provided
  if (templateId) {
    const { data } = await brevo.post('/smtp/email', {
      to:         [{ email: to }],
      templateId,
      params,
    });
    return data;
  }

  // Fallback: inline HTML (used only if template ID not available)
  const { data } = await brevo.post('/smtp/email', {
    sender:      { name: FROM_NAME, email: FROM_EMAIL },
    to:          [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  });
  return data;
};

// ── Welcome ───────────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, displayName) => {
  return sendEmail({
    to:         email,
    templateId: TEMPLATE_IDS.WELCOME,
    params:     { displayName: displayName || 'there' },
  });
};

// ── Password reset ────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (email, resetLink) => {
  return sendEmail({
    to:         email,
    templateId: TEMPLATE_IDS.PASSWORD_RESET,
    params:     { resetLink },
  });
};

// ── Payment failed ────────────────────────────────────────────────────────────
const sendPaymentFailedEmail = async (email, displayName) => {
  return sendEmail({
    to:         email,
    templateId: TEMPLATE_IDS.PAYMENT_FAILED,
    params:     {
      displayName:    displayName || 'there',
      settingsLink:   `${FRONTEND_URL}/settings?tab=billing`,
    },
  });
};

// ── Team invite ───────────────────────────────────────────────────────────────
const sendTeamInviteEmail = async (email, ownerName, role, inviteLink) => {
  return sendEmail({
    to:         email,
    templateId: TEMPLATE_IDS.TEAM_INVITE,
    params:     {
      ownerName,
      role:       role.charAt(0).toUpperCase() + role.slice(1),
      inviteLink,
    },
  });
};

// ── Sales lead notification ───────────────────────────────────────────────────
const sendSalesNotificationEmail = async (lead) => {
  return sendEmail({
    to:         process.env.ADMIN_EMAIL,
    templateId: TEMPLATE_IDS.SALES_LEAD,
    params:     {
      leadName:    lead.name,
      leadEmail:   lead.email,
      leadCompany: lead.company    || '—',
      leadPhone:   lead.phone      || '—',
      leadType:    lead.companyType|| '—',
      leadVolume:  lead.monthlyVolume || '—',
      leadMessage: lead.message    || '—',
    },
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentFailedEmail,
  sendTeamInviteEmail,
  sendSalesNotificationEmail,
};
