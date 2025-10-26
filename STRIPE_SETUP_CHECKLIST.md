# Stripe Setup Checklist

Complete these steps to activate payments in your FlacronCV application.

---

## ☐ Step 1: Create Stripe Account

- [ ] Go to https://stripe.com
- [ ] Sign up for a free account
- [ ] Verify your email address
- [ ] Complete account setup

---

## ☐ Step 2: Get API Keys

- [ ] Log into Stripe Dashboard: https://dashboard.stripe.com
- [ ] Navigate to **Developers** → **API keys**
- [ ] Locate your **Secret key** (starts with `sk_test_` for test mode)
- [ ] Copy the secret key

**Important:** Keep this key secure! Never commit it to version control.

---

## ☐ Step 3: Create Products & Prices

### Professional Plan ($39.99/month)

- [ ] In Stripe Dashboard, go to **Products**
- [ ] Click **+ Add product**
- [ ] Fill in details:
  - **Name:** FlacronAI Professional
  - **Description:** For individual professionals and adjusters
  - **Pricing:**
    - Model: Standard pricing
    - Price: $39.99 USD
    - Billing period: Monthly
    - Recurring
- [ ] Click **Save product**
- [ ] Copy the **Price ID** (starts with `price_`)
- [ ] Save this ID - you'll need it for the .env file

### Agency Plan ($99.99/month)

- [ ] Click **+ Add product** again
- [ ] Fill in details:
  - **Name:** FlacronAI Agency
  - **Description:** For small agencies and teams
  - **Pricing:**
    - Model: Standard pricing
    - Price: $99.99 USD
    - Billing period: Monthly
    - Recurring
- [ ] Click **Save product**
- [ ] Copy the **Price ID**

### Enterprise Plan ($499/month)

- [ ] Click **+ Add product** again
- [ ] Fill in details:
  - **Name:** FlacronAI Enterprise
  - **Description:** For large enterprises and insurance companies
  - **Pricing:**
    - Model: Standard pricing
    - Price: $499 USD
    - Billing period: Monthly
    - Recurring
- [ ] Click **Save product**
- [ ] Copy the **Price ID**

---

## ☐ Step 4: Update Environment Variables

- [ ] Open `backend/.env` in your code editor
- [ ] Replace the placeholder values:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_TEMP_FOR_NOW

# Stripe Price IDs
STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_ID
STRIPE_PRICE_AGENCY=price_YOUR_AGENCY_ID
STRIPE_PRICE_ENTERPRISE=price_YOUR_ENTERPRISE_ID
```

- [ ] Save the file
- [ ] **Do not commit this file to Git!**

---

## ☐ Step 5: Test Local Checkout

### Start Your Servers

- [ ] Open terminal
- [ ] Navigate to project root: `cd C:\Users\pc\Desktop\FlacronCV`
- [ ] Start backend: `npm start`
- [ ] Open new terminal
- [ ] Start frontend: `cd frontend && npm run dev`

### Test the Checkout Flow

- [ ] Open browser to http://localhost:5173
- [ ] Sign up for a new account
- [ ] Navigate to Checkout page
- [ ] Click "Upgrade to Professional"
- [ ] You should be redirected to Stripe checkout page
- [ ] Use test card: **4242 4242 4242 4242**
  - Expiry: Any future date (e.g., 12/25)
  - CVC: Any 3 digits (e.g., 123)
  - Name: Test User
  - Email: Your email
- [ ] Complete the checkout
- [ ] You should be redirected back to your app with success message

**If checkout works:** ✅ Proceed to Step 6

**If checkout fails:** Check:
- Backend console for errors
- Stripe keys are correct in .env
- Price IDs are correct
- Backend server is running

---

## ☐ Step 6: Set Up Webhooks (For Local Development)

### Install Stripe CLI

**Windows:**
- [ ] Download from: https://github.com/stripe/stripe-cli/releases/latest
- [ ] Extract the .exe file
- [ ] Add to PATH or run from download location

**Mac (with Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# See: https://stripe.com/docs/stripe-cli#install
```

### Configure Webhook Forwarding

- [ ] Open new terminal
- [ ] Login to Stripe CLI: `stripe login`
- [ ] Follow the prompts to authenticate
- [ ] Forward webhooks to your local server:
  ```bash
  stripe listen --forward-to localhost:3000/api/payment/webhook
  ```
