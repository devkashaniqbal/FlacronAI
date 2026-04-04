const axios = require('axios');
require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL    = process.env.BREVO_FROM_EMAIL || 'marketing@flacronenterprises.com';
const FROM_NAME     = process.env.BREVO_FROM_NAME  || 'FlacronAI';
const FRONTEND_URL  = process.env.FRONTEND_URL     || 'http://localhost:5173';

// Brevo stored template IDs (created via scripts/createBrevoTemplates.js)
const TEMPLATE_IDS = {
  WELCOME:            10,
  PASSWORD_RESET:     11,
  PAYMENT_FAILED:     12,
  TEAM_INVITE:        13,
  SALES_LEAD:         14,
  EMAIL_VERIFICATION: 15, // Falls back to inline HTML (no Brevo template yet)
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

// ── Email verification ────────────────────────────────────────────────────────
const sendEmailVerificationEmail = async (email, displayName, verificationLink) => {
  const name = displayName || 'there';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify Your Email – FlacronAI</title>
</head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:40px 32px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:32px;">✅</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Verify Your Email</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">One last step to activate your FlacronAI account</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Thanks for signing up for FlacronAI! Please verify your email address to activate your account and start generating professional insurance inspection reports.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:10px;box-shadow:0 4px 12px rgba(249,115,22,0.35);">
                  Verify Email Address
                </a>
              </div>
              <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;word-break:break-all;color:#f97316;font-size:12px;text-align:center;">${verificationLink}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#f8f8f8;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
              <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;">&copy; ${new Date().getFullYear()} FlacronAI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to:      email,
    subject: 'Verify your FlacronAI email address',
    html,
    text:    `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link expires in 24 hours.\n\n— FlacronAI`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentFailedEmail,
  sendTeamInviteEmail,
  sendSalesNotificationEmail,
  sendEmailVerificationEmail,
};
