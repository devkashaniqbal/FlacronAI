/**
 * One-time script: Creates all FlacronAI email templates in Brevo.
 * Run once: node scripts/createBrevoTemplates.js
 * Copy the printed template IDs into emailService.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const API_KEY    = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'marketing@flacronenterprises.com';
const FROM_NAME  = process.env.BREVO_FROM_NAME  || 'FlacronAI';
const SITE_URL   = process.env.FRONTEND_URL     || 'https://flacronai.com';

const brevo = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: { 'api-key': API_KEY, 'content-type': 'application/json' },
});

// ── Shared layout ─────────────────────────────────────────────────────────────
const layout = (body) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;max-width:600px;width:100%;">
  <tr>
    <td style="background:#f97316;padding:24px 40px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
          <span style="color:#fff;font-size:18px;font-weight:900;line-height:32px;">⚡</span>
        </td>
        <td style="padding-left:10px;">
          <span style="color:#fff;font-size:18px;font-weight:700;">FlacronAI</span>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="padding:40px;">${body}</td></tr>
  <tr>
    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        © 2026 Flacron Enterprises · Tampa, FL 33601<br/>
        <a href="${SITE_URL}/privacy-policy" style="color:#f97316;text-decoration:none;">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/terms-of-service" style="color:#f97316;text-decoration:none;">Terms of Service</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body></html>`;

const btn  = (text, href) =>
  `<a href="${href}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${text}</a>`;
const hr   = () => `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />`;

// ── Template definitions ──────────────────────────────────────────────────────
const TEMPLATES = [
  {
    key: 'WELCOME',
    templateName: 'FlacronAI — Welcome',
    subject: 'Welcome to FlacronAI — Your account is ready',
    htmlContent: layout(`
      <h1 style="color:#111827;font-size:26px;margin:0 0 8px;">Welcome, {{params.displayName}}!</h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">Your FlacronAI account is ready. Generate professional AI-powered insurance inspection reports in minutes.</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:20px;margin-bottom:28px;">
        <p style="margin:0;color:#9a3412;font-size:14px;font-weight:600;">🎉 You're on the Starter plan</p>
        <p style="margin:6px 0 0;color:#c2410c;font-size:13px;">5 free reports per month · PDF export included</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
        <tr>
          <td style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;vertical-align:top;width:50%;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">📸 Upload Photos</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Upload claim photos for AI analysis</p>
          </td>
          <td style="width:16px;"></td>
          <td style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;vertical-align:top;width:50%;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">📄 Generate Report</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">AI builds a full inspection report instantly</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 28px;">${btn('Go to Dashboard →', `${SITE_URL}/dashboard`)}</p>
      ${hr()}
      <p style="color:#9ca3af;font-size:12px;margin:0;">Need more? <a href="${SITE_URL}/pricing" style="color:#f97316;">Upgrade your plan</a>.</p>
    `),
  },
  {
    key: 'PASSWORD_RESET',
    templateName: 'FlacronAI — Password Reset',
    subject: 'Reset your FlacronAI password',
    htmlContent: layout(`
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;width:56px;height:56px;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;line-height:56px;font-size:24px;">🔑</div>
      </div>
      <h1 style="color:#111827;font-size:24px;margin:0 0 8px;text-align:center;">Reset Your Password</h1>
      <p style="color:#6b7280;font-size:15px;text-align:center;margin:0 0 28px;">Click the button below to set a new password. This link expires in <strong style="color:#111827;">1 hour</strong>.</p>
      <div style="text-align:center;margin-bottom:28px;">${btn('Reset Password', '{{params.resetLink}}')}</div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;">
        <p style="margin:0;color:#991b1b;font-size:13px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      ${hr()}
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Or copy: <span style="color:#f97316;word-break:break-all;">{{params.resetLink}}</span></p>
    `),
  },
  {
    key: 'PAYMENT_FAILED',
    templateName: 'FlacronAI — Payment Failed',
    subject: 'Action required — FlacronAI payment failed',
    htmlContent: layout(`
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;width:56px;height:56px;background:#fef2f2;border:1px solid #fecaca;border-radius:14px;line-height:56px;font-size:24px;">⚠️</div>
      </div>
      <h1 style="color:#111827;font-size:24px;margin:0 0 8px;text-align:center;">Payment Failed</h1>
      <p style="color:#6b7280;font-size:15px;text-align:center;margin:0 0 28px;">
        Hi <strong style="color:#111827;">{{params.displayName}}</strong>, your recent subscription payment could not be processed.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;margin-bottom:28px;">
        <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">What happens next?</p>
        <ul style="margin:8px 0 0;padding-left:20px;color:#dc2626;font-size:13px;line-height:1.8;">
          <li>Your account stays active during a short grace period</li>
          <li>We will retry your payment automatically</li>
          <li>After 3 failed attempts your plan downgrades to Starter</li>
        </ul>
      </div>
      <div style="text-align:center;margin-bottom:28px;">${btn('Update Payment Method', `${SITE_URL}/settings?tab=billing`)}</div>
      ${hr()}
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Questions? <a href="mailto:support@flacronai.com" style="color:#f97316;">support@flacronai.com</a></p>
    `),
  },
  {
    key: 'TEAM_INVITE',
    templateName: 'FlacronAI — Team Invitation',
    subject: "{{params.ownerName}} invited you to join their FlacronAI team",
    htmlContent: layout(`
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;width:56px;height:56px;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;line-height:56px;font-size:24px;">👥</div>
      </div>
      <h1 style="color:#111827;font-size:24px;margin:0 0 8px;text-align:center;">You've Been Invited</h1>
      <p style="color:#6b7280;font-size:15px;text-align:center;margin:0 0 28px;">
        <strong style="color:#111827;">{{params.ownerName}}</strong> has invited you to join their enterprise team on FlacronAI.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:28px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Your role</td>
            <td style="text-align:right;padding:6px 0;">
              <span style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;">{{params.role}}</span>
            </td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Platform</td>
            <td style="text-align:right;color:#111827;font-size:13px;font-weight:600;padding:6px 0;">FlacronAI Enterprise</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Access level</td>
            <td style="text-align:right;color:#111827;font-size:13px;padding:6px 0;">Enterprise tier</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:28px;">${btn('Accept Invitation', '{{params.inviteLink}}')}</div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;">
        <p style="margin:0;color:#166534;font-size:13px;text-align:center;">✓ Immediate access to enterprise report generation, white-label tools, and team features.</p>
      </div>
      ${hr()}
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">This is a single-use invite. If unexpected, you can safely ignore it.</p>
    `),
  },
  {
    key: 'SALES_LEAD',
    templateName: 'FlacronAI — New Sales Lead',
    subject: 'New Sales Lead: {{params.leadName}} — {{params.leadCompany}}',
    htmlContent: layout(`
      <h1 style="color:#111827;font-size:22px;margin:0 0 20px;">🔥 New Sales Lead</h1>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;width:40%;">Name</td><td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">{{params.leadName}}</td></tr>
        <tr style="background:#ffffff;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">{{params.leadEmail}}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">Company</td><td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">{{params.leadCompany}}</td></tr>
        <tr style="background:#ffffff;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">Phone</td><td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">{{params.leadPhone}}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">Type</td><td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">{{params.leadType}}</td></tr>
        <tr style="background:#ffffff;"><td style="padding:12px 16px;font-weight:600;font-size:13px;color:#374151;">Monthly Volume</td><td style="padding:12px 16px;font-size:13px;color:#111827;">{{params.leadVolume}}</td></tr>
      </table>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-top:20px;">
        <p style="margin:0 0 6px;font-weight:600;font-size:13px;color:#374151;">Message</p>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">{{params.leadMessage}}</p>
      </div>
      ${hr()}
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
        Received via FlacronAI contact form · <a href="${SITE_URL}/admin-tier-update" style="color:#f97316;">Admin Panel</a>
      </p>
    `),
  },
];

// ── Create templates in Brevo ─────────────────────────────────────────────────
async function createTemplates() {
  console.log('Creating Brevo templates...\n');
  const ids = {};

  for (const tpl of TEMPLATES) {
    try {
      const { data } = await brevo.post('/smtp/templates', {
        templateName: tpl.templateName,
        subject:      tpl.subject,
        htmlContent:  tpl.htmlContent,
        sender:       { name: FROM_NAME, email: FROM_EMAIL },
        isActive:     true,
      });
      ids[tpl.key] = data.id;
      console.log(`✅  ${tpl.key.padEnd(16)} → template ID: ${data.id}`);
    } catch (err) {
      console.error(`❌  ${tpl.key} failed:`, err.response?.data || err.message);
    }
  }

  console.log('\n── Paste into emailService.js ──────────────────────────────');
  console.log('const TEMPLATE_IDS = ' + JSON.stringify(ids, null, 2) + ';');
  console.log('────────────────────────────────────────────────────────────\n');
  return ids;
}

createTemplates();