- [ ] Copy the **webhook signing secret** that appears (starts with `whsec_`)
- [ ] Update `backend/.env`:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
  ```
- [ ] Restart your backend server
- [ ] Keep the webhook forwarding terminal open while testing

---

## ☐ Step 7: Test Complete Payment Flow

- [ ] Start all services:
  - Backend server
  - Frontend dev server
  - Stripe CLI webhook forwarding

- [ ] Sign in to your app
- [ ] Go to Checkout page
- [ ] Upgrade to Professional tier
- [ ] Complete payment with test card
- [ ] Watch the webhook terminal - you should see events
- [ ] Check backend console - should show "User upgraded to professional tier"
- [ ] Check your app - your tier should be updated
- [ ] Verify in Firebase console that user tier was updated

**If everything works:** ✅ Setup complete!

---

## ☐ Step 8: Production Webhook Setup (When Ready to Deploy)

### Create Production Webhook Endpoint

- [ ] Deploy your app to production server
- [ ] In Stripe Dashboard, go to **Developers** → **Webhooks**
- [ ] Click **+ Add endpoint**
- [ ] Enter endpoint URL: `https://yourdomain.com/api/payment/webhook`
- [ ] Select events to listen for:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.paid`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] Copy the **Signing secret**
- [ ] Update production `.env` with the new webhook secret
- [ ] Deploy updated .env to production

---

## ☐ Step 9: Switch to Live Mode (Production Only)

### When Ready for Real Payments

- [ ] In Stripe Dashboard, toggle from **Test mode** to **Live mode**
- [ ] Go to **Developers** → **API keys**
- [ ] Copy your **Live secret key** (starts with `sk_live_`)
- [ ] Update production `.env`:
  ```env
  STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
  ```
- [ ] Repeat Step 3 to create products in **Live mode**
- [ ] Update `.env` with **Live mode Price IDs**
- [ ] Set up webhook endpoint for live mode (Step 8)
- [ ] Test with a real card (small amount)
- [ ] Refund the test payment if needed

**Important:** Never use live keys in development!

---

## ☐ Step 10: Final Verification

### Verify All Features Work

- [ ] User can sign up
- [ ] User can upgrade to paid tier
- [ ] Payment is processed by Stripe
- [ ] User tier is updated in database after payment
- [ ] User can access paid features
- [ ] Webhooks are received and processed
- [ ] Subscription renewals work (test in Stripe Dashboard)
- [ ] Subscription cancellation works
- [ ] User is downgraded after cancellation

---

## Troubleshooting Guide

### Issue: "Stripe is not defined"
**Solution:**
- Verify `STRIPE_SECRET_KEY` is set in `backend/.env`
- Restart backend server after updating .env

### Issue: "Invalid price ID"
**Solution:**
- Check that Price IDs in .env match those in Stripe Dashboard
- Ensure you're using the correct mode (test vs live)
- Price IDs are different between test and live modes

### Issue: "Webhook signature verification failed"
**Solution:**
- For local development: Use Stripe CLI webhook forwarding
- For production: Verify webhook secret matches Stripe Dashboard
- Ensure webhook endpoint is accessible from internet (production)

### Issue: "User not upgraded after successful payment"
**Solution:**
- Check backend logs for webhook processing errors
- Verify webhook events are being received
- Check Firebase console for user data updates
- Ensure webhook signing secret is correct

### Issue: "Cannot POST /api/payment/create-checkout-session"
**Solution:**
- Verify backend server is running
- Check that payment routes are loaded in server.js
- Verify frontend is sending correct API URL

---

## Support & Resources

### Stripe Resources
- **Dashboard:** https://dashboard.stripe.com
- **Documentation:** https://stripe.com/docs
- **Testing:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api

### Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Authentication Required:** 4000 0025 0000 3155
- **Insufficient Funds:** 4000 0000 0000 9995

### Project Documentation
- `PROJECT_CLEANUP_AND_STRIPE_SETUP.md` - Full documentation
- `QUICK_START_GUIDE.md` - Quick reference guide
- `backend/routes/payment.js` - Payment implementation

---

## Checklist Summary

- [ ] Created Stripe account
- [ ] Got API keys
- [ ] Created 3 products with prices
- [ ] Updated .env file
- [ ] Tested local checkout
- [ ] Set up webhook forwarding
- [ ] Tested complete payment flow
- [ ] (Production) Set up production webhook
- [ ] (Production) Switched to live mode
- [ ] Final verification complete

---

**Once all checkboxes are complete, your Stripe integration is ready! 🎉**

For questions or issues, refer to the full documentation or contact support@flacronenterprises.com
