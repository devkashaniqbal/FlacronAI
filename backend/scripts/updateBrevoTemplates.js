/**
 * Updates the footer address in all Brevo templates.
 * Run: node scripts/updateBrevoTemplates.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const API_KEY  = process.env.BREVO_API_KEY;
const SITE_URL = process.env.FRONTEND_URL || 'https://flacronai.com';

const brevo = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: { 'api-key': API_KEY, 'content-type': 'application/json' },
});

const TEMPLATE_IDS = { WELCOME: 10, PASSWORD_RESET: 11, PAYMENT_FAILED: 12, TEAM_INVITE: 13, SALES_LEAD: 14 };

const OLD_FOOTER = `© 2026 Flacron Enterprises · Tampa, FL 33601`;
const NEW_FOOTER = `© 2026 Flacron Enterprises · 410 E 95th St, Brooklyn, NY 11212`;

async function updateAll() {
  for (const [key, id] of Object.entries(TEMPLATE_IDS)) {
    try {
      const { data: tpl } = await brevo.get(`/smtp/templates/${id}`);
      if (!tpl.htmlContent.includes(OLD_FOOTER)) {
        console.log(`${key} (${id}) — footer already updated, skipping`);
        continue;
      }
      const updatedHtml = tpl.htmlContent.replace(OLD_FOOTER, NEW_FOOTER);
      await brevo.put(`/smtp/templates/${id}`, { htmlContent: updatedHtml });
      console.log(`✅  ${key} (${id}) — footer updated`);
    } catch (err) {
      console.error(`❌  ${key} (${id}):`, err.response?.data || err.message);
    }
  }
  console.log('\nDone.');
}

updateAll();
