require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentFailedEmail,
  sendTeamInviteEmail,
  sendSalesNotificationEmail,
} = require('../services/emailService');

async function run() {
  const to = 'marketing@flacronenterprises.com';

  const tests = [
    ['WELCOME',        () => sendWelcomeEmail(to, 'Marcus')],
    ['PASSWORD_RESET', () => sendPasswordResetEmail(to, 'https://flacronai.com/reset?token=abc123')],
    ['PAYMENT_FAILED', () => sendPaymentFailedEmail(to, 'Marcus')],
    ['TEAM_INVITE',    () => sendTeamInviteEmail(to, 'Alex Morgan', 'editor', 'https://flacronai.com/invite/token123')],
    ['SALES_LEAD',     () => sendSalesNotificationEmail({ name: 'John Smith', email: 'john@example.com', company: 'ABC Insurance', phone: '555-1234', companyType: 'Agency', monthlyVolume: '50-100', message: 'Interested in enterprise plan.' })],
  ];

  for (const [name, fn] of tests) {
    try {
      const r = await fn();
      console.log(`${name.padEnd(16)} ✅  messageId: ${r.messageId}`);
    } catch (err) {
      console.error(`${name.padEnd(16)} ❌  ${JSON.stringify(err.response?.data || err.message)}`);
    }
  }
}

run();
